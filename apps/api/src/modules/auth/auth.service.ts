import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload, Role } from '@vidyaai/shared';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';

const OTP_TTL_MS = 10 * 60 * 1000;
const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
const MAX_OTP_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  async login(tenantId: string, dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email, isActive: true },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const requiresMfa = user.role === 'SUPER_ADMIN' || user.mfaEnabled;
    if (requiresMfa) {
      return this.issueMfaChallenge(user.id, user.tenantId, user.role as Role, user.email);
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    return { accessToken: this.signFull(user.id, user.tenantId, user.role as Role, user.email) };
  }

  async sendOtp(mfaToken: string) {
    const payload = this.decodeMfaToken(mfaToken);
    return this.issueMfaChallenge(payload.sub, payload.tenantId, payload.role, payload.email);
  }

  async verifyOtp(mfaToken: string, code: string) {
    const payload = this.decodeMfaToken(mfaToken);
    const userId = payload.sub;

    const challenge = await this.prisma.mfaChallenge.findFirst({
      where: { userId, type: 'EMAIL_OTP', usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) throw new UnauthorizedException('OTP expired. Request a new one.');
    if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
      await this.prisma.mfaChallenge.update({ where: { id: challenge.id }, data: { usedAt: new Date() } });
      throw new UnauthorizedException('Too many failed attempts. Request a new OTP.');
    }

    if (challenge.code !== this.hash(code)) {
      await this.prisma.mfaChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.prisma.mfaChallenge.update({ where: { id: challenge.id }, data: { usedAt: new Date() } });
    await this.prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });

    return { accessToken: this.signFull(userId, payload.tenantId, payload.role, payload.email) };
  }

  async requestMagicLink(tenantCode: string, email: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { code: tenantCode.toLowerCase() } });

    const user = tenant?.isActive
      ? await this.prisma.user.findFirst({ where: { tenantId: tenant.id, email, isActive: true } })
      : null;

    if (!user) return { sent: true };

    await this.checkRateLimit(user.id);

    await this.prisma.mfaChallenge.updateMany({
      where: { userId: user.id, type: 'MAGIC_LINK', usedAt: null },
      data: { usedAt: new Date() },
    });

    const rawToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS);

    await this.prisma.mfaChallenge.create({
      data: { userId: user.id, code: this.hash(rawToken), type: 'MAGIC_LINK', expiresAt },
    });

    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3001');
    const magicLink = `${frontendUrl}/auth/magic?token=${rawToken}&tenant=${tenantCode}`;

    await this.notificationsQueue.add('send-mfa-email', {
      to: user.email, type: 'MAGIC_LINK', value: magicLink,
    }).catch(() => null);

    const devPayload = this.config.get('NODE_ENV') !== 'production' ? { _devToken: rawToken } : {};
    return { sent: true, ...devPayload };
  }

  async verifyMagicLink(rawToken: string, tenantCode: string) {
    const challenge = await this.prisma.mfaChallenge.findFirst({
      where: { code: this.hash(rawToken), type: 'MAGIC_LINK', usedAt: null, expiresAt: { gt: new Date() } },
      include: { user: { select: { id: true, tenantId: true, role: true, email: true, isActive: true } } },
    });

    if (!challenge || !challenge.user.isActive) {
      throw new UnauthorizedException('Magic link is invalid or has expired.');
    }

    if (tenantCode) {
      const tenant = await this.prisma.tenant.findUnique({ where: { code: tenantCode.toLowerCase() } });
      if (!tenant || tenant.id !== challenge.user.tenantId) {
        throw new UnauthorizedException('Magic link is invalid.');
      }
    }

    await this.prisma.mfaChallenge.update({ where: { id: challenge.id }, data: { usedAt: new Date() } });
    await this.prisma.user.update({ where: { id: challenge.user.id }, data: { lastLoginAt: new Date() } });

    const { user } = challenge;
    return { accessToken: this.signFull(user.id, user.tenantId, user.role as Role, user.email) };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  // ─── Internals ───────────────────────────────────────────────────────────────

  private async issueMfaChallenge(userId: string, tenantId: string, role: Role, email: string) {
    await this.checkRateLimit(userId);

    await this.prisma.mfaChallenge.updateMany({
      where: { userId, type: 'EMAIL_OTP', usedAt: null },
      data: { usedAt: new Date() },
    });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await this.prisma.mfaChallenge.create({
      data: { userId, code: this.hash(otp), type: 'EMAIL_OTP', expiresAt },
    });

    await this.notificationsQueue.add('send-mfa-email', { to: email, type: 'OTP', value: otp }).catch(() => null);

    const mfaToken = this.jwt.sign(
      { sub: userId, tenantId, role, email, mfaPending: true },
      { expiresIn: '5m' },
    );

    const devPayload = this.config.get('NODE_ENV') !== 'production' ? { _devCode: otp } : {};
    return { mfaRequired: true, mfaToken, ...devPayload };
  }

  private decodeMfaToken(mfaToken: string): JwtPayload {
    try {
      const payload = this.jwt.verify<JwtPayload>(mfaToken);
      if (!payload.mfaPending) throw new Error('not an mfa token');
      return payload;
    } catch {
      throw new UnauthorizedException('MFA session expired. Please log in again.');
    }
  }

  private async checkRateLimit(userId: string) {
    const cutoff = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    const count = await this.prisma.mfaChallenge.count({
      where: { userId, createdAt: { gte: cutoff }, usedAt: null },
    });
    if (count >= RATE_LIMIT_MAX) {
      throw new HttpException('Too many requests. Please try again in 10 minutes.', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private signFull(sub: string, tenantId: string, role: Role, email: string): string {
    const payload: JwtPayload = { sub, tenantId, role, email };
    return this.jwt.sign(payload);
  }
}

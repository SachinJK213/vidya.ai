import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtPayload, Role } from '@vidyaai/shared';

const USER_SELECT = {
  id: true,
  tenantId: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  phone: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async create(tenantId: string, caller: JwtPayload, dto: CreateUserDto) {
    this.assertCanCreate(caller, dto.role);

    const license = await this.prisma.tenantLicense.findUnique({ where: { tenantId } });
    if (license) {
      const userCount = await this.prisma.user.count({ where: { tenantId, isActive: true } });
      if (userCount >= license.maxUsers)
        throw new ForbiddenException(`License limit reached: this plan allows up to ${license.maxUsers} users`);
    }

    const exists = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email } },
    });
    if (exists) throw new ConflictException('Email already registered in this tenant');

    const passwordHash = await this.authService.hashPassword(dto.password);
    return this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        passwordHash,
        role: dto.role as any,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
      select: USER_SELECT,
    });
  }

  async findAll(tenantId: string, page = 1, limit = 20, role?: Role) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (role) where.role = role;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: USER_SELECT,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(tenantId, id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: USER_SELECT,
    });
  }

  async updateProfile(tenantId: string, id: string, dto: UpdateProfileDto) {
    await this.findOne(tenantId, id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: USER_SELECT,
    });
  }

  async changePassword(tenantId: string, id: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await this.authService.verifyPassword(currentPassword, user.passwordHash);
    if (!valid) throw new ForbiddenException('Current password is incorrect');

    const passwordHash = await this.authService.hashPassword(newPassword);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    return { success: true };
  }

  async deactivate(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: USER_SELECT,
    });
  }

  private assertCanCreate(caller: JwtPayload, targetRole: Role) {
    const allowedCreations: Record<Role, Role[]> = {
      [Role.SUPER_ADMIN]: [Role.SCHOOL_ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT],
      [Role.SCHOOL_ADMIN]: [Role.TEACHER, Role.PARENT, Role.STUDENT],
      [Role.TEACHER]: [],
      [Role.PARENT]: [],
      [Role.STUDENT]: [],
    };

    if (!allowedCreations[caller.role]?.includes(targetRole)) {
      throw new ForbiddenException(`You cannot create a user with role ${targetRole}`);
    }
  }
}

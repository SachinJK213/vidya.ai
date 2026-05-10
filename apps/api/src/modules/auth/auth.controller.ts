import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { LoginDto } from './dto/login.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';
import { RequestMagicLinkDto } from './dto/request-magic-link.dto';
import { VerifyMagicLinkDto } from './dto/verify-magic-link.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@TenantId() tenantId: string, @Body() dto: LoginDto) {
    return this.authService.login(tenantId, dto);
  }

  /** Resend OTP — caller passes the mfaToken from the login response */
  @Post('mfa/send')
  @HttpCode(HttpStatus.OK)
  sendOtp(@Body('mfaToken') mfaToken: string) {
    return this.authService.sendOtp(mfaToken);
  }

  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyMfaDto) {
    return this.authService.verifyOtp(dto.mfaToken, dto.code);
  }

  /** Passwordless: request a sign-in link sent to email */
  @Post('magic/request')
  @HttpCode(HttpStatus.OK)
  requestMagicLink(@Body() dto: RequestMagicLinkDto) {
    return this.authService.requestMagicLink(dto.tenantCode, dto.email);
  }

  @Post('magic/verify')
  @HttpCode(HttpStatus.OK)
  verifyMagicLink(@Body() dto: VerifyMagicLinkDto) {
    return this.authService.verifyMagicLink(dto.token, dto.tenantCode);
  }

}

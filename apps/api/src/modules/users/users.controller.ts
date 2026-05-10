import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';

class ChangePasswordDto {
  @IsString() currentPassword: string;
  @IsString() @MinLength(8) newPassword: string;
}
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, JwtPayload } from '@vidyaai/shared';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@TenantId() tenantId: string, @CurrentUser() caller: JwtPayload) {
    return this.usersService.findOne(tenantId, caller.sub);
  }

  @Patch('me')
  updateMe(
    @TenantId() tenantId: string,
    @CurrentUser() caller: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(tenantId, caller.sub, dto);
  }

  @Post('me/password')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @TenantId() tenantId: string,
    @CurrentUser() caller: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(tenantId, caller.sub, dto.currentPassword, dto.newPassword);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  create(
    @TenantId() tenantId: string,
    @CurrentUser() caller: JwtPayload,
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.create(tenantId, caller, dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  findAll(
    @TenantId() tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('role') role?: Role,
  ) {
    return this.usersService.findAll(tenantId, page, limit, role);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.usersService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  deactivate(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.usersService.deactivate(tenantId, id);
  }
}

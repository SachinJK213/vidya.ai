import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { OnboardTenantDto } from './dto/onboard-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@vidyaai/shared';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Post('onboard')
  @Roles(Role.SUPER_ADMIN)
  onboard(@Body() dto: OnboardTenantDto) {
    return this.tenantsService.onboard(dto);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Get('check-code')
  @Roles(Role.SUPER_ADMIN)
  checkCode(@Query('code') code: string) {
    return this.tenantsService.checkCode(code);
  }

  @Get('by-code/:code')
  @Roles(Role.SUPER_ADMIN)
  findByCode(@Param('code') code: string) {
    return this.tenantsService.findByCode(code);
  }

  @Get('stats')
  @Roles(Role.SUPER_ADMIN)
  getStats() {
    return this.tenantsService.getStats();
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.tenantsService.list(page, limit);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }
}

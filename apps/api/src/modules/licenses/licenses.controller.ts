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
import { LicensesService } from './licenses.service';
import { AssignLicenseDto } from './dto/assign-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, Role } from '@vidyaai/shared';

@Controller('licenses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class LicensesController {
  constructor(private licensesService: LicensesService) {}

  @Post()
  assign(@CurrentUser() user: JwtPayload, @Body() dto: AssignLicenseDto) {
    return this.licensesService.assign(user.sub, dto);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.licensesService.findAll(page, limit);
  }

  @Get('tenant/:tenantId')
  findByTenant(@Param('tenantId') tenantId: string) {
    return this.licensesService.findByTenant(tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLicenseDto) {
    return this.licensesService.update(id, dto);
  }

  @Post(':id/remind')
  sendReminder(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.licensesService.sendReminder(id, user.sub);
  }
}

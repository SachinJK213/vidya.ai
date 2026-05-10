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
import { NotificationService } from './notification.service';
import { SendAnnouncementDto } from './dto/send-announcement.dto';
import { SendEmergencyDto } from './dto/send-emergency.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, JwtPayload } from '@vidyaai/shared';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('announcement')
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  sendAnnouncement(
    @TenantId() tenantId: string,
    @CurrentUser() sender: JwtPayload,
    @Body() dto: SendAnnouncementDto,
  ) {
    return this.notificationService.sendAnnouncement(tenantId, sender, dto);
  }

  @Post('emergency')
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  sendEmergency(
    @TenantId() tenantId: string,
    @CurrentUser() sender: JwtPayload,
    @Body() dto: SendEmergencyDto,
  ) {
    return this.notificationService.sendEmergency(tenantId, sender, dto);
  }

  @Get('unread-count')
  @Roles(Role.PARENT, Role.TEACHER, Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  getUnreadCount(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.notificationService.getUnreadCount(tenantId, user.sub);
  }

  @Get('my')
  @Roles(Role.PARENT, Role.TEACHER, Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  listMine(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.notificationService.listForRecipient(tenantId, user.sub, page, limit);
  }

  @Patch('read-all')
  @Roles(Role.PARENT, Role.TEACHER, Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  markAllRead(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.notificationService.markAllRead(tenantId, user.sub);
  }

  @Patch(':id/read')
  @Roles(Role.PARENT, Role.TEACHER, Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  markAsRead(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.notificationService.markAsRead(tenantId, user.sub, id);
  }

  @Patch(':id/approve')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  approveAiDraft(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.notificationService.approveAiDraft(tenantId, user.sub, id);
  }
}

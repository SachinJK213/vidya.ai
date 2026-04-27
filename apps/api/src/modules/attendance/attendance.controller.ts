import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, JwtPayload } from '@vidyaai/shared';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('mark')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  markBulk(
    @TenantId() tenantId: string,
    @CurrentUser() teacher: JwtPayload,
    @Body() dto: MarkAttendanceDto,
  ) {
    return this.attendanceService.markBulk(tenantId, teacher, dto);
  }

  @Get()
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  findByDate(
    @TenantId() tenantId: string,
    @Query('date') date: string,
    @Query('grade') grade?: string,
    @Query('section') section?: string,
  ) {
    return this.attendanceService.findByDate(tenantId, date, grade, section);
  }

  @Get('student/:studentId')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN, Role.SUPER_ADMIN, Role.PARENT)
  findForStudent(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
  ) {
    return this.attendanceService.findForStudent(tenantId, studentId, page, limit);
  }

  @Get('student/:studentId/weekly-summary')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN, Role.SUPER_ADMIN, Role.PARENT)
  getWeeklySummary(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Query('weekStart') weekStart: string,
  ) {
    return this.attendanceService.getWeeklySummary(tenantId, studentId, weekStart);
  }

  @Post('student/:studentId/ai-summary')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  generateAiWeeklySummary(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Query('weekStart') weekStart: string,
  ) {
    return this.attendanceService.generateAiWeeklySummary(tenantId, studentId, weekStart);
  }
}

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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateFamilyDto } from './dto/create-family.dto';
import { AddFamilyMemberDto } from './dto/add-family-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, JwtPayload } from '@vidyaai/shared';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  // ─── Families ────────────────────────────────────────────────────────────────

  @Post('families')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  createFamily(@TenantId() tenantId: string, @Body() dto: CreateFamilyDto) {
    return this.studentsService.createFamily(tenantId, dto);
  }

  @Get('families/:id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  findFamily(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.studentsService.findFamily(tenantId, id);
  }

  @Post('families/:id/members')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  addFamilyMember(
    @TenantId() tenantId: string,
    @Param('id') familyId: string,
    @Body() dto: AddFamilyMemberDto,
  ) {
    return this.studentsService.addFamilyMember(tenantId, familyId, dto);
  }

  // ─── Students ────────────────────────────────────────────────────────────────

  @Post('students')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  create(@TenantId() tenantId: string, @Body() dto: CreateStudentDto) {
    return this.studentsService.create(tenantId, dto);
  }

  @Get('students/my-children')
  @Roles(Role.PARENT)
  getMyChildren(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.studentsService.findByParent(tenantId, user.sub);
  }

  @Get('students')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  findAll(
    @TenantId() tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('grade') grade?: string,
    @Query('section') section?: string,
  ) {
    return this.studentsService.findAll(tenantId, page, limit, grade, section);
  }

  @Get('students/:id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.studentsService.findOne(tenantId, id);
  }

  @Patch('students/:id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.update(tenantId, id, dto);
  }
}

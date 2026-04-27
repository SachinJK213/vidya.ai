import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateFamilyDto } from './dto/create-family.dto';
import { AddFamilyMemberDto } from './dto/add-family-member.dto';
import { randomBytes } from 'crypto';

const STUDENT_SELECT = {
  id: true,
  tenantId: true,
  admissionNo: true,
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  gender: true,
  grade: true,
  section: true,
  rollNo: true,
  enrollmentDate: true,
  isActive: true,
  family: {
    select: {
      id: true,
      familyCode: true,
      members: {
        select: {
          relationship: true,
          isPrimary: true,
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        },
      },
    },
  },
};

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  // ─── Families ────────────────────────────────────────────────────────────────

  async createFamily(tenantId: string, dto: CreateFamilyDto) {
    const familyCode = dto.familyCode ?? randomBytes(4).toString('hex').toUpperCase();

    const existing = await this.prisma.family.findUnique({
      where: { tenantId_familyCode: { tenantId, familyCode } },
    });
    if (existing) throw new ConflictException('Family code already exists in this tenant');

    return this.prisma.family.create({
      data: { tenantId, familyCode },
      select: { id: true, familyCode: true, tenantId: true, createdAt: true },
    });
  }

  async findFamily(tenantId: string, familyId: string) {
    const family = await this.prisma.family.findFirst({
      where: { id: familyId, tenantId },
      select: {
        id: true,
        familyCode: true,
        createdAt: true,
        members: {
          select: {
            relationship: true,
            isPrimary: true,
            user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true } },
          },
        },
        students: { select: { id: true, firstName: true, lastName: true, grade: true, section: true, isActive: true } },
      },
    });
    if (!family) throw new NotFoundException('Family not found');
    return family;
  }

  async addFamilyMember(tenantId: string, familyId: string, dto: AddFamilyMemberDto) {
    await this.findFamily(tenantId, familyId);

    const userExists = await this.prisma.user.findFirst({
      where: { id: dto.userId, tenantId },
    });
    if (!userExists) throw new NotFoundException('User not found in this tenant');

    return this.prisma.familyMember.upsert({
      where: { familyId_userId: { familyId, userId: dto.userId } },
      create: {
        familyId,
        userId: dto.userId,
        relationship: dto.relationship,
        isPrimary: dto.isPrimary ?? false,
      },
      update: {
        relationship: dto.relationship,
        isPrimary: dto.isPrimary ?? false,
      },
    });
  }

  // ─── Students ────────────────────────────────────────────────────────────────

  async create(tenantId: string, dto: CreateStudentDto) {
    const familyExists = await this.prisma.family.findFirst({
      where: { id: dto.familyId, tenantId },
    });
    if (!familyExists) throw new NotFoundException('Family not found in this tenant');

    const admissionExists = await this.prisma.student.findUnique({
      where: { tenantId_admissionNo: { tenantId, admissionNo: dto.admissionNo } },
    });
    if (admissionExists) throw new ConflictException('Admission number already exists');

    return this.prisma.student.create({
      data: {
        tenantId,
        familyId: dto.familyId,
        admissionNo: dto.admissionNo,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender as any,
        grade: dto.grade,
        section: dto.section,
        rollNo: dto.rollNo,
      },
      select: STUDENT_SELECT,
    });
  }

  async findAll(tenantId: string, page = 1, limit = 20, grade?: string, section?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId, isActive: true };
    if (grade) where.grade = grade;
    if (section) where.section = section;

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ grade: 'asc' }, { lastName: 'asc' }],
        select: STUDENT_SELECT,
      }),
      this.prisma.student.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId },
      select: STUDENT_SELECT,
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async findByParent(tenantId: string, userId: string) {
    const memberships = await this.prisma.familyMember.findMany({
      where: { userId, family: { tenantId } },
      select: { familyId: true },
    });
    const familyIds = memberships.map((m) => m.familyId);

    return this.prisma.student.findMany({
      where: { tenantId, familyId: { in: familyIds }, isActive: true },
      orderBy: [{ grade: 'asc' }, { lastName: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        grade: true,
        section: true,
        admissionNo: true,
        isActive: true,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateStudentDto) {
    await this.findOne(tenantId, id);
    return this.prisma.student.update({
      where: { id },
      data: dto,
      select: STUDENT_SELECT,
    });
  }
}

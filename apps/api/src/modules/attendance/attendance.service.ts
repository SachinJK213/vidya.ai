import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { JwtPayload, AttendanceStatus } from '@vidyaai/shared';

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  async markBulk(tenantId: string, teacher: JwtPayload, dto: MarkAttendanceDto) {
    const date = new Date(dto.date);

    const results = await Promise.all(
      dto.entries.map((entry) =>
        this.prisma.attendanceEvent.upsert({
          where: {
            tenantId_studentId_date: {
              tenantId,
              studentId: entry.studentId,
              date,
            },
          },
          create: {
            tenantId,
            studentId: entry.studentId,
            date,
            status: entry.status as any,
            markedById: teacher.sub,
            note: entry.note,
          },
          update: {
            status: entry.status as any,
            markedById: teacher.sub,
            note: entry.note,
          },
          select: {
            id: true,
            studentId: true,
            date: true,
            status: true,
            note: true,
          },
        }),
      ),
    );

    // Queue absence alerts for absent students
    const absentEntries = dto.entries.filter(
      (e) => e.status === AttendanceStatus.ABSENT,
    );
    for (const entry of absentEntries) {
      await this.notificationQueue.add('absence-alert', {
        tenantId,
        studentId: entry.studentId,
        date: dto.date,
        teacherId: teacher.sub,
      });
    }

    return { marked: results.length, results };
  }

  async findByDate(tenantId: string, date: string, grade?: string, section?: string, limit = 200) {
    const studentWhere: any = { tenantId, isActive: true };
    if (grade) studentWhere.grade = grade;
    if (section) studentWhere.section = section;

    const students = await this.prisma.student.findMany({
      where: studentWhere,
      take: Math.min(limit, 500),
      select: { id: true, firstName: true, lastName: true, admissionNo: true, grade: true, section: true, rollNo: true },
      orderBy: [{ grade: 'asc' }, { rollNo: 'asc' }, { lastName: 'asc' }],
    });

    const eventDate = new Date(date);
    const events = await this.prisma.attendanceEvent.findMany({
      where: {
        tenantId,
        date: eventDate,
        studentId: { in: students.map((s) => s.id) },
      },
      select: { studentId: true, status: true, note: true, markedById: true },
    });

    const eventMap = new Map(events.map((e) => [e.studentId, e]));

    return students.map((s) => ({
      ...s,
      attendance: eventMap.get(s.id) ?? null,
    }));
  }

  async findForStudent(tenantId: string, studentId: string, page = 1, limit = 30) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      select: { id: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    const skip = (page - 1) * limit;
    const where = { tenantId, studentId };

    const [data, total] = await Promise.all([
      this.prisma.attendanceEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        select: {
          id: true,
          date: true,
          status: true,
          note: true,
          markedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.attendanceEvent.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getWeeklySummary(tenantId: string, studentId: string, weekStart: string) {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      select: { id: true, firstName: true, lastName: true, grade: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    const events = await this.prisma.attendanceEvent.findMany({
      where: {
        tenantId,
        studentId,
        date: { gte: start, lt: end },
      },
      select: { date: true, status: true },
      orderBy: { date: 'asc' },
    });

    const totalDays = events.length;
    const presentDays = events.filter((e) => e.status === 'PRESENT').length;
    const absenceDates = events
      .filter((e) => e.status === 'ABSENT')
      .map((e) => e.date.toISOString().split('T')[0]);

    return {
      student,
      weekStart,
      totalDays,
      presentDays,
      absenceDates,
      attendancePct: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null,
    };
  }

  async generateAiWeeklySummary(tenantId: string, studentId: string, weekStart: string) {
    const summary = await this.getWeeklySummary(tenantId, studentId, weekStart);

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    });

    const aiText = await this.aiService.summarizeWeeklyAttendance({
      studentName: `${summary.student.firstName} ${summary.student.lastName}`,
      grade: summary.student.grade,
      presentDays: summary.presentDays,
      totalDays: summary.totalDays,
      absenceDates: summary.absenceDates,
      schoolName: tenant?.name ?? '',
    });

    const primaryParent = await this.prisma.familyMember.findFirst({
      where: {
        isPrimary: true,
        family: { students: { some: { id: studentId } } },
      },
      select: { userId: true },
    });

    let notificationEventId: string | null = null;
    if (primaryParent && aiText) {
      const event = await this.prisma.notificationEvent.create({
        data: {
          tenantId,
          type: 'AI_WEEKLY_SUMMARY',
          channel: 'EMAIL',
          recipientId: primaryParent.userId,
          isAiDraft: true,
          payload: {
            studentName: `${summary.student.firstName} ${summary.student.lastName}`,
            grade: summary.student.grade,
            weekStart,
            presentDays: summary.presentDays,
            totalDays: summary.totalDays,
            absenceDates: summary.absenceDates,
            aiSummary: aiText,
          },
        },
        select: { id: true },
      });
      notificationEventId = event.id;
    }

    return {
      ...summary,
      isAiDraft: true,
      aiSummary: aiText,
      notificationEventId,
    };
  }
}

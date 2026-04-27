import { Injectable, Inject, Logger } from '@nestjs/common';
import { IAiProvider, AI_PROVIDER } from './providers/ai.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @Inject(AI_PROVIDER) private readonly provider: IAiProvider | null,
  ) {}

  get isEnabled(): boolean {
    return !!this.provider?.isAvailable();
  }

  async summarizeWeeklyAttendance(context: {
    studentName: string;
    grade: string;
    presentDays: number;
    totalDays: number;
    absenceDates: string[];
    schoolName: string;
  }): Promise<string | null> {
    if (!this.isEnabled) return null;

    const { studentName, grade, presentDays, totalDays, absenceDates, schoolName } = context;
    const attendancePct = Math.round((presentDays / totalDays) * 100);

    const result = await this.provider!.complete({
      systemPrompt:
        'You are a school communication assistant. Write concise, warm, factual summaries for parents. Never invent data. 2-3 sentences max.',
      prompt: `Write a weekly attendance summary for a parent.
Student: ${studentName}, Grade: ${grade}, School: ${schoolName}
This week: ${presentDays}/${totalDays} days present (${attendancePct}%)
${absenceDates.length > 0 ? `Absent on: ${absenceDates.join(', ')}` : 'No absences this week'}
Tone: informative and supportive.`,
      maxTokens: 150,
    });

    return result.text;
  }

  async draftAbsenceNotification(context: {
    studentName: string;
    grade: string;
    absentDate: string;
    teacherName: string;
  }): Promise<string | null> {
    if (!this.isEnabled) return null;

    const result = await this.provider!.complete({
      systemPrompt:
        'You are a school communication assistant. Draft short, factual parent notifications. Never add made-up reasons. Always mark this as a draft for teacher review.',
      prompt: `Draft an absence notification message for a parent.
Student: ${context.studentName}, Grade: ${context.grade}
Absent on: ${context.absentDate}
Teacher: ${context.teacherName}
Keep under 50 words. Mark it as DRAFT.`,
      maxTokens: 100,
    });

    return result.text;
  }
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ',
  THROTTLED = 'THROTTLED',
}

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  STUDENT = 'STUDENT',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export enum NotificationType {
  ABSENCE_ALERT = 'ABSENCE_ALERT',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  EMERGENCY = 'EMERGENCY',
  ASSIGNMENT_DUE = 'ASSIGNMENT_DUE',
  FEE_REMINDER = 'FEE_REMINDER',
  AI_WEEKLY_SUMMARY = 'AI_WEEKLY_SUMMARY',
  AI_DRAFT_MESSAGE = 'AI_DRAFT_MESSAGE',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
  WHATSAPP = 'WHATSAPP',
}

export enum DeploymentMode {
  SAAS = 'SAAS',
  MICROSAAS = 'MICROSAAS',
  ONPREM = 'ONPREM',
}

export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: Role;
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

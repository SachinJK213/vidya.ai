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
  LICENSE_EXPIRY_REMINDER = 'LICENSE_EXPIRY_REMINDER',
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

export enum LicensePlan {
  TRIAL = 'TRIAL',
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum LicenseStatus {
  ACTIVE = 'ACTIVE',
  EXPIRING_SOON = 'EXPIRING_SOON',
  GRACE_PERIOD = 'GRACE_PERIOD',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED',
}

export const PLAN_DEFAULTS: Record<LicensePlan, { maxStudents: number; maxUsers: number; durationDays: number; features: Record<string, boolean> }> = {
  [LicensePlan.TRIAL]:        { maxStudents: 50,     maxUsers: 10,   durationDays: 30,  features: { aiEnabled: false, smsEnabled: false, whatsappEnabled: false } },
  [LicensePlan.STARTER]:      { maxStudents: 300,    maxUsers: 40,   durationDays: 365, features: { aiEnabled: true,  smsEnabled: false, whatsappEnabled: false } },
  [LicensePlan.PROFESSIONAL]: { maxStudents: 1500,   maxUsers: 150,  durationDays: 365, features: { aiEnabled: true,  smsEnabled: true,  whatsappEnabled: false } },
  [LicensePlan.ENTERPRISE]:   { maxStudents: 999999, maxUsers: 9999, durationDays: 365, features: { aiEnabled: true,  smsEnabled: true,  whatsappEnabled: true  } },
};

export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: Role;
  email: string;
  mfaPending?: boolean;
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

import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LicensePlan, PLAN_DEFAULTS } from '@vidyaai/shared';

export class LicenseFeaturesDto {
  @IsOptional() @IsBoolean() aiEnabled?: boolean;
  @IsOptional() @IsBoolean() smsEnabled?: boolean;
  @IsOptional() @IsBoolean() whatsappEnabled?: boolean;
}

export class AssignLicenseDto {
  @IsString()
  tenantId: string;

  @IsEnum(LicensePlan)
  plan: LicensePlan;

  @IsDateString()
  expiresAt: string;

  @IsOptional() @IsInt() @Min(1) maxStudents?: number;
  @IsOptional() @IsInt() @Min(1) maxUsers?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => LicenseFeaturesDto)
  features?: LicenseFeaturesDto;

  @IsOptional() @IsString() notes?: string;

  resolvedMaxStudents(plan: LicensePlan): number {
    return this.maxStudents ?? PLAN_DEFAULTS[plan].maxStudents;
  }

  resolvedMaxUsers(plan: LicensePlan): number {
    return this.maxUsers ?? PLAN_DEFAULTS[plan].maxUsers;
  }

  resolvedFeatures(plan: LicensePlan): Record<string, boolean> {
    return { ...PLAN_DEFAULTS[plan].features, ...(this.features ?? {}) };
  }
}

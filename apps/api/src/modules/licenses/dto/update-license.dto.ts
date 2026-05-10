import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LicensePlan } from '@vidyaai/shared';
import { LicenseFeaturesDto } from './assign-license.dto';

export class UpdateLicenseDto {
  @IsOptional() @IsEnum(LicensePlan) plan?: LicensePlan;
  @IsOptional() @IsDateString() expiresAt?: string;
  @IsOptional() @IsInt() @Min(1) maxStudents?: number;
  @IsOptional() @IsInt() @Min(1) maxUsers?: number;
  @IsOptional() @ValidateNested() @Type(() => LicenseFeaturesDto) features?: LicenseFeaturesDto;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsEnum(['ACTIVE', 'SUSPENDED']) status?: 'ACTIVE' | 'SUSPENDED';
}

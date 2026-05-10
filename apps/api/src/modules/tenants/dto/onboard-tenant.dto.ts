import {
  IsString,
  IsOptional,
  IsEnum,
  IsUrl,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { DeploymentMode } from '@vidyaai/shared';

export class OnboardTenantDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'code must be lowercase alphanumeric with hyphens' })
  @MinLength(2)
  @MaxLength(30)
  code: string;

  @IsOptional()
  @IsUrl()
  domain?: string;

  @IsOptional()
  @IsEnum(DeploymentMode)
  deploymentMode?: DeploymentMode;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  adminFirstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  adminLastName: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  @MinLength(8)
  adminPassword: string;
}

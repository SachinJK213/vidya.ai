import {
  IsString,
  IsOptional,
  IsEnum,
  IsUrl,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { DeploymentMode } from '@vidyaai/shared';

export class CreateTenantDto {
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
}

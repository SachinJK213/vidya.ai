import { plainToInstance } from 'class-transformer';
import { IsString, IsEnum, IsOptional, IsBoolean, validateSync } from 'class-validator';

enum DeploymentMode {
  SAAS = 'saas',
  MICROSAAS = 'microsaas',
  ONPREM = 'onprem',
}

class EnvironmentVariables {
  @IsEnum(DeploymentMode)
  DEPLOYMENT_MODE: DeploymentMode = DeploymentMode.SAAS;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  REDIS_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '7d';

  @IsEnum(['s3', 'minio', 'local'])
  @IsOptional()
  STORAGE_PROVIDER: string = 's3';

  @IsEnum(['sendgrid', 'ses', 'smtp'])
  @IsOptional()
  EMAIL_PROVIDER: string = 'smtp';

  @IsEnum(['msg91', 'twilio', 'kannel', 'http_aggregator', 'disabled'])
  @IsOptional()
  SMS_PROVIDER: string = 'disabled';

  @IsEnum(['fcm', 'fcm_proxy', 'disabled'])
  @IsOptional()
  PUSH_PROVIDER: string = 'disabled';

  @IsEnum(['claude', 'ollama', 'disabled'])
  @IsOptional()
  AI_PROVIDER: string = 'claude';

  @IsEnum(['redis_streams', 'kafka', 'rabbitmq'])
  @IsOptional()
  EVENT_BUS_PROVIDER: string = 'redis_streams';
}

export function validateConfig(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validated;
}

import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator';
import { Role } from '@vidyaai/shared';

export class SendAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Role, { each: true })
  targetRoles?: Role[];
}

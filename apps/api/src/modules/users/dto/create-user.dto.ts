import {
  IsEmail,
  IsEnum,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Role } from '@vidyaai/shared';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

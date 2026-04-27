import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Gender } from '@vidyaai/shared';

export class CreateStudentDto {
  @IsString()
  familyId: string;

  @IsString()
  @MaxLength(30)
  admissionNo: string;

  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @MaxLength(20)
  grade: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  section?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  rollNo?: string;
}

import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  grade?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  section?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  rollNo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

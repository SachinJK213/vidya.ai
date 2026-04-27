import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateFamilyDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9-]+$/i, { message: 'familyCode must be alphanumeric' })
  @MaxLength(20)
  familyCode?: string;
}

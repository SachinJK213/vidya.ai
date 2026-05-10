import { IsString, IsBoolean, IsOptional, IsEmail, ValidateIf } from 'class-validator';

export class AddFamilyMemberDto {
  @ValidateIf((o) => !o.userEmail)
  @IsString()
  userId?: string;

  @ValidateIf((o) => !o.userId)
  @IsEmail()
  userEmail?: string;

  @IsString()
  relationship: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

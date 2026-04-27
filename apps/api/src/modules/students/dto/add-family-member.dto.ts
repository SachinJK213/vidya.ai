import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class AddFamilyMemberDto {
  @IsString()
  userId: string;

  @IsString()
  relationship: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class VerifyMfaDto {
  @IsString() @IsNotEmpty() mfaToken: string;
  @IsString() @Length(6, 6) @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit number' }) code: string;
}

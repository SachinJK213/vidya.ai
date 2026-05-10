import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SendEmergencyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;
}

import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class RequestMagicLinkDto {
  @IsString() @IsNotEmpty() tenantCode: string;
  @IsEmail() email: string;
}

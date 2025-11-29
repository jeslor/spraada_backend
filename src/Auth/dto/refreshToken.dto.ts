import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  @IsNumber()
  id: number;
}

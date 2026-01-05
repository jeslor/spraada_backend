import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEmailDto {
  @IsString()
  @IsNotEmpty()
  from: string;
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  to: string[];
  @IsString()
  @IsNotEmpty()
  subject: string;
  @IsString()
  html?: string;
  @IsString()
  text?: string;
}

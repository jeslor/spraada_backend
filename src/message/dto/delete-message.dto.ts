import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class deleteMessageDto {
  @IsNotEmpty()
  message: any;

  @IsNotEmpty()
  @IsNumber()
  profileId: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}

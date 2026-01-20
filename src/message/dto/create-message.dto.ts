import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class MessageMediaDto {
  @IsString()
  mediaUrl: string;
  @IsString()
  mediaUrlKey: string;
}

export class CreateMessageDto {
  @IsNumber()
  @IsNotEmpty()
  senderId: number;
  @IsNumber()
  @IsNotEmpty()
  receiverId: number;
  @IsNotEmpty()
  @IsString()
  content: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageMediaDto)
  mediaFiles?: MessageMediaDto[];
}

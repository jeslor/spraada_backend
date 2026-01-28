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

export class MessageDto {
  @IsNumber()
  @IsNotEmpty()
  senderId: number;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageMediaDto)
  mediaFiles?: MessageMediaDto[];
}

export class CreateMessageDto {
  message: MessageDto;
  @IsNumber()
  @IsNotEmpty()
  otherProfileId: number;

  @IsNumber()
  @IsNotEmpty()
  conversationId: number;
}

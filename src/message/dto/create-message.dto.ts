import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageMediaDto)
  mediaFiles?: MessageMediaDto[];
}

export class CreateMessageDto {
  @ValidateNested() // Tells class-validator to check the object
  @Type(() => MessageDto) // Tells class-transformer how to instantiate it
  @IsNotEmpty()
  message: MessageDto;

  @IsNumber()
  @IsNotEmpty()
  otherProfileId: number;
}

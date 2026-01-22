import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateNotificationMediaDto {
  @IsString()
  mediaUrl: string;
}

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsNumber()
  profileId: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsString()
  link?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateNotificationMediaDto)
  profileMediaFiles?: CreateNotificationMediaDto[];
  contentMediaFiles?: CreateNotificationMediaDto[];
  isRead: boolean;
  createdAt: Date;
}

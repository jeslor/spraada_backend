import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class NotificationMediaDto {
  @IsString()
  mediaUrl: string;
}

export class NotificationDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

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
  @ValidateNested({ each: true })
  @Type(() => NotificationMediaDto)
  profileMediaFiles?: NotificationMediaDto[];
  contentMediaFiles?: NotificationMediaDto[];
  isRead: boolean;
  createdAt: Date;
}

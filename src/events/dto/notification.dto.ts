import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class NotificationMediaDto {
  @IsString()
  mediaUrl: string;
}

export class NotificationDto {
  @IsOptional()
  @IsNumber()
  id?: number;

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
  @Type(() => NotificationMediaDto)
  profileMediaFiles?: NotificationMediaDto[];
  contentMediaFiles?: NotificationMediaDto[];
  isRead: boolean;
  createdAt: Date;
}

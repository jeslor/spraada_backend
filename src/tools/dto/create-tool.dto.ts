import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ToolPhotoDto {
  @IsString()
  @IsNotEmpty()
  photoUrl: string;

  @IsString()
  @IsNotEmpty()
  photoUrlKey: string;
}

export class CreateToolDto {
  @IsNumber()
  @IsNotEmpty()
  profileId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  depositCents: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @IsNotEmpty()
  dailyPriceCents: number;

  @IsNumber()
  @IsNotEmpty()
  replacementValue: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ToolPhotoDto)
  toolPhotos: ToolPhotoDto[];
}

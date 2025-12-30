import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateToolDto {
  @IsNumber()
  @IsNotEmpty()
  ownerId: number;

  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsNumber()
  @IsNotEmpty()
  deposit: number;
  @IsString()
  @IsNotEmpty()
  category: string;
  @IsNumber()
  @IsNotEmpty()
  dailyRate: number;
  @IsNumber()
  @IsNotEmpty()
  replacementValue: number;

  toolPhotos: {
    url: string;
    photoKey: string;
  }[];
}

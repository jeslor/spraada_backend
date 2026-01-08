import { IsInt, IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  toolId: string;

  @IsInt()
  @IsNotEmpty()
  rentedById: number;

  @IsInt()
  @IsNotEmpty()
  borrowedById: number;

  @IsDateString()
  @IsNotEmpty()
  pickUpDate: string;

  @IsDateString()
  @IsNotEmpty()
  returnDate: string;

  @IsInt()
  @IsNotEmpty()
  totalPrice: number;
}

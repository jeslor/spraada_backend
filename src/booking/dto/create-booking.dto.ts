import { IsInt, IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  toolId: string;

  @IsInt()
  @IsNotEmpty()
  renterId: number;

  @IsInt()
  @IsNotEmpty()
  borrowerId: number;

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

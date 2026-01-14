import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto);
  }

  @Get()
  findAll() {
    return this.bookingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Get('profile/:profileId')
  findByProfile(@Param('profileId') profileId: string) {
    return this.bookingService.findByProfile(Number(profileId));
  }

  @Get('tool/:toolId')
  findByTool(@Param('toolId') toolId: string) {
    return this.bookingService.findByTool(toolId);
  }

  @Get('rented/profile/:profileId')
  getRentedToolsByProfile(@Param('profileId') profileId: string) {
    return this.bookingService.getRentedToolsByProfile(Number(profileId));
  }

  @Get('borrowed/profile/:profileId')
  getBorrowedToolsByProfile(@Param('profileId') profileId: string) {
    return this.bookingService.getBorrowedToolsByProfile(Number(profileId));
  }

  @Patch(':id')
  updateBookingStatus(
    @Param('id') id: string,
    @Body() updateData: { status: string },
  ) {
    return this.bookingService.updateBookingStatus(id, updateData.status);
  }

  @Patch(':id/delete')
  markBookingAsDeleted(
    @Param('id') id: string,
    @Body()
    deleteData: { deletedByOwner?: boolean; deletedByBorrower?: boolean },
  ) {
    return this.bookingService.markBookingAsDeleted(
      id,
      deleteData.deletedByOwner,
      deleteData.deletedByBorrower,
    );
  }
}

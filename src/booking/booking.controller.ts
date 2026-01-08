import { Controller, Get, Post, Body, Param } from '@nestjs/common';
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
}

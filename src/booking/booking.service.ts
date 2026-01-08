import { Injectable, NotFoundException } from '@nestjs/common';
import PrismaService from '../prisma/prisma.service';
import { CreateBookingDto } from './dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto) {
    const { toolId, renterId, borrowerId, pickUpDate, returnDate, totalPrice } =
      createBookingDto;

    // Verify tool exists
    const tool = await this.prisma.tool.findUnique({
      where: { id: toolId },
    });

    if (!tool) {
      throw new NotFoundException('Tool not found');
    }

    // Verify profiles exist
    const [renterProfile, borrowerProfile] = await Promise.all([
      this.prisma.profile.findUnique({ where: { id: renterId } }),
      this.prisma.profile.findUnique({ where: { id: borrowerId } }),
    ]);

    if (!renterProfile) {
      throw new NotFoundException('Renter profile not found');
    }

    if (!borrowerProfile) {
      throw new NotFoundException('Borrower profile not found');
    }

    // Create the booking
    const booking = await this.prisma.booking.create({
      data: {
        toolId,
        renterId,
        borrowerId,
        pickUpDate: new Date(pickUpDate),
        returnDate: new Date(returnDate),
        totalPrice,
        status: 'PENDING',
      },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            dailyPriceCents: true,
            depositCents: true,
          },
        },
        toolOwner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        toolBorrower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return booking;
  }

  async findAll() {
    return await this.prisma.booking.findMany({
      include: {
        tool: true,
        toolOwner: true,
        toolBorrower: true,
      },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        tool: true,
        toolOwner: true,
        toolBorrower: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async findByProfile(profileId: number) {
    return await this.prisma.booking.findMany({
      where: {
        OR: [{ renterId: profileId }, { borrowerId: profileId }],
      },
      include: {
        tool: true,
        toolOwner: true,
        toolBorrower: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByTool(toolId: string) {
    return await this.prisma.booking.findMany({
      where: { toolId },
      include: {
        toolOwner: true,
        toolBorrower: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

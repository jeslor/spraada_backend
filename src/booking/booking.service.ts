import { Injectable, NotFoundException } from '@nestjs/common';
import PrismaService from '../prisma/prisma.service';
import { CreateBookingDto } from './dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto) {
    const {
      toolId,
      rentedById,
      borrowedById,
      pickUpDate,
      returnDate,
      totalPrice,
    } = createBookingDto;

    // Verify tool exists
    const tool = await this.prisma.tool.findUnique({
      where: { id: toolId },
    });

    if (!tool) {
      throw new NotFoundException('Tool not found');
    }

    // Verify profiles exist
    const [renterProfile, borrowerProfile] = await Promise.all([
      this.prisma.profile.findUnique({ where: { id: rentedById } }),
      this.prisma.profile.findUnique({ where: { id: borrowedById } }),
    ]);

    if (!renterProfile) {
      throw new NotFoundException('Renter profile not found');
    }

    if (!borrowerProfile) {
      throw new NotFoundException('Borrower profile not found');
    }

    // Check for overlapping bookings
    const pickUp = new Date(pickUpDate);
    const returnD = new Date(returnDate);

    const overlappingBookings = await this.prisma.booking.findMany({
      where: {
        toolId,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        OR: [
          // New booking starts during existing booking
          {
            AND: [
              { pickUpDate: { lte: pickUp } },
              { returnDate: { gte: pickUp } },
            ],
          },
          // New booking ends during existing booking
          {
            AND: [
              { pickUpDate: { lte: returnD } },
              { returnDate: { gte: returnD } },
            ],
          },
          // New booking completely contains existing booking
          {
            AND: [
              { pickUpDate: { gte: pickUp } },
              { returnDate: { lte: returnD } },
            ],
          },
        ],
      },
    });

    if (overlappingBookings.length > 0) {
      throw new Error(
        'Tool is already booked for the selected dates. Please choose different dates.',
      );
    }

    // Create the booking
    const booking = await this.prisma.booking.create({
      data: {
        toolId,
        rentedById,
        borrowedById,
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
        OR: [{ rentedById: profileId }, { borrowedById: profileId }],
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

  // Get tools that a profile has rented out to others
  async getRentedToolsByProfile(profileId: number) {
    const bookings = await this.prisma.booking.findMany({
      where: { rentedById: profileId },
      include: {
        tool: {
          include: {
            profile: true,
          },
        },
        toolBorrower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Return unique tools with their booking info
    const toolsMap = new Map();
    bookings.forEach((booking) => {
      if (!toolsMap.has(booking.tool.id)) {
        toolsMap.set(booking.tool.id, {
          ...booking.tool,
          latestBooking: {
            id: booking.id,
            pickUpDate: booking.pickUpDate,
            returnDate: booking.returnDate,
            totalPrice: booking.totalPrice,
            status: booking.status,
            borrower: booking.toolBorrower,
          },
        });
      }
    });

    return Array.from(toolsMap.values());
  }

  // Get tools that a profile has borrowed from others
  async getBorrowedToolsByProfile(profileId: number) {
    const bookings = await this.prisma.booking.findMany({
      where: { borrowedById: profileId },
      include: {
        tool: {
          include: {
            profile: true,
          },
        },
        toolOwner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Return unique tools with their booking info
    const toolsMap = new Map();
    bookings.forEach((booking) => {
      if (!toolsMap.has(booking.tool.id)) {
        toolsMap.set(booking.tool.id, {
          ...booking.tool,
          latestBooking: {
            id: booking.id,
            pickUpDate: booking.pickUpDate,
            returnDate: booking.returnDate,
            totalPrice: booking.totalPrice,
            status: booking.status,
            owner: booking.toolOwner,
          },
        });
      }
    });

    return Array.from(toolsMap.values());
  }

  async updateBookingStatus(id: string, status: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid booking status');
    }

    return await this.prisma.booking.update({
      where: { id },
      data: { status: status as any },
      include: {
        tool: true,
        toolOwner: true,
        toolBorrower: true,
      },
    });
  }
}

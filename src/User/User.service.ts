import { Injectable } from '@nestjs/common';
import PrismaService from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getUserById(userId: number) {
    // Implement the logic to fetch user details from the database using Prisma or any other ORM
    const user = await this.prisma.profile.findUnique({
      where: { userId },
    });
    return user;
  }
}

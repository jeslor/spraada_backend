import { Injectable } from '@nestjs/common';
import PrismaService from 'src/prisma/prisma.service';
import { CreateProfileDto, EditProfileDto } from './dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}
  async createProfile(userId: number, dto: CreateProfileDto) {
    // Implement the logic to create a new user profile in the database using Prisma or any other ORM
    const newProfile = await this.prisma.profile.create({
      data: {
        userId,
        ...dto,
      },
    });
    return newProfile;
  }
  async getProfileById(userId: number) {
    // Implement the logic to fetch user details from the database using Prisma or any other ORM
    const user = await this.prisma.profile.findUnique({
      where: { userId },
    });
    return user;
  }

  async updateUser(id: number, dto: EditProfileDto) {
    // Implement the logic to update user details in the database using Prisma or any other ORM
    const updatedUser = await this.prisma.profile.update({
      where: { id },
      data: { ...dto },
    });
    return updatedUser;
  }
}

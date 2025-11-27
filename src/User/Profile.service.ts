import { ForbiddenException, Injectable } from '@nestjs/common';
import PrismaService from 'src/prisma/prisma.service';
import { CreateProfileDto, EditProfileDto } from './dto';
import { User } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}
  async createProfile(user: User, dto: CreateProfileDto) {
    // Implement the logic to create a new user profile in the database using Prisma or any other ORM
    const newProfile = await this.prisma.profile.create({
      data: {
        userId: user.id,
        email: user.email,
        ...dto,
      },
    });
    return newProfile;
  }
  async findUserById(id: number) {
    const foundUser = await this.prisma.user.findUnique({ where: { id } });
    if (!foundUser) {
      throw new ForbiddenException('user not found');
    }
    return foundUser;
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

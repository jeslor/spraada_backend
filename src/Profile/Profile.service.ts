import { Injectable } from '@nestjs/common';
import PrismaService from 'src/prisma/prisma.service';
import { CreateProfileDto, EditProfileDto } from './dto';
import { User } from '@prisma/client';
import AuthService from 'src/Auth/Auth.service';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}
  async createProfile(user: User, dto: CreateProfileDto) {
    // Implement the logic to create a new user profile in the database using Prisma or any other ORM
    try {
      const newProfile = await this.prisma.profile.create({
        data: {
          userId: user.id,
          email: user.email,
          ...dto,
        },
      });

      if (!newProfile) {
        throw new Error('Profile creation failed');
      }
      //upon successful profile creation, update the user to set onboarded to true
      const updatedUser = await this.authService.updateUser(user.id, {
        isOnboarded: true,
        role: user.role,
      });

      if (!updatedUser) {
        throw new Error('Error updating user after profile creation');
      }
      return newProfile;
    } catch (error) {
      throw error;
    }
  }

  async getProfileByUserId(userId: number) {
    // Implement the logic to get user profile by userId from the database using Prisma or any other ORM
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    return profile;
  }

  async updateUser(id: number, dto: EditProfileDto) {
    // Implement the logic to update user details in the database using Prisma or any other ORM
    const updatedUser = await this.prisma.profile.update({
      where: { id },
      data: { ...dto },
    });
    return updatedUser;
  }

  async getProfileById(profileId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });
    return profile;
  }
}

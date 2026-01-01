import { Profile, Role } from '@prisma/client';
import type { User } from '@prisma/client';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/Auth/decorator/user.decorator';
import { ProfileService } from './Profile.service';
import { CreateProfileDto, EditProfileDto } from './dto';
import { Roles } from 'src/Auth/decorator/roles.decorator';
import { RoleGuardGuard } from 'src/Auth/guard';

//Not adding the guard here, as it's already applied globally in AuthModule
@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Post()
  async CreateProfile(@GetUser() user: User, @Body() dto: CreateProfileDto) {
    const createdProfile: Profile | Error =
      await this.profileService.createProfile(user, { ...dto });

    if (createdProfile instanceof Error) {
      return { message: 'Error creating profile', createdProfile };
    }

    return createdProfile;
  }

  @Roles('USER', 'ADMIN')
  @UseGuards(RoleGuardGuard)
  @Get('/:id')
  async getUser(@Param('id') id: number, @Req() req) {
    //get user profile using profile service
    const user = req.user;
    //check if user is onboarded else return a specific error to cause frontend to redirect to onboarding
    //use auth service to get user by id
    try {
      //Foe now just return the message of user profile successfully fetched, plus the user ID
      return JSON.stringify({
        message: 'User profile successfully fetched',
        userId: id,
      });
    } catch (error) {
      return { message: 'Error fetching user', error };
    }
  }
  @Patch('/:id')
  async updateUser(
    @GetUser() user: User,
    @Param('id') id: number,
    @Body() dto: EditProfileDto,
  ) {
    try {
      return this.profileService.updateUser(id, dto);
    } catch (error) {
      return { message: 'Error updating user', error };
    }
  }
}

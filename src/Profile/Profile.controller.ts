import type { User } from '.prisma/client/wasm';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/Auth/decorator/user.decorator';
import { JwtAuthGuard } from 'src/Auth/guard/auth.guard';
import { ProfileService } from './Profile.service';
import { CreateProfileDto, EditProfileDto } from './dto';
import AuthService from 'src/Auth/Auth.service';

@UseGuards(JwtAuthGuard)
@Controller('/profile')
export class ProfileController {
  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
  ) {}

  @Post()
  CreateProfile(@GetUser() user: User, @Body() dto: CreateProfileDto) {
    return this.profileService.createProfile(user, { ...dto });
  }

  @Get('/:id')
  async getUser(@Param('id') id: number, @Req() req) {
    try {
      return this.authService.findUserById(id);
    } catch (error) {
      return { message: 'Error fetching user', error };
    }
  }
  @Post('/:id')
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

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

@UseGuards(JwtAuthGuard)
@Controller('/profile')
export class ProfileController {
  constructor(private userService: ProfileService) {}

  @Post()
  CreateProfile(@GetUser() user: User, @Body() dto: CreateProfileDto) {
    return this.userService.createProfile(user, { ...dto });
  }

  @Get('/:id')
  async getUser(@Param('id') id: number, @Req() req) {
    console.log(req);

    try {
      return this.userService.findUserById(id);
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
      return this.userService.updateUser(id, dto);
    } catch (error) {
      return { message: 'Error updating user', error };
    }
  }
}

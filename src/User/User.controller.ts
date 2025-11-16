import type { User } from '.prisma/client/wasm';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/Auth/decorator/user.decorator';
import { JwtAuthGuard } from 'src/Auth/guard/auth.guard';
import { UserService } from './User.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard/user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  async getUser(@GetUser() user: User) {
    try {
      return this.userService.getUserById(user.id);
    } catch (error) {
      return { message: 'Error fetching user', error };
    }
  }
}

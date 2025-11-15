import { Body, Controller, Post } from '@nestjs/common';
import { SigninDto } from './dto';
import AuthService from './Auth.service';

@Controller('auth')
export default class AuthController {
  constructor(private authService: AuthService) {}
  @Post('sign-in')
  Login(@Body() dto: SigninDto) {
    console.log(dto, 'dto from user in the auth controller');
    if (!dto.email || !dto.password) {
      throw new Error('Invalid credentials');
    }
    return this.authService.signIn(dto);
  }

  @Post('sign-up')
  Register(@Body() dto: SigninDto) {
    console.log(dto, 'dto from user in the auth controller');
    if (!dto.email || !dto.password) {
      throw new Error('Invalid credentials');
    }
    return this.authService.signUp(dto);
  }
}

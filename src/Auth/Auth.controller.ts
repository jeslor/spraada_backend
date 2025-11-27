// src/auth/auth.controller.ts

import {
  Body,
  Controller,
  Post,
  Request as Req, // Renamed to avoid collision with express Response
  Res, // Import Res decorator
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express'; // ⬅️ Import Response type from express
import { SigninDto, SignupDto } from './dto';
import AuthService from './Auth.service';
// import { JwtAuthGuard } from './guard'; // Keep if you use it elsewhere

const COOKIE_NAME = 'access_token'; // ⬅️ Define your cookie name

interface RegisterAndSignInResponse {
  access_token: string;
  refresh_token: string;
  id: number;
  email: string;
}

@Controller('auth')
export default class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async Login(
    @Body() dto: SigninDto,
    @Res({ passthrough: true }) res: Response, // ⬅️ Inject the response object
  ): Promise<RegisterAndSignInResponse> {
    console.log(dto, 'dto from user in the auth controller');
    if (!dto.email || !dto.password) {
      throw new Error('Invalid credentials');
    }

    // Call the AuthService to handle user sign-in and send back the user data with the access token and refresh token
    return await this.authService.signIn(dto);
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async Register(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response, // ⬅️ Inject the response object
  ): Promise<RegisterAndSignInResponse> {
    console.log(dto, 'dto from user in the sign up controller');
    if (!dto.email || !dto.password) {
      throw new Error('Invalid credentials');
    }
    if (dto.password !== dto.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const { confirmPassword, ...signUpData } = dto;
    // Call the AuthService to handle user registration and send back the registered user data with the access token and refresh token
    return await this.authService.signUp(signUpData);
  }
}

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

@Controller('auth')
export default class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async Login(
    @Body() dto: SigninDto,
    @Res({ passthrough: true }) res: Response, // ⬅️ Inject the response object
  ) {
    console.log(dto, 'dto from user in the auth controller');
    if (!dto.email || !dto.password) {
      throw new Error('Invalid credentials');
    }

    // 1. Get the raw token string from the AuthService (AuthService must be updated to return string)
    const { access_token, id, email } = await this.authService.signIn(dto);

    // 2. Return a successful, token-less response body
    return { message: 'User logged in successfully', id, email, access_token };
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async Register(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response, // ⬅️ Inject the response object
  ) {
    console.log(dto, 'dto from user in the sign up controller');
    if (!dto.email || !dto.password) {
      throw new Error('Invalid credentials');
    }
    if (dto.password !== dto.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const { confirmPassword, ...signUpData } = dto;

    // 1. Get the raw token string from the AuthService (AuthService must be updated to return string)
    const { access_token, id, email } =
      await this.authService.signUp(signUpData);

    // 2. Return a successful, token-less response body
    return { message: 'User registered successfully', id, email, access_token };
  }
}

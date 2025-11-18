// src/auth/auth.controller.ts

import {
  Body,
  Controller,
  Post,
  UseGuards,
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

  /**
   * Helper function to set the JWT in an HTTP-only cookie.
   */
  private setJwtCookie(res: Response, token: string) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true, // 🔒 CRITICAL: Prevents client-side JS access (XSS)
      secure: isProduction, // Requires HTTPS in production
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // e.g., 7 days
    });
  }

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
    const token = await this.authService.signIn(dto);

    // 2. Set the secure HTTP-only cookie
    this.setJwtCookie(res, token);

    // 3. Return a successful, token-less response body
    return { message: 'Signed in successfully' };
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
    const token = await this.authService.signUp(signUpData);

    // 2. Set the secure HTTP-only cookie
    this.setJwtCookie(res, token);

    // 3. Return a successful, token-less response body
    return { message: 'User registered successfully' };
  }
}

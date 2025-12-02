// src/auth/auth.controller.ts

import {
  Body,
  Controller,
  Post,
  Request as Req, // Renamed to avoid collision with express Response
  Res, // Import Res decorator
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express'; // ⬅️ Import Response type from express
import { SigninDto, SignupDto } from './dto';
import AuthService from './Auth.service';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { GoogleAuthGuard } from './guard';
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

  @Post('refresh-tokens')
  async RefreshToken(
    @Body() tokenDto: RefreshTokenDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    if (!tokenDto.refresh_token || !tokenDto.email || !tokenDto.id) {
      throw new Error('No refresh token provided');
    }
    return this.authService.refreshTokens(tokenDto);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  googleLoginCallback(@Req() req: any) {
    console.log('Google user', req.user);

    return req.user;
  }
}

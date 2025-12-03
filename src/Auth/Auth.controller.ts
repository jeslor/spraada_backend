import {
  Body,
  Controller,
  Post,
  Request as Req,
  Res,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { SigninDto, SignupDto } from './dto';
import AuthService from './Auth.service';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { GoogleAuthGuard, JwtAuthGuard } from './guard';

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
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterAndSignInResponse> {
    if (!dto.email || !dto.password) {
      throw new Error('Invalid credentials');
    }

    return await this.authService.signIn(dto);
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async Register(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterAndSignInResponse> {
    if (!dto.email || !dto.password) {
      throw new Error('Invalid credentials');
    }
    if (dto.password !== dto.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const { confirmPassword, ...signUpData } = dto;
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
  async googleLoginCallback(@Req() req, @Res() res: Response) {
    res.redirect(
      `${process.env.FRONTEND_URL}/api/auth/google/callback?` +
        `access_token=${req.user.access_token}&` +
        `refresh_token=${req.user.refresh_token}&` +
        `email=${req.user.email}&` +
        `id=${req.user.id}`,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('sign-out')
  async signOut(@Req() req, @Res() res: Response) {
    const userSignedOut = await this.authService.signOut(req.user.id);

    if (!userSignedOut) {
      res.status(500).json({ error: 'Failed to sign out user' });
    } else {
      res.status(200).json({ message: 'Signed out successfully' });
    }
  }
}

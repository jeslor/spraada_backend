import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import PrismaService from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import AuthService from '../Auth.service';
import type { Request } from 'express';
import { User } from '@prisma/client';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token-jwt',
) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  // ... (Your existing validate method remains the same)
  async validate(req: Request, payload: AuthJwtPayload) {
    try {
      const refreshToken = req.body.refreshToken;
      const foundUser: User = await this.authService.validateRefreshToken(
        payload.sub,
        refreshToken,
      );
      return foundUser;
    } catch (error) {
      throw error;
    }
  }
}

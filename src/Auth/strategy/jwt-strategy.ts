import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import PrismaService from 'src/prisma/prisma.service';
import AuthService from '../Auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  // ... (Your existing validate method remains the same)
  async validate(payload: AuthJwtPayload) {
    try {
      const foundUser = await this.authService.findUserById(payload.sub);
      return foundUser;
    } catch (error) {
      throw error;
    }
  }
}

import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import PrismaService from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express'; // Import Request type
import { ProfileService } from 'src/User/Profile.service';

const COOKIE_NAME = 'access_token'; // Ensure this matches the name used in your AuthController

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private profileService: ProfileService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        if (req && req.cookies) {
          return req.cookies[COOKIE_NAME];
        }
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  // ... (Your existing validate method remains the same)
  async validate(payload: AuthJwtPayload) {
    try {
      const foundUser = await this.profileService.findUserById(payload.sub);
      const { hash, ...userwithoutHash } = foundUser;
      return userwithoutHash;
    } catch (error) {
      throw error;
    }
  }
}

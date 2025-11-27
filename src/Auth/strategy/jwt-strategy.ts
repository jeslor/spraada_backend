import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Injectable } from '@nestjs/common';
import PrismaService from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express'; // Import Request type

const COOKIE_NAME = 'access_token'; // Ensure this matches the name used in your AuthController

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
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
      const foundUser = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!foundUser) {
        throw new ForbiddenException('Invalid token - user not found');
      }
      const { hash, ...userwithoutHash } = foundUser;
      return userwithoutHash;
    } catch (error) {
      throw error;
    }
  }
}

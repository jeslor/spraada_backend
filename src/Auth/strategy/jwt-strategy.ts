import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Injectable } from '@nestjs/common';
import PrismaService from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
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

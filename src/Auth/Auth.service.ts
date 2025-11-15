import { ForbiddenException, Injectable } from '@nestjs/common';
import { SigninDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import PrismaService from 'src/prisma/prisma.service';
import * as Argon from 'argon2';

@Injectable()
export default class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}
  async signIn(dto: SigninDto) {
    try {
      const foundUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (!foundUser) throw new ForbiddenException('user not found');

      const pwMatches = await Argon.verify(foundUser.hash, dto.password);
      if (!pwMatches) throw new ForbiddenException('incorrect password');
      return this.generateToken(foundUser.email, foundUser.id);
    } catch (error) {
      throw error;
    }
  }

  async signUp(dto: SigninDto) {
    //
    try {
      const hashedPassword = await Argon.hash(dto.password);
      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hashedPassword,
        },
      });
      return this.generateToken(newUser.email, newUser.id);
    } catch (error) {
      throw error;
    }
  }
  async generateToken(userEmail: string, userId: number) {
    const payload = { email: userEmail, sub: userId };
    const token = await this.jwt.signAsync(payload);
    return {
      access_token: token,
    };
  }
  //
  async verifyToken() {
    //
  }
  async refreshToken() {
    //
  }
  async validateHash() {
    //
  }
}

import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
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
  async signIn(dto: SigninDto): Promise<string> {
    try {
      const foundUser = await this.findByEmail(dto.email);
      if (!foundUser) throw new ForbiddenException('user not found');

      const pwMatches = await Argon.verify(foundUser.hash, dto.password);
      if (!pwMatches) throw new ForbiddenException('incorrect password');
      return this.generateToken(foundUser.email, foundUser.id);
    } catch (error) {
      throw error;
    }
  }

  async signUp(dto: SigninDto): Promise<string> {
    //
    try {
      const existingUser = await this.findByEmail(dto.email);
      if (existingUser) throw new ConflictException('email already registered');

      const hashedPassword = await Argon.hash(dto.password);
      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hashedPassword,
        },
      });

      if (!newUser) throw new ForbiddenException('failed to create user');
      return this.generateToken(newUser.email, newUser.id);
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
  async generateToken(userEmail: string, userId: number): Promise<string> {
    const payload = { email: userEmail, sub: userId };
    const token = await this.jwt.signAsync(payload);
    return token;
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

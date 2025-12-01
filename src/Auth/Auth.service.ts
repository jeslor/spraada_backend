import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { SigninDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import PrismaService from 'src/prisma/prisma.service';
import * as Argon from 'argon2';
import refreshTokenConfig from './config/refresh-token.config.ts';
import type { ConfigType } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refreshToken.dto';

interface GenerateTokenResult {
  access_token: string;
  refresh_token: string;
}

interface signInResult {
  access_token: string;
  refresh_token: string;
  id: number;
  email: string;
}

@Injectable()
export default class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    @Inject(refreshTokenConfig.KEY)
    private readonly refreshTokenConfiguration: ConfigType<
      typeof refreshTokenConfig
    >,
  ) {}

  //sign in existing user, validate password, return tokens, id and email
  async signIn(dto: SigninDto): Promise<signInResult> {
    try {
      const foundUser = await this.findUserByEmail(dto.email);
      if (!foundUser) throw new ForbiddenException('user not found');

      const pwMatches = await Argon.verify(foundUser.hash, dto.password);
      if (!pwMatches) throw new ForbiddenException('incorrect password');
      const { refresh_token, access_token } = await this.generateToken(
        foundUser.email,
        foundUser.id,
      );

      return {
        access_token: access_token,
        refresh_token: refresh_token,
        id: foundUser.id,
        email: foundUser.email,
      };
    } catch (error) {
      throw error;
    }
  }

  //sign up new user, check if email exists, hash password, return tokens, id and email
  async signUp(dto: SigninDto): Promise<signInResult> {
    //
    try {
      const existingUser = await this.findUserByEmail(dto.email);
      if (existingUser) throw new ConflictException('email already registered');

      const hashedPassword = await Argon.hash(dto.password);
      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hashedPassword,
        },
      });

      if (!newUser) throw new ForbiddenException('failed to create user');
      const { refresh_token, access_token } = await this.generateToken(
        newUser.email,
        newUser.id,
      );
      return {
        access_token: access_token,
        refresh_token: refresh_token,
        id: newUser.id,
        email: newUser.email,
      };
    } catch (error) {
      throw error;
    }
  }

  //return full user object with the hash
  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  //return user object without the hash
  async findUserById(id: number) {
    const foundUser = await this.prisma.user.findUnique({ where: { id } });
    if (!foundUser) {
      throw new ForbiddenException('user not found');
    }
    const { hash, ...userwithoutHash } = foundUser;
    return userwithoutHash;
  }

  //generate both access and refresh tokens
  async generateToken(
    userEmail: string,
    userId: number,
  ): Promise<GenerateTokenResult> {
    const payload: AuthJwtPayload = { email: userEmail, sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      await this.jwt.signAsync(payload),
      await this.createRefreshToken(payload),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async createRefreshToken(payload: AuthJwtPayload): Promise<string> {
    try {
      return await this.jwt.signAsync(payload, this.refreshTokenConfiguration);
    } catch (error) {
      throw error;
    }
  }
  async validateRefreshToken(userId: number) {
    try {
      return await this.findUserById(userId);
    } catch (error) {
      return error;
    }
  }

  async refreshTokens({ refresh_token, email, id }: RefreshTokenDto) {
    try {
      const { refresh_token, access_token } = await this.generateToken(
        email,
        id,
      );

      return {
        access_token: access_token,
        refresh_token: refresh_token,
      };
    } catch (error) {
      throw error;
    }
  }
}

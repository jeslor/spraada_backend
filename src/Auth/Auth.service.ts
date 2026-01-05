import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { SigninDto, SignupDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import PrismaService from 'src/prisma/prisma.service';
import * as Argon from 'argon2';
import refreshTokenConfig from './config/refresh-token.config.ts';
import type { ConfigType } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { nanoid } from 'nanoid';
import { Role } from '@prisma/client';
import { EmailService } from 'src/email/email.service';

interface AuthJwtPayload {
  email: string;
  sub: number;
}

interface GenerateTokenResult {
  access_token: string;
  refresh_token: string;
}

interface signInResult {
  access_token: string;
  refresh_token: string;
  id: number;
  email: string;
  isOnboarded: boolean;
  role: string;
}

interface GeneratePasswordResetResult {
  hashedResetToken: string;
  hashedResetPasswordToken: string;
  resetPasswordTokenExpiry: Date;
}

@Injectable()
export default class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private emailService: EmailService,
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

      const hashedRefreshToken = await Argon.hash(refresh_token);
      await this.updateHashedRefreshToken(foundUser.id, hashedRefreshToken);

      return {
        access_token: access_token,
        refresh_token: refresh_token,
        id: foundUser.id,
        email: foundUser.email,
        isOnboarded: !!foundUser.isOnboarded,
        role: foundUser.role,
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
        isOnboarded: newUser.isOnboarded,
        role: newUser.role,
      };
    } catch (error) {
      throw error;
    }
  }

  //return full user object with the hash
  async findUserByEmail(email: string) {
    try {
      const emailUser = this.prisma.user.findUnique({ where: { email } });
      return emailUser;
    } catch (error) {
      throw error;
    }
  }

  //return user object without the hash
  async findUserById(id: number) {
    try {
      const foundUser = await this.prisma.user.findUnique({
        where: { id },
        include: {
          profile: {
            include: {
              myToolBox: true,
              bookings: true,
            },
          },
        },
      });
      if (!foundUser) {
        throw new ForbiddenException('user not found');
      }
      const { hash, ...userwithoutHash } = foundUser;
      return userwithoutHash;
    } catch (error) {
      throw error;
    }
  }

  //create a refresh token
  async createRefreshToken(payload: AuthJwtPayload): Promise<string> {
    try {
      return await this.jwt.signAsync(payload, this.refreshTokenConfiguration);
    } catch (error) {
      throw error;
    }
  }
  //validate refresh token by comparing with the hashed version in the database
  async validateRefreshToken(userId: number, hashedRefreshToken: string) {
    try {
      const user = await this.findUserById(userId);
      const refreshTokenIsValid = await Argon.verify(
        user.hashedRefreshToken!,
        hashedRefreshToken,
      );
      if (!refreshTokenIsValid)
        throw new ForbiddenException('Invalid refresh token');
      return user;
    } catch (error) {
      return error;
    }
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

  //refresh tokens, generate new ones and store the new hashed refresh token
  async refreshTokens({ refresh_token, email, id }: RefreshTokenDto) {
    try {
      // generate new tokens
      const { refresh_token: newRefreshToken, access_token } =
        await this.generateToken(email, id);

      // hash and store the new refresh token in the database
      const hashedRefreshToken = await Argon.hash(newRefreshToken);
      await this.updateHashedRefreshToken(id, hashedRefreshToken);

      return {
        access_token: access_token,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  //validate Google login, create user if not exists, generate tokens, store hashed refresh token
  async validateGoogleLogin(googleuserData: SignupDto): Promise<signInResult> {
    try {
      // Check if user already exists
      let user = await this.findUserByEmail(googleuserData.email);
      if (!user) {
        // Create a new user if not found
        user = await this.prisma.user.create({
          data: {
            email: googleuserData.email,
            hash: '', // No password for Google-authenticated users
          },
        });
      }

      // extract hash and return user data without it
      const { hash, ...userwithoutHash } = user;

      // generate tokens
      const { refresh_token, access_token } = await this.generateToken(
        user.email,
        user.id,
      );

      // hash and store the refresh token in the database
      const hashedRefreshToken = await Argon.hash(refresh_token);
      await this.updateHashedRefreshToken(user.id, hashedRefreshToken);

      return {
        access_token: access_token,
        refresh_token: refresh_token,
        id: userwithoutHash.id,
        email: userwithoutHash.email,
        isOnboarded: userwithoutHash.isOnboarded,
        role: userwithoutHash.role,
      };
    } catch (error) {
      throw error;
    }
  }

  async generatePasswordResetToken(): Promise<GeneratePasswordResetResult> {
    try {
      // Random token to be sent to user email for verification
      const hashedResetToken = nanoid(64);

      // Random token stored in the database (hashed) for verification
      const hashedResetPasswordToken = await Argon.hash(hashedResetToken, {
        type: Argon.argon2id,
      });
      const tokenExpiry = new Date(Date.now() + 20 * 60 * 1000); // Token valid for 20 minutes
      const resetPasswordTokenExpiry = tokenExpiry;
      return {
        hashedResetToken,
        hashedResetPasswordToken,
        resetPasswordTokenExpiry,
      };
    } catch (error) {
      throw error;
    }
  }

  //initiate password reset by generating a reset token, an emailToken and storing it in the database
  async initiatePasswordReset(
    email: string,
  ): Promise<{ hashedResetToken: string } | void> {
    try {
      const user = await this.findUserByEmail(email);
      if (!user) {
        throw new ForbiddenException('No user found with this email');
      }
      //Generate the tokens
      const {
        hashedResetPasswordToken,
        resetPasswordTokenExpiry,
        hashedResetToken,
      } = await this.generatePasswordResetToken();

      console.log(
        'reached here',
        user,
        hashedResetToken,
        hashedResetPasswordToken,
        resetPasswordTokenExpiry,
      );

      //Update user with the tokens
      await this.prisma.user.update({
        where: { email },
        data: {
          hashedResetPasswordToken,
          resetPasswordTokenExpiry,
          hashedResetToken,
        },
      });

      //send an email to the user with the reset token (handled in controller)
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${hashedResetToken}&email=${email}`;
      const emailSent = await this.emailService.sendPasswordResetEmail(
        email,
        resetLink,
      );
      console.log(emailSent);

      return {
        hashedResetToken,
      };
    } catch (error) {
      throw error;
    }
  }

  //sign out user by clearing the hashed refresh token
  async signOut(userId: number) {
    try {
      await this.updateHashedRefreshToken(userId, null);
      return true;
    } catch (error) {
      console.error('Error signing out user:', error);
      return null;
    }
  }

  //update the hashed refresh token in the database
  async updateHashedRefreshToken(
    userId: number,
    hashedRefreshToken: string | null,
  ) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { hashedRefreshToken },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId: number, dto: { isOnboarded: boolean; role?: Role }) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          isOnboarded: dto.isOnboarded,
          role: dto.role,
        },
      });
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }
}

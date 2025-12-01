import { Module } from '@nestjs/common';
import AuthController from './Auth.controller';
import AuthService from './Auth.service';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategy';
import { JwtModule } from '@nestjs/jwt';
import { ProfileService } from 'src/Profile/Profile.service';
import { StringValue } from 'ms';
import refreshTokenConfig from './config/refresh-token.config.ts';
import googleOathConfig from './config/googleOath.config';
import { GoogleAuthGuard, RefreshAuthGuard } from './guard';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<StringValue>('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forFeature(refreshTokenConfig),
    ConfigModule.forFeature(googleOathConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    ProfileService,
    RefreshAuthGuard,
    GoogleStrategy,
    GoogleAuthGuard,
  ],
})
export default class AuthModule {}

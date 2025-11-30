import { Module } from '@nestjs/common';
import AuthModule from './Auth/Auth.module';
import { ConfigModule } from '@nestjs/config';
import PrismaModule from './prisma/prisma.module';
import { ProfileModule } from './Profile/Profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    ProfileModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import AuthModule from './Auth/Auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './User/User.module';
import PrismaModule from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    UserModule,
  ],
})
export class AppModule {}

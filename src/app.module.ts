import { Module } from '@nestjs/common';
import AuthModule from './Auth/Auth.module';
import { ConfigModule } from '@nestjs/config';
import PrismaModule from './prisma/prisma.module';
import { ProfileModule } from './Profile/Profile.module';
import { UploadModule } from './uploadResource/upload.module';
import { ToolsModule } from './tools/tools.module';
import { EmailModule } from './email/email.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    ProfileModule,
    UploadModule,
    ToolsModule,
    EmailModule,
    BookingModule,
  ],
  providers: [],
})
export class AppModule {}

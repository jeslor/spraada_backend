import { Module } from '@nestjs/common';
import AuthModule from './Auth/Auth.module';
import { ConfigModule } from '@nestjs/config';
import PrismaModule from './prisma/prisma.module';
import { ProfileModule } from './Profile/Profile.module';
import { UploadModule } from './uploadResource/upload.module';
import { ToolsModule } from './tools/tools.module';
import { EmailModule } from './email/email.module';
import { BookingModule } from './booking/booking.module';
import { MessageModule } from './message/message.module';
import { ChatsModule } from './events/Chats.module';

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
    MessageModule,
    ChatsModule,
  ],
  // providers: [EventsGateway],
})
export class AppModule {}

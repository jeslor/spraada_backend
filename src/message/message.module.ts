import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { ProfileService } from 'src/Profile/Profile.service';
import { UploadModule } from 'src/uploadResource/upload.module';
import AuthModule from 'src/Auth/Auth.module';
import { ConversationService } from 'src/conversation/conversation.service';
import { ChatNotificationModule } from 'src/events/ChatNotification.module';

@Module({
  controllers: [MessageController],
  providers: [
    MessageService,
    ProfileService,
    ConversationService,
    ChatNotificationModule,
  ],
  imports: [UploadModule, AuthModule, ChatNotificationModule],
  exports: [MessageService],
})
export class MessageModule {}

import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { ChatNotificationModule } from 'src/events/ChatNotification.module';
import { ChatNotificationGateway } from 'src/events/ChatNotification.gateway';

@Module({
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule {}

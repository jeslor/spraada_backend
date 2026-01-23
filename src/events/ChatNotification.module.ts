import { Module } from '@nestjs/common';
import { ChatNotificationGateway } from './ChatNotification.gateway';

@Module({
  imports: [],
  providers: [ChatNotificationGateway],
})
export class ChatNotificationModule {}

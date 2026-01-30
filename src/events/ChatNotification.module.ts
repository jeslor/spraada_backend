import { Module } from '@nestjs/common';
import { ChatNotificationGateway } from './ChatNotification.gateway';

@Module({
  imports: [],
  providers: [ChatNotificationGateway],
  exports: [ChatNotificationGateway],
})
export class ChatNotificationModule {}

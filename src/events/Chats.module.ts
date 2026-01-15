import { Module } from '@nestjs/common';
import { ChatsGateway } from './Chats.gateway';

@Module({
  providers: [ChatsGateway],
})
export class ChatsModule {}

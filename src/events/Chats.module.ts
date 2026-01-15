import { Module } from '@nestjs/common';
import { ChatsGateway } from './Chats.gateway';
import { UploadModule } from 'src/uploadResource/upload.module';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [UploadModule, MessageModule],
  providers: [ChatsGateway],
})
export class ChatsModule {}

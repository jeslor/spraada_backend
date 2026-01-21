import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { ProfileService } from 'src/Profile/Profile.service';
import { UploadModule } from 'src/uploadResource/upload.module';
import AuthModule from 'src/Auth/Auth.module';

@Module({
  controllers: [MessageController],
  providers: [MessageService, ProfileService],
  imports: [UploadModule, AuthModule],
  exports: [MessageService],
})
export class MessageModule {}

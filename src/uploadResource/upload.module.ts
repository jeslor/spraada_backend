import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ProfileService } from 'src/Profile/Profile.service';
import AuthModule from 'src/Auth/Auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UploadController],
  providers: [UploadService, ProfileService],
})
export class UploadModule {}

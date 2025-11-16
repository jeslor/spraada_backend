import { Module } from '@nestjs/common';
import { ProfileService } from './Profile.service';
import { ProfileController } from './Profilecontroller';

@Module({
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}

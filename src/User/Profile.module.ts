import { Module } from '@nestjs/common';
import { ProfileService } from './Profile.service';
import { ProfileController } from './Profile.controller';

@Module({
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}

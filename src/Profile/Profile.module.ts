import { Module } from '@nestjs/common';
import { ProfileService } from './Profile.service';
import { ProfileController } from './Profile.controller';
import AuthModule from 'src/Auth/Auth.module';
import PrismaService from 'src/prisma/prisma.service';

@Module({
  imports: [AuthModule],
  providers: [ProfileService, PrismaService],
  controllers: [ProfileController],
})
export class ProfileModule {}

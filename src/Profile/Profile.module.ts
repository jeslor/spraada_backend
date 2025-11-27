import { Module } from '@nestjs/common';
import { ProfileService } from './Profile.service';
import { ProfileController } from './Profile.controller';
import AuthService from 'src/Auth/Auth.service';
import PrismaService from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [ProfileService, AuthService, PrismaService, JwtService],
  controllers: [ProfileController],
})
export class ProfileModule {}

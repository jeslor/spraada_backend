import { Module } from '@nestjs/common';
import AuthModule from './Auth/Auth.module';

@Module({
  imports: [AuthModule],
})
export class AppModule {}

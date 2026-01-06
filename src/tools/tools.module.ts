import { Module } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { ToolsController } from './tools.controller';
import PrismaService from 'src/prisma/prisma.service';
import { UploadModule } from 'src/uploadResource/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [ToolsController],
  providers: [ToolsService, PrismaService],
})
export class ToolsModule {}

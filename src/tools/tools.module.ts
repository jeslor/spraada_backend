import { Module } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { ToolsController } from './tools.controller';
import PrismaService from 'src/prisma/prisma.service';

@Module({
  controllers: [ToolsController],
  providers: [ToolsService, PrismaService],
})
export class ToolsModule {}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';

@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post()
  async create(@Body() createToolDto: CreateToolDto) {
    return await this.toolsService.create(createToolDto);
  }

  @Get()
  async findAll() {
    return await this.toolsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.toolsService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateToolDto: UpdateToolDto) {
    return await this.toolsService.update(+id, updateToolDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.toolsService.remove(+id);
  }
}

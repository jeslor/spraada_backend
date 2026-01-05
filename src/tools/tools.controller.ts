import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { ToolOwnerGuard } from './Guard/tool-owner.guard';

@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post()
  async create(@Body() createToolDto: CreateToolDto) {
    return await this.toolsService.create(createToolDto);
  }

  @Get('owner/:ownerId')
  async findUserTools(@Param('ownerId') ownerId: number) {
    return await this.toolsService.findUserTools(ownerId);
  }

  @Get()
  async findAll() {
    return await this.toolsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.toolsService.findOne(id);
  }

  @UseGuards(ToolOwnerGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateToolDto: UpdateToolDto) {
    return await this.toolsService.update(id, updateToolDto);
  }

  @UseGuards(ToolOwnerGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.toolsService.remove(id);
  }
}

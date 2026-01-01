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
import { Roles } from 'src/Auth/decorator/roles.decorator';

@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post()
  async create(@Body() createToolDto: CreateToolDto) {
    return await this.toolsService.create(createToolDto);
  }

  @Get('owner/:ownerId')
  async findByOwner(@Param('ownerId') ownerId: number) {
    return await this.toolsService.findByOwner(ownerId);
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

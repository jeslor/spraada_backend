import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { ToolOwnerGuard } from './Guard/tool-owner.guard';
import { isPublicEndpoint } from 'src/Auth/decorator';

@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post()
  async create(@Body() createToolDto: CreateToolDto) {
    return await this.toolsService.create(createToolDto);
  }

  @isPublicEndpoint()
  @Get('owner/:ownerId')
  async findUserTools(@Param('ownerId') ownerId: number) {
    return await this.toolsService.findUserTools(ownerId);
  }

  @isPublicEndpoint()
  @Get('random')
  async getRandomTools(@Query('count') count: string) {
    return await this.toolsService.getRandomTools({
      count: Number(count) || 12,
    });
  }

  @isPublicEndpoint()
  @Get('search')
  async searchTools(
    @Query('searchTerm') searchTerm?: string,
    @Query('category') category?: string,
    @Query('sortBy') sortBy?: string,
    @Query('availability') availability?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.toolsService.searchTools({
      searchTerm,
      category,
      sortBy: sortBy || 'newest',
      availability: availability || 'all',
      page: Number(page) || 1,
      limit: Number(limit) || 12,
    });
  }

  @isPublicEndpoint()
  @Get()
  async findAll() {
    return await this.toolsService.findAll();
  }

  @isPublicEndpoint()
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
  async remove(@Param('id') id: string, @Body() body: { profileId: number }) {
    return await this.toolsService.deleteTool(id, body.profileId);
  }

  @UseGuards(ToolOwnerGuard)
  @Patch(':id/availability')
  async updateAvailabilityStatus(
    @Param('id') id: string,
    @Body() body: { available: boolean; profileId: number },
  ) {
    return await this.toolsService.updateAvailabilityStatus(
      id,
      body.available,
      body.profileId,
    );
  }
}

import { Injectable } from '@nestjs/common';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import PrismaService from 'src/prisma/prisma.service';

@Injectable()
export class ToolsService {
  constructor(private prisma: PrismaService) {}

  async create(createToolDto: CreateToolDto) {
    try {
      const { toolPhotos, profileId, ...toolData } = createToolDto;

      // Convert toolPhotos array to the format expected by the JSON field
      const JsonPhotos = toolPhotos.map((photo) => ({
        photoUrl: photo.photoUrl,
        photoUrlKey: photo.photoKey,
      }));

      const newTool = await this.prisma.tool.create({
        data: {
          ...toolData,
          profileId,
          toolPhotos: JsonPhotos,
        },
      });

      return newTool;
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all tools`;
  }

  async findByOwner(ownerId: number) {
    const tools = await this.prisma.tool.findMany({
      where: {
        profileId: ownerId,
      },
    });
    return tools;
  }

  findOne(id: number) {
    return `This action returns a #${id} tool`;
  }

  update(id: number, updateToolDto: UpdateToolDto) {
    return `This action updates a #${id} tool`;
  }

  remove(id: number) {
    return `This action removes a #${id} tool`;
  }
}

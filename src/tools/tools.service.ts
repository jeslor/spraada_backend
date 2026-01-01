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

  async findUserTools(userId: number) {
    const tools = await this.prisma.tool.findMany({
      where: {
        profileId: userId,
      },
    });
    return tools;
  }

  async findOne(id: string) {
    const tool = await this.prisma.tool.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            city: true,
            country: true,
          },
        },
      },
    });
    return tool;
  }

  async update(id: string, updateToolDto: UpdateToolDto) {
    try {
      const { toolPhotos, profileId, ...toolData } = updateToolDto;

      // Build the update data
      const updateData: any = { ...toolData };

      // If toolPhotos are provided, convert them to the expected format
      if (toolPhotos && toolPhotos.length > 0) {
        updateData.toolPhotos = toolPhotos.map((photo) => ({
          photoUrl: photo.photoUrl,
          photoUrlKey: photo.photoKey,
        }));
      }

      const updatedTool = await this.prisma.tool.update({
        where: { id },
        data: updateData,
      });

      return updatedTool;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    const deletedTool = await this.prisma.tool.delete({
      where: { id },
    });
    return deletedTool;
  }
}

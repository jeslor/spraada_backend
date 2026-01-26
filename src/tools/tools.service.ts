import { Injectable } from '@nestjs/common';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import PrismaService from 'src/prisma/prisma.service';
import { UploadService } from 'src/uploadResource/upload.service';

interface whereType {
  OR?: (
    | { name: { contains: string; mode: 'insensitive' } }
    | { description: { contains: string; mode: 'insensitive' } }
  )[];
  category?: string;
  available?: boolean;
}

@Injectable()
export class ToolsService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async create(createToolDto: CreateToolDto) {
    try {
      const { toolPhotos, profileId, ...toolData } = createToolDto;

      // Convert toolPhotos array to the format expected by the JSON field
      const JsonPhotos = toolPhotos.map((photo) => ({
        photoUrl: photo.photoUrl,
        photoUrlKey: photo.photoUrlKey,
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

  async searchTools({
    searchTerm,
    category,
    sortBy = 'newest',
    availability = 'all',
    page = 1,
    limit = 12,
  }: {
    searchTerm?: string;
    category?: string;
    sortBy?: string;
    availability?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const skip = (page - 1) * limit;

      const where: whereType = {};

      // Search by name or description
      if (searchTerm) {
        where.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      // Filter by category
      if (category) {
        where.category = category;
      }

      // Filter by availability
      if (availability === 'available') {
        where.available = true;
      } else if (availability === 'unavailable') {
        where.available = false;
      }

      // Determine sort order
      let orderBy: any = { createdAt: 'desc' };
      switch (sortBy) {
        case 'price-low':
          orderBy = { dailyPriceCents: 'asc' };
          break;
        case 'price-high':
          orderBy = { dailyPriceCents: 'desc' };
          break;
        case 'popular':
          // For now, sort by createdAt - can be updated when ratings/views are added
          orderBy = { createdAt: 'desc' };
          break;
        case 'newest':
        default:
          orderBy = { createdAt: 'desc' };
          break;
      }

      // Get total count for pagination
      const totalCount = await this.prisma.tool.count({ where });

      // Get tools
      const tools = await this.prisma.tool.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          profile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              city: true,
            },
          },
        },
      });

      return {
        data: tools,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: page * limit < totalCount,
        },
      };
    } catch (error) {
      throw error;
    }
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
            coverUrl: true,
            bio: true,
            city: true,
            country: true,
            createdAt: true,
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
          photoUrlKey: photo.photoUrlKey,
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

  async deleteTool(id: string, profileId: number) {
    try {
      const isToolOwner = await this.prisma.tool.findFirst({
        where: {
          id,
          profileId,
        },
      });

      if (!isToolOwner) {
        throw new Error('You do not have permission to delete this tool');
      }

      //delete the tool images from S3 here before deleting the tool record
      if (isToolOwner.toolPhotos && Array.isArray(isToolOwner.toolPhotos)) {
        const photos = Array.isArray(isToolOwner.toolPhotos)
          ? isToolOwner.toolPhotos
          : JSON.parse(isToolOwner.toolPhotos);

        const removeRemoveToolImagesFromS3 =
          await this.uploadService.deleteResources({
            keys: photos.map((photo) => photo.photoUrlKey),
            userId: profileId,
            profileId: profileId,
          });

        if (!removeRemoveToolImagesFromS3) {
          throw new Error('Failed to delete tool images from storage');
        }
      }

      const deletedTool = await this.prisma.tool.delete({
        where: { id },
      });
      return deletedTool;
    } catch (error) {
      throw error;
    }
  }

  async getRandomTools({ count }: { count: number }) {
    try {
      const TAKE = 12;

      const totalCount = await this.prisma.tool.count();

      if (totalCount === 0) return [];

      const skip = Math.floor(Math.random() * Math.max(0, totalCount - TAKE));

      const foundTools = await this.prisma.tool.findMany({
        skip: skip,
        take: TAKE,
      });

      return foundTools;
    } catch (error) {
      return {
        message: 'Failed to fetch random tools',
        data: [],
      };
    }
  }

  async updateAvailabilityStatus(
    id: string,
    available: boolean,
    profileId: number,
  ) {
    try {
      const isToolOwner = await this.prisma.tool.findFirst({
        where: {
          id,
          profileId,
        },
      });

      if (!isToolOwner) {
        throw new Error('You do not have permission to update this tool');
      }

      const updatedTool = await this.prisma.tool.update({
        where: { id },
        data: { available },
      });

      return updatedTool;
    } catch (error) {
      throw error;
    }
  }
}

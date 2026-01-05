import {
  Body,
  Controller,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { deleteUploadDto } from './dto/deleteUpload.dto';
import { Roles } from 'src/Auth/decorator/roles.decorator';

@Controller('resources')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Roles('USER', 'ADMIN')
  @Post('upload/:userId')
  @UseInterceptors(FilesInterceptor('images'))
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('userId') userId: number,
    @Query('resourceFolder') folderSection: string,
  ) {
    return await this.uploadService.uploadImages(files, userId, folderSection);
  }

  @Roles('USER', 'ADMIN')
  @Post('delete/:userId')
  async delete(@Body() dto: deleteUploadDto, @Param('userId') userId: number) {
    return await this.uploadService.deleteProfileOrCoverImages({
      keys: dto.keys,
      userId,
      profileId: dto.profileId,
    });
  }
}

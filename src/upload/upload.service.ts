import { Injectable } from '@nestjs/common';
import { CreateUploadDto } from './dto/create-upload.dto';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class UploadService {
  private s3 = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });
  async uploadImages(files: Express.Multer.File[]) {
    console.log(files);
  }
}

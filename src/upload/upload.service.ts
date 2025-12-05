import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class UploadService {
  private s3 = new S3Client({
    region: process.env.AWS_S3_BUCKET_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  async uploadImages(files: Express.Multer.File[]) {
    const bucket = process.env.AWS_S3_BUCKET_NAME!;
    let result: { key: string; url: string }[] = [];

    // ⬇️ correct parallel uploads
    const uploadPromises = files.map(async (file) => {
      const key = `profile-images/${uuidV4()}-${file.originalname}`;

      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return {
        key,
        url: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      };
    });

    // Wait for all parallel uploads
    await Promise.all(uploadPromises).then((res) => {
      result = [...res];
    });

    return result;
  }
}

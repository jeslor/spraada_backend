import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { v4 as uuidV4 } from 'uuid';
import AuthService from 'src/Auth/Auth.service';
import { ProfileService } from 'src/Profile/Profile.service';

@Injectable()
export class UploadService {
  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
  ) {}
  private s3 = new S3Client({
    region: process.env.AWS_S3_BUCKET_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  async uploadImages(
    files: Express.Multer.File[],
    userId: number,
    folderSection = 'tool-images',
  ) {
    const userExists = await this.authService.findUserById(userId); // Assume this function is defined elsewhere
    if (!userExists) {
      throw new Error('You are not authorized to upload images');
    }
    const bucket = process.env.AWS_S3_BUCKET_NAME!;
    let result: { key: string; url: string }[] = [];

    // ⬇️ correct parallel uploads
    const uploadPromises = files.map(async (file) => {
      const key = `${folderSection}/${uuidV4()}-${file.originalname}`;

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
        url: `https://${bucket}.s3.${process.env.AWS_S3_BUCKET_REGION}.amazonaws.com/${key}`,
      };
    });

    // Wait for all parallel uploads
    await Promise.all(uploadPromises).then((res) => {
      result = [...res];
    });

    return result;
  }

  async deleteResources({
    keys,
    userId,
    profileId,
  }: {
    keys: string[];
    userId: number;
    profileId: number;
  }) {
    try {
      const userExists = await this.authService.findUserById(userId);
      if (!userExists) {
        throw new Error('You are not authorized to delete images');
      }

      // Ensure that the user can only delete their own profile or cover images unless they are an admin
      const userProfile = await this.profileService.getProfileByUserId(userId);
      const userRole = userExists.role;
      const userOwnsImages = profileId === userProfile?.id;
      if (!userOwnsImages && userRole !== 'ADMIN') {
        throw new ForbiddenException('You can only delete your own images');
      }

      //delete images from s3
      const bucket = process.env.AWS_S3_BUCKET_NAME!;
      let deletePromises = keys.map(async (key) => {
        await this.s3.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        );
      });
      const deleteResults = await Promise.all(deletePromises);

      return {
        message: 'Images deleted successfully',
        data: deleteResults,
      };
    } catch (error) {
      throw new Error(`Failed to delete images: ${(error as Error).message}`);
    }
  }
}

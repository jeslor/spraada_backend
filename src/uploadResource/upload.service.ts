import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
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

  async uploadImages(files: Express.Multer.File[], userId: number) {
    const userExists = await this.authService.findUserById(userId); // Assume this function is defined elsewhere
    if (!userExists) {
      throw new Error('You are not authorized to upload images');
    }
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
        url: `https://${bucket}.s3.${process.env.AWS_S3_BUCKET_REGION}.amazonaws.com/${key}`,
      };
    });

    // Wait for all parallel uploads
    await Promise.all(uploadPromises).then((res) => {
      result = [...res];
    });

    return result;
  }

  async deleteProfileOrCoverImages(keys: string[], userId: number) {
    const userExists = await this.authService.findUserById(userId); // Assume this function is defined elsewhere
    if (!userExists) {
      throw new Error('You are not authorized to delete images');
    }
    const userProfile = await this.profileService.getProfileByUserId(userId);
    const userRole = userExists.role;
    // Ensure that the user can only delete their own profile or cover images unless they are an admin
    const userOwnsImages =
      keys.includes(userProfile?.avatarUrlKey!) ||
      keys.includes(userProfile?.coverUrlKey!);
    if (!userOwnsImages || userRole !== 'ADMIN') {
      throw new Error('You can only delete your own images');
    }
    const bucket = process.env.AWS_S3_BUCKET_NAME!;
    let deletePromises = keys.map(async (key) => {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
    });

    await Promise.all(deletePromises);
  }
}

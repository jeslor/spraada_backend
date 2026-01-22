import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import PrismaService from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prismaService: PrismaService) {}
  async create(createNotificationDto: CreateNotificationDto) {
    return await this.prismaService.notification.create({
      data: {
        ...createNotificationDto,
        profileMediaFiles: createNotificationDto
          ? createNotificationDto.profileMediaFiles?.map((file) => ({
              ...file,
            }))
          : [],
        contentMediaFiles: createNotificationDto
          ? createNotificationDto.contentMediaFiles?.map((file) => ({
              ...file,
            }))
          : [],
      },
    });
  }

  async updateNotifications(
    notification: UpdateNotificationDto,
    notificationCounter?: {
      count: number;
      profileId?: number;
    },
  ) {
    try {
      let updatedNotifications;
      let updatedNotificationsCounter;
      if (notification.isRead) {
        updatedNotifications = await this.prismaService.notification.updateMany(
          {
            where: {
              profileId: notification.profileId,
              isRead: false,
            },
            data: {
              isRead: true,
            },
          },
        );
      }

      if (notificationCounter && notification.profileId !== undefined) {
        updatedNotificationsCounter =
          await this.prismaService.notificationsCounter.upsert({
            where: { profileId: notification.profileId },
            create: {
              profileId: notification.profileId,
              count: notificationCounter.count,
            },
            update: {
              count: notificationCounter.count,
            },
          });
      }
      return {
        message: 'Notifications updated successfully',
        data: {
          notifications: updatedNotifications,
          notificationCounter: updatedNotificationsCounter,
        },
      };
    } catch (error) {
      console.error('Error updating notifications:', error);
      throw error;
    }
  }

  findAllNotificationsByProfile(profileId: number) {
    return this.prismaService.notification.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findNotificationCounterByProfile(profileId: number) {
    return this.prismaService.notificationsCounter.findUnique({
      where: { profileId },
    });
  }

  findOne(id: number) {
    return this.prismaService.notification.findUnique({
      where: { id },
    });
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}

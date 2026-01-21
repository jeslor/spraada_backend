import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import PrismaService from 'src/prisma/prisma.service';
import { UploadService } from 'src/uploadResource/upload.service';
import { ProfileService } from 'src/Profile/Profile.service';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private profileService: ProfileService,
    private uploadService: UploadService,
  ) {}

  createMessage = (createMessageDto: CreateMessageDto) => {
    const { senderId, receiverId, content, mediaFiles } = createMessageDto;
    const savedMessage = this.prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        mediaFiles: mediaFiles ? mediaFiles.map((file) => ({ ...file })) : [],
      },
    });
    return savedMessage;
  };

  getMessagesForUser(userId: number) {
    return this.prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  getUnreadMessagesCount(profileId: number) {
    return this.prisma.unreadMessagesCounter.findFirst({
      where: {
        profileId: profileId,
      },
    });
  }

  updateUnreadMessagesCount(
    messageCounterId: number,
    profileId: number,
    counters: Record<number, number>,
  ) {
    return this.prisma.unreadMessagesCounter.upsert({
      where: {
        profileId: profileId, // ✅ now recognized as unique
      },
      update: {
        counters,
      },
      create: {
        profileId,
        counters,
      },
    });
  }

  // getProfilesForUser(userId: number) {
  //   return this.prisma.profile.findMany({
  //     where: {
  //       OR: [
  //         { sentMessages: { some: { receiverId: userId } } },
  //         { receivedMessages: { some: { senderId: userId } } },
  //       ],
  //     },
  //     select: {
  //       id: true,
  //       firstName: true,
  //       lastName: true,
  //       avatarUrl: true,
  //     },
  //     orderBy: {
  //       updatedAt: 'desc',
  //     },
  //   });
  // }

  findAll() {
    return `This action returns all message`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  async deleteMessage(message: any, profileId: number, userId: number) {
    try {
      if (message.deletedByReceiver && message.deletedBySender) {
        if (message.mediaFiles && message.mediaFiles.length > 0) {
          const keys = message.mediaFiles.map((file) => file.mediaUrlKey);
          const deleteMedia = await this.uploadService.deleteResources({
            keys,
            userId,
            profileId,
          });
          if (!deleteMedia.data.length) {
            throw new Error(
              'Failed to delete media files associated with the message',
            );
          }
        }
        await this.prisma.message.update({
          where: {
            id: message.id,
          },
          data: {
            deletedByReceiver: true,
            deletedBySender: true,
            content: '',
            mediaFiles: [],
          },
        });
        return {
          success: true,
          message: 'Message content permanently deleted',
        };
      }
      await this.prisma.message.update({
        where: {
          id: message.id,
        },
        data: {
          deletedByReceiver: true,
        },
      });
      return { success: true, message: 'Message deleted for the user' };
    } catch (error) {
      return { success: false, message: 'Failed to delete message', error };
    }
  }
}

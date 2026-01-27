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

  async getMessagesForUser(profileId: number, page: number) {
    const skipItems = (page - 1) * 20;
    console.log(profileId, page, 'getting this in the services messages');

    // fetch messages involving the user
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [{ senderId: profileId }, { receiverId: profileId }],
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
      skip: skipItems,
      take: 20,
    });

    // extract unique message profiles
    const messageProfiles = messages.reduce(
      (acc, message) => {
        if (!message.sender || !message.sender.id || !message.receiver)
          return acc;
        const otherProfile =
          message.sender.id === profileId ? message.receiver : message.sender;

        if (!acc.some((p) => p.id === otherProfile.id)) {
          acc.push({
            id: otherProfile.id,
            firstName: otherProfile.firstName,
            lastName: otherProfile.lastName,
            avatarUrl: otherProfile.avatarUrl!,
          });
        }
        return acc;
      },
      [] as {
        id: number;
        firstName: string;
        lastName: string;
        avatarUrl?: string;
      }[],
    );

    return {
      messages,
      messageProfiles,
    };
  }

  async getUnreadMessagesCount(profileId: number) {
    const unreadMessagesCounter =
      await this.prisma.unreadMessagesCounter.findFirst({
        where: {
          profileId: profileId,
        },
      });
    if (!unreadMessagesCounter) {
      throw new Error('No unread messages counter found for this profileId');
    }
    return unreadMessagesCounter;
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

import { Injectable } from '@nestjs/common';
import PrismaService from 'src/prisma/prisma.service';
import { UploadService } from 'src/uploadResource/upload.service';
import { ProfileService } from 'src/Profile/Profile.service';
import { ConversationService } from 'src/conversation/conversation.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private conversationService: ConversationService,
  ) {}

  createMessage = async (createMessageDto: CreateMessageDto) => {
    try {
      const { message, otherProfileId } = createMessageDto;
      const { senderId, content, mediaFiles } = message;

      // get or create conversation between sender and receiver
      const conversation =
        await this.conversationService.getOrCreateConversation(
          senderId,
          otherProfileId,
        );

      // create message in the conversation
      const savedMessage = await this.prisma.message.create({
        data: {
          senderId,
          conversationId: conversation.id,
          content,
          mediaFiles: mediaFiles ? mediaFiles.map((file) => ({ ...file })) : [],
        },
      });
      return savedMessage;
    } catch (error) {
      throw error;
    }
  };

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

  // get last read message for a conversation
  async getMoreMessagesForConversation(
    conversationId: number,
    cursorTo?: string, // last message ID you already have
  ) {
    const pageSize = 5;

    try {
      const messages = await this.prisma.message.findMany({
        where: {
          conversationId,
        },
        orderBy: [
          { createdAt: 'desc' },
          { id: 'desc' }, // tie-breaker (VERY important)
        ],
        take: pageSize,
        ...(cursorTo && {
          cursor: { id: cursorTo }, // STRING cursor ✔
          skip: 1, // avoid duplicate
        }),
      });

      return messages;
    } catch (error) {
      throw error;
    }
  }
}

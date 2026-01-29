import { Injectable } from '@nestjs/common';
import PrismaService from 'src/prisma/prisma.service';
import { UploadService } from 'src/uploadResource/upload.service';
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

  async getMoreMessagesForConversation(
    conversationId: number,
    cursorTo?: string,
  ) {
    const pageSize = 20;

    // Get messages backwards using the cursor faster way
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      take: pageSize, // Still moving "down" the list
      orderBy: [
        { createdAt: 'desc' }, // Primary: Time-based
        { id: 'desc' }, // Secondary: Lexicographical tie-breaker
      ],
      ...(cursorTo && {
        cursor: { id: cursorTo }, // Prisma finds this exact string
        skip: 1,
      }),
    });

    return messages;
  }

  async getNewMessagesForConversation(
    conversationId: number,
    cursorTo?: string,
  ) {
    // Get messages forwards using the cursor faster way
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: [
        { createdAt: 'asc' }, // Primary: Time-based
        { id: 'asc' }, // Secondary: Lexicographical tie-breaker
      ],
      ...(cursorTo && {
        cursor: { id: cursorTo }, // Prisma finds this exact string
        skip: 1,
      }),
    });

    return messages;
  }
}

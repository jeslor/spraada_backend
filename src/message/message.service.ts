import { Injectable } from '@nestjs/common';
import PrismaService from 'src/prisma/prisma.service';
import { UploadService } from 'src/uploadResource/upload.service';
import { ConversationService } from 'src/conversation/conversation.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatNotificationGateway } from 'src/events/ChatNotification.gateway';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private conversationService: ConversationService,
    private chatNotificationGateway: ChatNotificationGateway,
  ) {}

  createMessage = async (createMessageDto: CreateMessageDto) => {
    try {
      const { message, otherProfileId } = createMessageDto;
      const { senderId, content, mediaFiles } = message;

      // 1. Get or create conversation
      // Ensure this returns the participants' data (firstName, lastName, etc.)
      const conversation =
        await this.conversationService.getOrCreateConversation(
          senderId,
          otherProfileId,
        );

      // 2. Create message
      const savedMessage = await this.prisma.message.create({
        data: {
          senderId,
          conversationId: conversation.id,
          content,
          // If mediaFiles is a JSON column, this is fine.
          // If it's a relation, you'd use: mediaFiles: { create: mediaFiles }
          mediaFiles: mediaFiles ? mediaFiles.map((file) => ({ ...file })) : [],
        },
      });

      const newCounter =
        conversation.participantOneId === otherProfileId
          ? conversation.unreadCountParticipantOne + 1
          : conversation.unreadCountParticipantTwo + 1;

      //3 .update unread count for the other participant
      await this.conversationService.updateUnreadCount(
        conversation.id,
        newCounter,
        otherProfileId,
      );

      // 4. Simplify Participant Logic
      // We just need to know who the sender is to tell the socket "X sent a message"
      const senderData =
        conversation.participantOneId === senderId
          ? conversation.participantOne
          : conversation.participantTwo;

      // 5. Socket Emission
      // We send to 'otherProfileId' because they are the recipient.
      this.sendMessageToSocket(
        otherProfileId,
        conversation.id,
        {
          id: senderData.id,
          firstName: senderData.firstName,
          lastName: senderData.lastName,
          avatarUrl: senderData.avatarUrl ?? undefined,
        },
        savedMessage,
      );

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
        const messageUpdated = await this.prisma.message.update({
          where: {
            id: message.id,
          },
          data: {
            deletedByReceiver: true,
            deletedBySender: true,
            content: '',
            mediaFiles: [],
          },
          include: {
            conversation: {
              include: {
                participantOne: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
                participantTwo: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        });

        if (!messageUpdated) {
          throw new Error('Failed to update message as deleted');
        }
        const participantOne =
          messageUpdated.conversation.participantOne.id === profileId
            ? messageUpdated.conversation.participantTwo
            : messageUpdated.conversation.participantOne;

        // participant 2 is the other participant
        const participantTwo =
          messageUpdated.conversation.participantTwo.id !== profileId
            ? messageUpdated.conversation.participantOne
            : messageUpdated.conversation.participantTwo;

        if (participantOne.id !== profileId) {
          this.chatNotificationGateway.emitNewMessage({
            receiverId: participantOne.id,
            conversationId: message.conversationId,
            otherParticipant: {
              id: participantTwo.id,
              firstName: participantTwo.firstName,
              lastName: participantTwo.lastName,
              avatarUrl: participantTwo.avatarUrl || undefined,
            },
            message,
          });
        }

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

  //helper function to send message

  sendMessageToSocket(
    receiverId: number,
    conversationId: number,
    otherParticipant: any,
    message: any,
  ) {
    this.chatNotificationGateway.emitNewMessage({
      receiverId,
      conversationId,
      otherParticipant,
      message,
    });
  }
}

import { Injectable } from '@nestjs/common';
import PrismaService from 'src/prisma/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  //create or get existing conversation between two participants
  async getOrCreateConversation(
    participantOneId: number,
    participantTwoId: number,
  ) {
    const [lowerId, higherId] =
      participantOneId < participantTwoId
        ? [participantOneId, participantTwoId]
        : [participantTwoId, participantOneId];

    return await this.prisma.conversation.upsert({
      where: {
        participantOneId_participantTwoId: {
          participantOneId: lowerId,
          participantTwoId: higherId,
        },
      },
      update: {
        updatedAt: new Date(),
      },
      create: {
        participantOneId: lowerId,
        participantTwoId: higherId,
      },
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
    });
  }

  //get conversations with the unread first
  async getConversationsWithUnreadFirst(profileAId: number) {
    const results = await this.prisma.conversation.findMany({
      where: {
        AND: [
          {
            OR: [
              { participantOneId: profileAId },
              { participantTwoId: profileAId },
            ],
          },
          {
            OR: [
              { unreadCountParticipantOne: { gt: 0 } },
              { unreadCountParticipantTwo: { gt: 0 } },
            ],
          },
        ],
      },
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
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Fetch latest 10 messages
        },
      },
    });
    return results.map((conversation) => {
      const otherParticipant =
        conversation.participantOneId === profileAId
          ? conversation.participantTwo
          : conversation.participantOne;
      const unreadCount =
        conversation.participantOneId === profileAId
          ? conversation.unreadCountParticipantOne
          : conversation.unreadCountParticipantTwo;
      return {
        id: conversation.id,
        otherParticipant: otherParticipant,
        messages: conversation.messages.reverse(),
        unreadCount: unreadCount,
      };
    });
  }

  async getConversationsForUser(profileAId: number, page: number = 1) {
    const pageSize = 20;
    const skip = (page - 1) * pageSize;
    // Implementation for retrieving conversations for a user
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [
          { participantOneId: profileAId },
          { participantTwoId: profileAId },
        ],
      },
      skip,
      take: pageSize,
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
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Fetch latest 10 messages
        },
      },
    });
    return conversations.map((conversation) => {
      const otherParticipant =
        conversation.participantOneId === profileAId
          ? conversation.participantTwo
          : conversation.participantOne;
      const unreadCount =
        conversation.participantOneId === profileAId
          ? conversation.unreadCountParticipantOne
          : conversation.unreadCountParticipantTwo;
      return {
        id: conversation.id,
        otherParticipant: otherParticipant,
        messages: conversation.messages.reverse(),
        unreadCount: unreadCount,
      };
    });
  }

  async updateUnreadCount(
    conversationId: number,
    unreadCount: number,
    profileId: number,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (
      profileId !== conversation.participantOneId &&
      profileId !== conversation.participantTwoId
    ) {
      throw new Error('Profile is not a participant of the conversation');
    }

    if (profileId === conversation.participantOneId) {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { unreadCountParticipantOne: unreadCount },
      });
    } else {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { unreadCountParticipantTwo: unreadCount },
      });
    }

    return { conversationId, unreadCount };
  }
}

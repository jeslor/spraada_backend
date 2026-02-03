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
    const profileKey = `profile_${profileAId}`;

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
            unReadMessagesCounters: {
              path: [profileKey],
              gt: 0,
            },
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
          take: 10,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    console.log(results);

    return results.map((conversation) => {
      const otherParticipant =
        conversation.participantOneId === profileAId
          ? conversation.participantTwo
          : conversation.participantOne;

      const unreadCount =
        conversation.unReadMessagesCounters?.[profileKey] || 0;
      return {
        id: conversation.id,
        otherParticipant,
        messages: conversation.messages.reverse(),
        unreadCount,
      };
    });
  }

  async getConversationsForUser(profileAId: number, page: number = 1) {
    const pageSize = 20;
    const skip = (page - 1) * pageSize;
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
          take: 10,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map((conversation) => {
      const otherParticipant =
        conversation.participantOneId === profileAId
          ? conversation.participantTwo
          : conversation.participantOne;

      const unreadCount =
        conversation.unReadMessagesCounters?.[`profile_${profileAId}`] || 0;
      return {
        id: conversation.id,
        otherParticipant,
        messages: conversation.messages.reverse(),
        unreadCount,
      };
    });
  }

  //update unread count for a profile in a conversation, used when receiving new messages
  async updateUnreadCount(
    conversationId: number,
    unreadCount: number,
    profileId: number,
  ) {
    if (!conversationId || !profileId) {
      throw new Error('conversationId and profileId are required');
    }
    const profileKey = `profile_${profileId}`;

    const conversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        unReadMessagesCounters: {
          ...(profileId && { [profileKey]: unreadCount }),
        },
      },
    });
    return conversation;
  }

  // Mark conversation as read
  async markConversationAsRead(conversationId: number, profileId: number) {
    if (!conversationId || !profileId) {
      throw new Error('conversationId and profileId are required');
    }
    const profileKey = `profile_${profileId}`;

    const conversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        unReadMessagesCounters: {
          ...(profileId && { [profileKey]: 0 }),
        },
      },
    });
    return conversation;
  }
}

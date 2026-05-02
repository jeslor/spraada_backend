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

    // Get all conversations for this user with unread count info, sorted by unread first then by update time
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [
          { participantOneId: profileAId },
          { participantTwoId: profileAId },
        ],
      },
      select: {
        id: true,
        participantOneId: true,
        participantTwoId: true,
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
        unReadMessagesCounters: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          // Load only the latest message for the conversation preview in the sidebar.
          // Full message history is loaded on demand when the user opens a conversation.
          take: 1,
        },
      },
      orderBy: [
        { updatedAt: 'desc' }, // Most recent conversations first
      ],
    });

    // Process results and sort by unread count
    const results = conversations
      .map((conversation) => {
        const otherParticipant =
          conversation.participantOneId === profileAId
            ? conversation.participantTwo
            : conversation.participantOne;

        const unreadCount =
          conversation.unReadMessagesCounters?.[profileKey] || 0;

        // Reverse to get chronological order
        const messages = conversation.messages.reverse();

        return {
          id: conversation.id,
          otherParticipant,
          messages,
          unreadCount,
        };
      })
      .sort((a, b) => {
        // Sort by unread count first (descending), then by update time
        if (a.unreadCount !== b.unreadCount) {
          return b.unreadCount - a.unreadCount;
        }
        return 0;
      });

    return results;
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
          // Load only the latest message for the conversation preview in the sidebar.
          take: 1,
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

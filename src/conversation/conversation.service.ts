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
            createdAt: 'asc',
          },
          take: 5,
        },
      },
    });
    return conversations.map((conversation) => {
      const otherParticipant =
        conversation.participantOneId === profileAId
          ? conversation.participantTwo
          : conversation.participantOne;
      return {
        id: conversation.id,
        otherParticipant: otherParticipant,
        messages: conversation.messages,
      };
    });
  }
}

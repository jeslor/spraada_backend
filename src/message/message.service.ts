import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import PrismaService from 'src/prisma/prisma.service';
import { UploadService } from 'src/uploadResource/upload.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

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

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}

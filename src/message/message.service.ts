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

  getMessagesForUser(userId: number) {}

  getProfilesForUser(userId: number) {}

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

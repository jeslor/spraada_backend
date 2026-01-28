import { Controller, Get, Post, Body } from '@nestjs/common';
import { MessageService } from './message.service';
import { deleteMessageDto } from './dto/delete-message.dto';
import { isPublicEndpoint } from 'src/Auth/decorator';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @isPublicEndpoint()
  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    console.log(createMessageDto);

    return this.messageService.createMessage(createMessageDto);
  }

  // delete message endpoint
  @isPublicEndpoint()
  @Post('delete')
  deleteMessage(@Body() dto: deleteMessageDto) {
    return this.messageService.deleteMessage(
      dto.message,
      Number(dto.profileId),
      Number(dto.userId),
    );
  }
}

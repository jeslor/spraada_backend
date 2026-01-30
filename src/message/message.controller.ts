import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessageService } from './message.service';
import { deleteMessageDto } from './dto/delete-message.dto';
import { isPublicEndpoint } from 'src/Auth/decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { cursorTo } from 'readline';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @isPublicEndpoint()
  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
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

  @isPublicEndpoint()
  @Post('more/:conversationId')
  getMoreMessagesForConversation(
    @Param('conversationId') conversationId: number,
    @Body('cursorTo') cursorTo: string,
  ) {
    return this.messageService.getMoreMessagesForConversation(
      conversationId,
      cursorTo,
    );
  }

  @isPublicEndpoint()
  @Post('new/:conversationId')
  getNewMessagesForConversation(
    @Param('conversationId') conversationId: number,
    @Body('cursorTo') cursorTo: string,
  ) {
    return this.messageService.getNewMessagesForConversation(
      conversationId,
      cursorTo,
    );
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { deleteMessageDto } from './dto/delete-message.dto';
import { isPublicEndpoint } from 'src/Auth/decorator';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @isPublicEndpoint()
  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.createMessage(createMessageDto);
  }

  @isPublicEndpoint()
  @Get()
  getMessages(
    @Query('profileId') profileId: string,
    @Query('page') page: string,
  ) {
    return this.messageService.getMessagesForUser(
      Number(profileId),
      Number(page),
    );
  }

  @isPublicEndpoint()
  @Get('unreadCount')
  getUnreadMessagesCount(@Query('profileId') profileId: string) {
    return this.messageService.getUnreadMessagesCount(Number(profileId));
  }

  @isPublicEndpoint()
  @Post('unreadCount/:messageCounterId')
  updateUnreadMessagesCount(
    @Param('messageCounterId') messageCounterId: string,
    @Body() body: { profileId: number; counters: { [key: number]: number } },
  ) {
    return this.messageService.updateUnreadMessagesCount(
      Number(messageCounterId),
      Number(body.profileId),
      body.counters,
    );
  }

  @isPublicEndpoint()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(+id);
  }

  @isPublicEndpoint()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(+id, updateMessageDto);
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

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

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.createMessage(createMessageDto);
  }

  @Get()
  getMessages(@Query('userId') userId: string) {
    return this.messageService.getMessagesForUser(Number(userId));
  }

  @Get('unreadCount')
  getUnreadMessagesCount(@Query('profileId') profileId: string) {
    return this.messageService.getUnreadMessagesCount(Number(profileId));
  }
  @Patch('unreadCount/:messageCounterId')
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(+id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageService.remove(+id);
  }
}

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

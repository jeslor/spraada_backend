import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Patch,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { isPublicEndpoint } from 'src/Auth/decorator';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @isPublicEndpoint()
  @Get(':profileId')
  getConversationsForUser(
    @Param('profileId') profileId: string,
    @Query('page') page?: string,
  ) {
    return this.conversationService.getConversationsForUser(
      Number(profileId),
      page ? Number(page) : 1,
    );
  }

  @isPublicEndpoint()
  @Get('/:profileId/unread-first')
  getConversationsForUserUnreadFirst(@Param('profileId') profileId: string) {
    return this.conversationService.getConversationsWithUnreadFirst(
      Number(profileId),
    );
  }

  @isPublicEndpoint()
  @Patch('/:conversationId/mark-as-read')
  markConversationAsRead(
    @Param('conversationId') conversationId: string,
    @Body('profileId') profileId: number,
  ) {
    return this.conversationService.markConversationAsRead(
      Number(conversationId),
      profileId,
    );
  }
}

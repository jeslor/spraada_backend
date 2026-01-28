import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
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
}

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationDto } from './dto/notification.dto';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatNotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor() {}
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (!userId) {
      console.log('Missing userId → disconnecting');
      client.disconnect();
      return;
    }

    client.join(`user:${userId}`);
    client.data.userId = userId;
  }

  handleDisconnect(client: Socket) {}

  @SubscribeMessage('conversation')
  async handleMessage(
    @MessageBody()
    data: {
      receiverId: number;
      conversationId: number;
      otherParticipant: {
        id: number;
        firstName: string;
        lastName: string;
        avatarUrl?: string;
      };
      message: any;
    },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.userId) {
      client.emit('chatError', 'Unauthorized');
      return;
    }

    this.server.to(`user:${data.receiverId}`).emit('conversation', {
      conversationId: data.conversationId,
      otherParticipant: data.otherParticipant,
      message: data.message,
    });
  }

  /// backend emitter
  emitNewMessage(data: {
    receiverId: number;
    conversationId: number;
    otherParticipant: any;
    message: any;
  }) {
    this.server.to(`user:${data.receiverId}`).emit('conversation', {
      conversationId: data.conversationId,
      otherParticipant: data.otherParticipant,
      message: data.message,
    });
  }

  // notification event
  @SubscribeMessage('notifications')
  async handleNotification(
    @MessageBody()
    data: NotificationDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.userId) {
      client.emit('notificationError', 'Unauthorized');
      return;
    }

    this.server.to(`user:${data.profileId}`).emit('notifications', data);
  }
}

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
  cors: {
    origin: 'https://spraada-frontend.vercel.app/*',
    methods: ['GET', 'POST'],
  },
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

  @SubscribeMessage('chats')
  async handleMessage(
    @MessageBody()
    data: {
      id?: string;
      deletedBySender?: boolean;
      deletedByReceiver?: boolean;
      receiverId: number;
      senderId: number;
      content: string;
      mediaFiles: { mediaUrl: string; mediaUrlKey: string }[];
    },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.userId) {
      client.emit('chatError', 'Unauthorized');
      return;
    }

    this.server.to(`user:${data.receiverId}`).emit('chats', data);
  }

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

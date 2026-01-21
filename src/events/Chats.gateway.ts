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
import { MessageService } from 'src/message/message.service';
import { UploadService } from 'src/uploadResource/upload.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private uploadService: UploadService,
    private messageService: MessageService,
  ) {}
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
}

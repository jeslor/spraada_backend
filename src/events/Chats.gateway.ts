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

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Handshake auth:', client.handshake.auth);

    const userId = client.handshake.auth?.userId;
    if (!userId) {
      console.log('Missing userId → disconnecting');
      client.disconnect();
      return;
    }

    client.join(`user:${userId}`);
    client.data.userId = userId;
  }

  handleDisconnect(client: Socket) {
    console.log(`User disconnected: ${client.data.userId}`);
  }

  @SubscribeMessage('chats')
  handleMessage(
    @MessageBody() data: { userId: number; text: string; file?: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.userId) {
      client.emit('chatError', 'Unauthorized');
      return;
    }

    this.server.to(`user:${data.userId}`).emit('chats', {
      from: client.data.userId,
      text: data.text,
      file: data.file ?? null,
    });
  }
}

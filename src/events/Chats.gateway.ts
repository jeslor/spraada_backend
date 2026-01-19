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
    data: { userId: number; content: string; files?: Express.Multer.File[] },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.userId) {
      client.emit('chatError', 'Unauthorized');
      return;
    }
    //save the files to s3 and get the url
    let savedFiles: { key: string; url: string }[] = [];
    if (data.files && data.files.length) {
      savedFiles = await this.uploadService.uploadImages(
        data.files,
        client.data.userId,
        'chat-media',
      );
    }
    //Save message to database with the file url if exists
    const savedMessage = await this.messageService.createMessage({
      senderId: client.data.userId,
      receiverId: data.userId,
      content: data.content,
      mediaFiles: savedFiles.map((file) => ({
        mediaUrl: file.url,
        mediaUrlKey: file.key,
      })),
    });

    this.server.to(`user:${data.userId}`).emit('chats', savedMessage);
  }
}

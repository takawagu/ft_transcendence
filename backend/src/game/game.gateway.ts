import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  afterInit(server: Server) {
    this.gameService.setServer(server);
  }

  handleConnection(client: Socket) {
    console.log(`[WS] connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WS] disconnected: ${client.id}`);
    this.gameService.handleDisconnect(client.id);
  }

  @SubscribeMessage('joinQueue')
  handleJoinQueue(@ConnectedSocket() client: Socket) {
    this.gameService.joinQueue(client);
  }

  @SubscribeMessage('leaveQueue')
  handleLeaveQueue(@ConnectedSocket() client: Socket) {
    this.gameService.leaveQueue(client.id);
  }

  @SubscribeMessage('paddleMove')
  handlePaddleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { direction: 'up' | 'down' },
  ) {
    this.gameService.movePaddle(client.id, payload.direction);
  }
}

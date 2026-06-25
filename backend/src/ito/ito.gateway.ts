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
import { ItoService } from './ito.service';
import {
  ITO_EVENTS,
  CreateRoomPayload,
  JoinRoomPayload,
  StartGamePayload,
  SubmitPromptPayload,
  PlaceCardPayload,
  ReorderCardsPayload,
  SendChatPayload,
} from './ito.events';

@WebSocketGateway({ namespace: '/ito', cors: { origin: '*' } })
export class ItoGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly itoService: ItoService) {}

  afterInit(server: Server) {
    this.itoService.setServer(server);
  }

  handleConnection(client: Socket) {
    console.log(`[ITO] connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[ITO] disconnected: ${client.id}`);
    this.itoService.handleDisconnect(client.id);
  }

  @SubscribeMessage(ITO_EVENTS.CREATE_ROOM)
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateRoomPayload,
  ) {
    this.itoService.createRoom(client, payload.playerName);
  }

  @SubscribeMessage(ITO_EVENTS.JOIN_ROOM)
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    this.itoService.joinRoom(client, payload);
  }

  @SubscribeMessage(ITO_EVENTS.START_GAME)
  handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: StartGamePayload,
  ) {
    this.itoService.startGame(client, payload);
  }

  @SubscribeMessage(ITO_EVENTS.SUBMIT_PROMPT)
  handleSubmitPrompt(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubmitPromptPayload,
  ) {
    this.itoService.submitPrompt(client, payload);
  }

  @SubscribeMessage(ITO_EVENTS.PLACE_CARD)
  handlePlaceCard(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PlaceCardPayload,
  ) {
    this.itoService.placeCard(client, payload);
  }

  @SubscribeMessage(ITO_EVENTS.REORDER_CARDS)
  handleReorderCards(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ReorderCardsPayload,
  ) {
    this.itoService.reorderCards(client, payload);
  }

  @SubscribeMessage(ITO_EVENTS.CONFIRM_ORDER)
  handleConfirmOrder(@ConnectedSocket() client: Socket) {
    this.itoService.confirmOrder(client);
  }

  @SubscribeMessage(ITO_EVENTS.SEND_CHAT)
  handleSendChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendChatPayload,
  ) {
    this.itoService.sendChat(client, payload);
  }
}

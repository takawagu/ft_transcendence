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
import { RoomService } from './service/room.service';
import { GameService } from './service/game.service';
import { BroadcastService } from './service/broadcast.service';
import {
  ITO_EVENTS,
  CreateRoomPayload,
  JoinRoomPayload,
  StartGamePayload,
  SubmitPromptPayload,
  PlaceCardPayload,
  ReorderCardsPayload,
  SendChatPayload,
  RejoinPayload,
} from './ito.events';

@WebSocketGateway({ namespace: '/ito', cors: { origin: '*' } })
export class ItoGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly roomService: RoomService,
    private readonly gameService: GameService,
    private readonly broadcastService: BroadcastService,
  ) {}

  afterInit(server: Server) {
    this.broadcastService.setServer(server);
  }

  handleConnection(client: Socket) {
    console.log(`[ITO] connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[ITO] disconnected: ${client.id}`);
    this.roomService.handleDisconnect(client.id);
  }

  @SubscribeMessage(ITO_EVENTS.CREATE_ROOM)
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateRoomPayload,
  ) {
    this.roomService.createRoom(client, payload.playerName, payload.playerId);
  }

  @SubscribeMessage(ITO_EVENTS.JOIN_ROOM)
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    this.roomService.joinRoom(client, payload);
  }

  @SubscribeMessage(ITO_EVENTS.LEAVE_ROOM)
  handleLeaveRoom(@ConnectedSocket() client: Socket) {
    this.roomService.leaveRoom(client);
  }

  @SubscribeMessage(ITO_EVENTS.DISSOLVE_ROOM)
  handleDissolveRoom(@ConnectedSocket() client: Socket) {
    this.roomService.dissolveRoom(client);
  }

  @SubscribeMessage(ITO_EVENTS.CONFIRM_MEMBERS)
  handleConfirmMembers(@ConnectedSocket() client: Socket) {
    this.roomService.confirmMembers(client);
  }

  @SubscribeMessage(ITO_EVENTS.START_GAME)
  handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: StartGamePayload,
  ) {
    this.gameService.startGame(client, payload);
  }

  @SubscribeMessage(ITO_EVENTS.SUBMIT_PROMPT)
  handleSubmitPrompt(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubmitPromptPayload,
  ) {
    this.gameService.submitPrompt(client, payload);
  }

  @SubscribeMessage(ITO_EVENTS.PLACE_CARD)
  handlePlaceCard(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PlaceCardPayload,
  ) {
    this.gameService.placeCard(client, payload);
  }

  @SubscribeMessage(ITO_EVENTS.REORDER_CARDS)
  handleReorderCards(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ReorderCardsPayload,
  ) {
    this.gameService.reorderCards(client, payload);
  }

  @SubscribeMessage(ITO_EVENTS.CONFIRM_ORDER)
  handleConfirmOrder(@ConnectedSocket() client: Socket) {
    this.gameService.confirmOrder(client);
  }

  @SubscribeMessage(ITO_EVENTS.SEND_CHAT)
  handleSendChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendChatPayload,
  ) {
    this.gameService.sendChat(client, payload);
  }

  @SubscribeMessage(ITO_EVENTS.REJOIN)
  handleRejoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RejoinPayload,
  ) {
    this.roomService.rejoin(client, payload);
  }

  @SubscribeMessage(ITO_EVENTS.EXCLUDE_PLAYER)
  handleExcludePlayer(@ConnectedSocket() client: Socket) {
    this.roomService.excludePlayer(client);
  }

  @SubscribeMessage(ITO_EVENTS.ABORT_GAME)
  handleAbortGame(@ConnectedSocket() client: Socket) {
    this.roomService.abortGame(client);
  }

  @SubscribeMessage(ITO_EVENTS.RESUME_GAME)
  handleResumeGame(@ConnectedSocket() client: Socket) {
    this.roomService.resumeGame(client);
  }
}

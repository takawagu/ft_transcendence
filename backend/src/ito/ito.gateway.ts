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
import { AuthService } from '../auth/auth.service';
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
  ExcludePlayerPayload,
  AwaitReturnPayload,
} from './ito.events';

/** 接続後にsocketへ保持する情報 */
interface ItoSocketData {
  /** ハンドシェイクのJWTから導出した本人のplayerId。認証済みの接続には必ず入る */
  playerId?: string;
}

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
    private readonly authService: AuthService,
  ) {}

  afterInit(server: Server) {
    this.broadcastService.setServer(server);
  }

  handleConnection(client: Socket) {
    const userId = this.authService.userIdFromToken(client.handshake.auth?.token);
    if (userId === undefined) {
      // 認証できない接続は保持しない（presence gatewayと同じ扱い）
      client.disconnect();
      return;
    }

    // playerIdはここで一度だけ確定させる。以降クライアントが名乗る値は一切見ない
    (client.data as ItoSocketData).playerId = String(userId);
    console.log(`[ITO] connected: ${client.id} (player ${userId})`);
  }

  /**
   * この接続の本人のplayerId。
   * クライアントが送ってくるplayerIdを信用すると、roomCodeと他人のuserIdを知っているだけで
   * 進行中の席を奪えてしまい、RESYNC_STATEでその人の手札番号まで読めてしまう。
   * 認証できない接続はhandleConnectionで切っているので、ここでは必ず値が入っている。
   */
  private playerIdOf(client: Socket): string {
    return (client.data as ItoSocketData).playerId!;
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
    this.roomService.createRoom(
      client,
      payload.playerName,
      this.playerIdOf(client),
      payload.totalRounds,
    );
  }

  @SubscribeMessage(ITO_EVENTS.JOIN_ROOM)
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    this.roomService.joinRoom(client, {
      ...payload,
      playerId: this.playerIdOf(client),
    });
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
    this.roomService.rejoin(client, {
      ...payload,
      playerId: this.playerIdOf(client),
    });
  }

  @SubscribeMessage(ITO_EVENTS.EXCLUDE_PLAYER)
  handleExcludePlayer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ExcludePlayerPayload,
  ) {
    this.roomService.excludePlayer(client, payload);
  }

  @SubscribeMessage(ITO_EVENTS.AWAIT_RETURN)
  handleAwaitReturn(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AwaitReturnPayload,
  ) {
    this.roomService.awaitReturn(client, payload);
  }

  @SubscribeMessage(ITO_EVENTS.ABORT_GAME)
  handleAbortGame(@ConnectedSocket() client: Socket) {
    this.roomService.abortGame(client);
  }

  @SubscribeMessage(ITO_EVENTS.RESUME_GAME)
  handleResumeGame(@ConnectedSocket() client: Socket) {
    this.roomService.resumeGame(client);
  }

  @SubscribeMessage(ITO_EVENTS.NEXT_ROUND)
  handleNextRound(@ConnectedSocket() client: Socket) {
    this.gameService.nextRound(client);
  }

  @SubscribeMessage(ITO_EVENTS.END_GAME)
  handleEndGame(@ConnectedSocket() client: Socket) {
    this.gameService.endGame(client);
  }
}

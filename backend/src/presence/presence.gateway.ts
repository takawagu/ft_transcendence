import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { PresenceService } from './presence.service';

/** AuthService.verifyToken は any を返すため、必要な形だけをここで表明する */
interface JwtPayload {
  userId?: unknown;
}

/** 接続後にsocketへ保持する情報 */
interface SocketData {
  userId?: number;
}

/**
 * オンライン状態と、フレンド申請通知を配信する名前空間。
 * nginxは `location /socket.io/` でsocket.ioを一括プロキシしており、
 * 名前空間は同一パス上を通るためnginx側の設定追加は不要。
 */
@WebSocketGateway({ namespace: '/presence', cors: { origin: '*' } })
export class PresenceGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly presenceService: PresenceService,
    private readonly authService: AuthService,
  ) {}

  afterInit(server: Server) {
    this.presenceService.setServer(server);
  }

  async handleConnection(client: Socket) {
    const userId = this.resolveUserId(client);
    if (userId === undefined) {
      // 認証できない接続は保持しない
      client.disconnect();
      return;
    }

    // handleDisconnectではhandshakeを再検証できないため、解決したuserIdをソケットに持たせる
    (client.data as SocketData).userId = userId;
    await this.presenceService.handleConnect(userId, client.id);
  }

  async handleDisconnect(client: Socket) {
    const { userId } = client.data as SocketData;
    if (userId === undefined) return;

    await this.presenceService.handleDisconnect(userId, client.id);
  }

  private resolveUserId(client: Socket): number | undefined {
    const token: unknown = client.handshake.auth?.token;
    if (typeof token !== 'string') return undefined;

    try {
      const payload = this.authService.verifyToken(token) as JwtPayload;
      return typeof payload?.userId === 'number' ? payload.userId : undefined;
    } catch {
      return undefined;
    }
  }
}

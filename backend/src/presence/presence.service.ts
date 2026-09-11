import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import {
  PRESENCE_EVENTS,
  PresenceChangedPayload,
  PresenceSnapshotPayload,
  DmClearUnreadPayload,
} from './presence.events';

/**
 * オンライン状態をプロセス内メモリで管理する。
 * ito の RoomStore と同じくDBには持たせない。プロセス再起動で全員オフラインに戻るが、
 * socket.ioの自動再接続で復帰するため許容する（docs/friend-requirements.md セクション4）。
 */
@Injectable()
export class PresenceService {
  private server: Server;

  /** userId → そのユーザーが張っている接続のsocketId集合（複数タブ対応） */
  private readonly sockets = new Map<number, Set<string>>();

  constructor(private readonly prisma: PrismaService) {}

  setServer(server: Server) {
    this.server = server;
  }

  /**
   * 接続を登録する。
   * 「オフライン→オンライン」に遷移した時だけフレンドへ通知する。
   * タブを開くたびに通知が飛ぶのを避けるため、2つ目以降の接続では何も配信しない。
   */
  async handleConnect(userId: number, socketId: string): Promise<void> {
    let userSockets = this.sockets.get(userId);
    const becameOnline = userSockets === undefined || userSockets.size === 0;

    if (!userSockets) {
      userSockets = new Set();
      this.sockets.set(userId, userSockets);
    }
    userSockets.add(socketId);

    const friendIds = await this.getFriendIds(userId);

    // 接続した本人には、現在オンラインのフレンド一覧を1回だけ返す
    const snapshot: PresenceSnapshotPayload = {
      onlineFriendIds: friendIds.filter((id) => this.isOnline(id)),
    };
    this.server.to(socketId).emit(PRESENCE_EVENTS.SNAPSHOT, snapshot);

    if (becameOnline) {
      this.notifyUsers(friendIds, { userId, online: true });
    }
  }

  /** 「オンライン→オフライン」に遷移した時だけフレンドへ通知する */
  async handleDisconnect(userId: number, socketId: string): Promise<void> {
    const userSockets = this.sockets.get(userId);
    if (!userSockets) return;

    userSockets.delete(socketId);
    if (userSockets.size > 0) return;

    this.sockets.delete(userId);

    const friendIds = await this.getFriendIds(userId);
    this.notifyUsers(friendIds, { userId, online: false });
  }

  isOnline(userId: number): boolean {
    const userSockets = this.sockets.get(userId);
    return userSockets !== undefined && userSockets.size > 0;
  }

  /** 指定ユーザーの全接続へ送る。未接続なら何も起きない */
  emitToUser(userId: number, event: string, payload: unknown): void {
    const userSockets = this.sockets.get(userId);
    if (!userSockets) return;

    for (const socketId of userSockets) {
      this.server.to(socketId).emit(event, payload);
    }
  }

  /**
   * ブロック実行時に、双方の画面から相手を即座にオフライン化し、未読バッジを消去する。
   * Friendship行が消えるだけでは、接続中のクライアントの onlineFriendIds や
   * unreadCounts に相手が残ったままリロードするまで表示が続いてしまう。
   */
  notifyBlocked(blockerId: number, blockedId: number): void {
    this.emitToUser(blockerId, PRESENCE_EVENTS.CHANGED, {
      userId: blockedId,
      online: false,
    } satisfies PresenceChangedPayload);

    this.emitToUser(blockedId, PRESENCE_EVENTS.CHANGED, {
      userId: blockerId,
      online: false,
    } satisfies PresenceChangedPayload);

    this.emitToUser(blockerId, PRESENCE_EVENTS.DM_CLEAR_UNREAD, {
      userId: blockedId,
    } satisfies DmClearUnreadPayload);

    this.emitToUser(blockedId, PRESENCE_EVENTS.DM_CLEAR_UNREAD, {
      userId: blockerId,
    } satisfies DmClearUnreadPayload);
  }

  /**
   * 申請が承認されて新たにフレンドになった直後、双方へ相手の現在の在席を伝える。
   * 接続時のsnapshotにはまだ相手が含まれていないため、これが無いと
   * リロードするまで新しいフレンドが常にオフライン表示になる。
   */
  notifyNewFriendship(userIdA: number, userIdB: number): void {
    this.emitToUser(userIdA, PRESENCE_EVENTS.CHANGED, {
      userId: userIdB,
      online: this.isOnline(userIdB),
    } satisfies PresenceChangedPayload);

    this.emitToUser(userIdB, PRESENCE_EVENTS.CHANGED, {
      userId: userIdA,
      online: this.isOnline(userIdA),
    } satisfies PresenceChangedPayload);
  }

  private notifyUsers(
    userIds: number[],
    payload: PresenceChangedPayload,
  ): void {
    for (const id of userIds) {
      this.emitToUser(id, PRESENCE_EVENTS.CHANGED, payload);
    }
  }

  /**
   * ACCEPTEDなフレンドのuserIdのみを引く。
   * ブロック時にFriendship行は削除されるため、ブロック相手は自然に対象外になる。
   */
  private async getFriendIds(userId: number): Promise<number[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ applicantId: userId }, { approverId: userId }],
        status: 'ACCEPTED',
      },
      select: { applicantId: true, approverId: true },
    });

    return friendships.map((f) =>
      f.applicantId === userId ? f.approverId : f.applicantId,
    );
  }
}

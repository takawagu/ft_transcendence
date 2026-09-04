import { Injectable } from '@nestjs/common';
import { ItoPlayer, ItoRoom } from '../types';

/**
 * 接続中が0人になった部屋を捨てるまでの猶予。
 * 全員が同時にリロードしただけの状態と、本当に誰も戻らない状態を、
 * サーバ側からはこの時間差でしか区別できない。
 */
export const ROOM_DISPOSE_GRACE_MS = 2 * 60 * 1000;

@Injectable()
export class RoomStore {
  private rooms = new Map<string, ItoRoom>();
  private socketToPlayer = new Map<string, { roomId: string; playerId: string }>();
  private roomCodeToId = new Map<string, string>();
  private disposeTimers = new Map<string, NodeJS.Timeout>();

  /**
   * socketIdから部屋とプレイヤーを一度に解決する。
   * player.socketIdとの一致を検証するため、再接続で無効化された古いソケットから
   * イベントが届いても解決に失敗し、そのまま無視される。
   */
  resolve(socketId: string): { room: ItoRoom; player: ItoPlayer } | undefined {
    const link = this.socketToPlayer.get(socketId);
    if (!link) return undefined;

    const room = this.rooms.get(link.roomId);
    if (!room) return undefined;

    const player = room.players.find((p) => p.playerId === link.playerId);
    if (!player || player.socketId !== socketId) return undefined;

    return { room, player };
  }

  getRoomBySocketId(socketId: string): ItoRoom | undefined {
    return this.resolve(socketId)?.room;
  }

  getRoomByCode(roomCode: string): ItoRoom | undefined {
    const roomId = this.roomCodeToId.get(roomCode);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  getRoomById(roomId: string): ItoRoom | undefined {
    return this.rooms.get(roomId);
  }

  addRoom(room: ItoRoom): void {
    this.rooms.set(room.id, room);
    this.roomCodeToId.set(room.roomCode, room.id);
  }

  linkSocket(socketId: string, roomId: string, playerId: string): void {
    // ソケットが部屋に紐づいた＝誰かが繋がったということなので、廃棄予約は無効になる。
    // createRoom/joinRoom/rejoinの3経路が必ずここを通るため、取り消しはここ1箇所で足りる。
    this.cancelDisposal(roomId);
    this.socketToPlayer.set(socketId, { roomId, playerId });
  }

  unlinkSocket(socketId: string): void {
    this.socketToPlayer.delete(socketId);
  }

  /** 部屋を消す前に、その部屋に紐づく全ソケットのリンクを外してMapのリークを防ぐ */
  unlinkRoomSockets(room: ItoRoom): void {
    for (const [socketId, link] of this.socketToPlayer) {
      if (link.roomId === room.id) this.socketToPlayer.delete(socketId);
    }
  }

  deleteRoom(roomId: string, roomCode: string): void {
    this.cancelDisposal(roomId);
    this.roomCodeToId.delete(roomCode);
    this.rooms.delete(roomId);
  }

  /**
   * 接続中が0人になった部屋の廃棄を猶予付きで予約する（即削除の代わり）。
   * 全員が同時にリロードしただけでも部屋が消える、という事故を防ぐのが目的。
   * 猶予内にlinkSocketが起きれば予約は取り消される。
   */
  scheduleDisposal(room: ItoRoom, delayMs = ROOM_DISPOSE_GRACE_MS): void {
    this.cancelDisposal(room.id);

    const timer = setTimeout(() => {
      this.disposeTimers.delete(room.id);
      // 取り消し漏れへの保険。発火時点で本当に誰も繋がっていないことを確かめてから消す。
      if (!this.rooms.has(room.id)) return;
      if (room.players.some((p) => p.socketId !== null)) return;

      this.unlinkRoomSockets(room);
      this.deleteRoom(room.id, room.roomCode);
      console.log(`[ITO] room ${room.roomCode} disposed (nobody returned)`);
    }, delayMs);

    // 予約中の部屋がプロセスの終了を引き止めないようにする
    timer.unref?.();
    this.disposeTimers.set(room.id, timer);
  }

  cancelDisposal(roomId: string): void {
    const timer = this.disposeTimers.get(roomId);
    if (!timer) return;
    clearTimeout(timer);
    this.disposeTimers.delete(roomId);
  }

  hasRoom(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code: string;
    do {
      code = Array.from(
        { length: 6 },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join('');
    } while (this.roomCodeToId.has(code));
    return code;
  }
}

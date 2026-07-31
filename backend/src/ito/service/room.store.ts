import { Injectable } from '@nestjs/common';
import { ItoPlayer, ItoRoom } from '../types';

@Injectable()
export class RoomStore {
  private rooms = new Map<string, ItoRoom>();
  private socketToPlayer = new Map<string, { roomId: string; playerId: string }>();
  private roomCodeToId = new Map<string, string>();

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
    this.roomCodeToId.delete(roomCode);
    this.rooms.delete(roomId);
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

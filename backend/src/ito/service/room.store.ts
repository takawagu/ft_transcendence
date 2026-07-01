import { Injectable } from '@nestjs/common';
import { ItoRoom } from '../types';

@Injectable()
export class RoomStore {
  private rooms = new Map<string, ItoRoom>();
  private socketToRoomId = new Map<string, string>();
  private roomCodeToId = new Map<string, string>();

  getRoomBySocketId(socketId: string): ItoRoom | undefined {
    const roomId = this.socketToRoomId.get(socketId);
    return roomId ? this.rooms.get(roomId) : undefined;
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

  linkSocket(socketId: string, roomId: string): void {
    this.socketToRoomId.set(socketId, roomId);
  }

  unlinkSocket(socketId: string): void {
    this.socketToRoomId.delete(socketId);
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

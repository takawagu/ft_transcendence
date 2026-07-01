import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ITO_EVENTS, JoinRoomPayload } from '../ito.events';
import { ItoRoom } from '../types';
import { RoomStore } from './room.store';
import { BroadcastService } from './broadcast.service';

@Injectable()
export class RoomService {
  constructor(
    private readonly store: RoomStore,
    private readonly broadcast: BroadcastService,
  ) {}

  createRoom(client: Socket, playerName: string) {
    const roomCode = this.store.generateRoomCode();
    const roomId = `ito_${Date.now()}`;

    const room: ItoRoom = {
      id: roomId,
      roomCode,
      roomPhase: 'WAITING',
      players: [
        {
          socketId: client.id,
          name: playerName,
          isRoomOwner: true,
          playerPhase: 'INPUT',
          hasSubmittedPrompt: false,
        },
      ],
      theme: '',
      totalRounds: 1,
      currentRound: 0,
      turnOrder: [],
      currentTurnIndex: 0,
      roundHostId: '',
      boardOrder: [],
    };

    this.store.addRoom(room);
    this.store.linkSocket(client.id, roomId);
    client.join(roomId);

    this.broadcast.broadcastRoomState(room);
    console.log(`[ITO] room created: ${roomCode} by ${playerName}`);
  }

  joinRoom(client: Socket, payload: JoinRoomPayload) {
    const room = this.store.getRoomByCode(payload.roomCode);
    if (!room) {
      client.emit('ito:error', { message: 'ルームが見つかりません' });
      return;
    }
    if (room.roomPhase !== 'WAITING') {
      client.emit('ito:error', { message: 'ゲームはすでに開始されています' });
      return;
    }
    if (room.players.length >= 6) {
      client.emit('ito:error', { message: 'ルームが満員です' });
      return;
    }

    room.players.push({
      socketId: client.id,
      name: payload.playerName,
      isRoomOwner: false,
      playerPhase: 'INPUT',
      hasSubmittedPrompt: false,
    });
    this.store.linkSocket(client.id, room.id);
    client.join(room.id);

    this.broadcast.broadcastRoomState(room);
    console.log(`[ITO] ${payload.playerName} joined room ${payload.roomCode}`);
  }

  leaveRoom(client: Socket) {
    const room = this.store.getRoomBySocketId(client.id);
    if (!room) return;

    room.players = room.players.filter((p) => p.socketId !== client.id);
    this.store.unlinkSocket(client.id);
    client.leave(room.id);

    if (room.players.length === 0) {
      this.store.deleteRoom(room.id, room.roomCode);
      return;
    }

    if (!room.players.some((p) => p.isRoomOwner)) {
      room.players[0].isRoomOwner = true;
    }

    this.broadcast.broadcastRoomState(room);
    console.log(`[ITO] player ${client.id} left room ${room.roomCode}`);
  }

  dissolveRoom(client: Socket) {
    const room = this.store.getRoomBySocketId(client.id);
    if (!room) return;

    const player = room.players.find((p) => p.socketId === client.id);
    if (!player?.isRoomOwner) return;

    this.broadcast.emitToRoom(room.id, ITO_EVENTS.ROOM_DISSOLVED, {});

    for (const p of room.players) {
      this.store.unlinkSocket(p.socketId);
    }
    this.store.deleteRoom(room.id, room.roomCode);
    console.log(`[ITO] room ${room.roomCode} dissolved by ${player.name}`);
  }

  handleDisconnect(socketId: string) {
    const room = this.store.getRoomBySocketId(socketId);
    if (!room) return;

    room.players = room.players.filter((p) => p.socketId !== socketId);
    this.store.unlinkSocket(socketId);

    if (room.players.length === 0) {
      this.store.deleteRoom(room.id, room.roomCode);
      return;
    }

    if (!room.players.some((p) => p.isRoomOwner)) {
      room.players[0].isRoomOwner = true;
    }

    this.broadcast.broadcastRoomState(room);
  }
}

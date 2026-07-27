import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  ITO_EVENTS,
  PlayerPhaseChangePayload,
  ResyncStatePayload,
  RoomStatePayload,
} from '../ito.events';
import { ItoPlayer, ItoRoom } from '../types';

@Injectable()
export class BroadcastService {
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  broadcastRoomState(room: ItoRoom): void {
    this.server
      .to(room.id)
      .emit(ITO_EVENTS.ROOM_STATE, this.buildRoomStatePayload(room));
  }

  broadcastPhaseChange(room: ItoRoom): void {
    this.server.to(room.id).emit(ITO_EVENTS.PHASE_CHANGE, {
      roomPhase: room.roomPhase,
      roundHostId: room.roundHostId || undefined,
    });
  }

  emitToRoom(roomId: string, event: string, payload: unknown): void {
    this.server.to(roomId).emit(event, payload);
  }

  emitToSocket(socketId: string, event: string, payload: unknown): void {
    this.server.to(socketId).emit(event, payload);
  }

  emitResyncState(room: ItoRoom, player: ItoPlayer): void {
    const payload: ResyncStatePayload = {
      ...this.buildRoomStatePayload(room),
      theme: room.theme,
      totalRounds: room.totalRounds,
      currentRound: room.currentRound,
      turnOrder: [...room.turnOrder],
      messages: [...room.messages],
      myCardNumber: player.cardNumber,
    };
    this.server.to(player.socketId).emit(ITO_EVENTS.RESYNC_STATE, payload);
  }

  emitPlayerPhaseChange(
    roomId: string,
    playerId: string,
    phase: PlayerPhaseChangePayload['playerPhase'],
  ): void {
    this.server.to(roomId).emit(ITO_EVENTS.PLAYER_PHASE_CHANGE, {
      playerId,
      playerPhase: phase,
    });
  }

  private buildRoomStatePayload(room: ItoRoom): RoomStatePayload {
    const showImages = [
      'SPEAKING',
      'ORDERING',
      'REVEAL',
      'ROUND_RESULT',
      'GAME_OVER',
    ].includes(room.roomPhase);
    return {
      roomCode: room.roomCode,
      roomPhase: room.roomPhase,
      players: room.players.map((p) => ({
        id: p.playerId,
        name: p.name,
        isRoomOwner: p.isRoomOwner,
        playerPhase:
          room.roomPhase === 'INPUT_GENERATING' ? p.playerPhase : undefined,
        hasSubmittedPrompt: p.hasSubmittedPrompt,
        imageUrl: showImages ? p.imageUrl : undefined,
        connected: p.connected,
        excluded: p.excluded,
      })),
      roundHostId: room.roundHostId || undefined,
      currentTurnPlayerId:
        room.roomPhase === 'SPEAKING'
          ? room.turnOrder[room.currentTurnIndex]
          : undefined,
      boardOrder: room.boardOrder.length > 0 ? [...room.boardOrder] : undefined,
      paused: room.paused,
      pausedPlayerId: room.pausedPlayerId,
    };
  }
}

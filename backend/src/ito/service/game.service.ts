import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import {
  ITO_EVENTS,
  PlaceCardPayload,
  ReorderCardsPayload,
  SendChatPayload,
  StartGamePayload,
  SubmitPromptPayload,
  DealtCardPayload,
} from '../ito.events';
import { ItoRoom } from '../types';
import { RoomStore } from './room.store';
import { BroadcastService } from './broadcast.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GameService {
  constructor(
    private readonly store: RoomStore,
    private readonly broadcast: BroadcastService,
    private readonly prisma: PrismaService,
  ) {}

  startGame(client: Socket, payload: StartGamePayload) {
    const room = this.store.getRoomBySocketId(client.id);
    if (!room) return;

    if (room.paused) return;

    const owner = room.players.find((p) => p.socketId === client.id);
    if (!owner?.isRoomOwner || room.roomPhase !== 'THEME_SETTING') return;
    if (room.players.length < 2) {
      client.emit('ito:error', { message: '2人以上必要です' });
      return;
    }

    room.theme = payload.theme;
    room.totalRounds = room.totalRounds || payload.totalRounds || 3;
    room.currentRound = room.currentRound === 0 ? 1 : room.currentRound + 1;
    room.roomPhase = 'DEALING';

    const cards = this.dealCards(room.players.length);
    room.players.forEach((p, i) => {
      p.cardNumber = cards[i];
      p.playerPhase = 'INPUT';
      p.hasSubmittedPrompt = false;
      p.imageUrl = undefined;
      p.prompt = undefined;
    });

    room.players.forEach((p) => {
      const dealt: DealtCardPayload = {
        cardNumber: p.cardNumber!,
        theme: room.theme,
      };
      this.broadcast.emitToSocket(p.socketId, ITO_EVENTS.DEALT_CARD, dealt);
    });

    room.roomPhase = 'INPUT_GENERATING';
    this.broadcast.broadcastPhaseChange(room);
    this.broadcast.broadcastRoomState(room);
    console.log(
      `[ITO] game started in room ${room.roomCode}, theme: ${room.theme}`,
    );
  }

  submitPrompt(client: Socket, payload: SubmitPromptPayload) {
    const room = this.store.getRoomBySocketId(client.id);
    if (!room || room.roomPhase !== 'INPUT_GENERATING' || room.paused) return;

    const player = room.players.find((p) => p.socketId === client.id);
    if (!player || player.playerPhase !== 'INPUT') return;

    player.prompt = payload.prompt;
    player.hasSubmittedPrompt = true;
    player.playerPhase = 'GENERATING';

    this.broadcast.emitPlayerPhaseChange(room.id, player.playerId, 'GENERATING');

    const submittedCount = room.players.filter(
      (p) => p.hasSubmittedPrompt,
    ).length;
    this.broadcast.emitToRoom(room.id, ITO_EVENTS.PROMPT_SUBMITTED, {
      submittedCount,
      totalCount: room.players.length,
    });

    this.stubGenerateImage(room, player.playerId);
  }

  placeCard(client: Socket, payload: PlaceCardPayload) {
    const room = this.store.getRoomBySocketId(client.id);
    if (!room || room.roomPhase !== 'SPEAKING' || room.paused) return;

    const player = room.players.find((p) => p.socketId === client.id);
    if (!player) return;
    if (room.turnOrder[room.currentTurnIndex] !== player.playerId) return;

    const pos = Math.max(0, Math.min(payload.position, room.boardOrder.length));
    room.boardOrder.splice(pos, 0, player.playerId);
    room.currentTurnIndex++;

    this.broadcast.emitToRoom(room.id, ITO_EVENTS.CARD_PLACED, {
      playerId: player.playerId,
      boardOrder: [...room.boardOrder],
    });

    if (room.currentTurnIndex >= room.turnOrder.length) {
      room.roomPhase = 'ORDERING';
      this.broadcast.broadcastPhaseChange(room);
      this.broadcast.broadcastRoomState(room);
    } else {
      this.broadcast.emitToRoom(room.id, ITO_EVENTS.TURN_CHANGED, {
        currentTurnPlayerId: room.turnOrder[room.currentTurnIndex],
      });
    }
  }

  reorderCards(client: Socket, payload: ReorderCardsPayload) {
    const room = this.store.getRoomBySocketId(client.id);
    if (!room || room.roomPhase !== 'ORDERING' || room.paused) return;

    const player = room.players.find((p) => p.socketId === client.id);
    if (!player || room.roundHostId !== player.playerId) return;

    room.boardOrder = payload.orderedPlayerIds;

    this.broadcast.emitToRoom(room.id, ITO_EVENTS.ORDER_CHANGED, {
      orderedPlayerIds: [...room.boardOrder],
    });
  }

  confirmOrder(client: Socket) {
    const room = this.store.getRoomBySocketId(client.id);
    if (!room || room.roomPhase !== 'ORDERING' || room.paused) return;

    const player = room.players.find((p) => p.socketId === client.id);
    if (!player || room.roundHostId !== player.playerId) return;

    const correctOrder = [...room.players]
      .sort((a, b) => a.cardNumber! - b.cardNumber!)
      .map((p) => p.playerId);

    const success = room.boardOrder.every((id, i) => id === correctOrder[i]);

    room.roomPhase = 'REVEAL';
    this.broadcast.emitToRoom(room.id, ITO_EVENTS.CARDS_REVEALED, {
      revealedCards: room.players.map((p) => ({
        playerId: p.playerId,
        cardNumber: p.cardNumber!,
      })),
      submittedOrder: [...room.boardOrder],
      correctOrder,
      success,
    });

    room.roomPhase = 'ROUND_RESULT';
    this.broadcast.broadcastPhaseChange(room);
    this.broadcast.broadcastRoomState(room);
    console.log(
      `[ITO] round ${room.currentRound} result: ${success ? 'SUCCESS' : 'FAIL'}`,
    );

    this.recordRoundResults(room, success).catch((err) => {
      console.error('[ITO] failed to record round result', err);
    });
  }

  sendChat(client: Socket, payload: SendChatPayload) {
    const room = this.store.getRoomBySocketId(client.id);
    if (!room || room.roomPhase !== 'ORDERING' || room.paused) return;

    const player = room.players.find((p) => p.socketId === client.id);
    if (!player) return;

    const chatMessage = {
      playerId: player.playerId,
      playerName: player.name,
      message: payload.message,
      timestamp: Date.now(),
    };
    room.messages.push(chatMessage);

    this.broadcast.emitToRoom(room.id, ITO_EVENTS.CHAT_MESSAGE, chatMessage);
  }

  /**
   * 除外（ito:excludePlayer）でプレイヤーが減った直後に呼ぶ。
   * INPUT_GENERATING/SPEAKINGは人数カウントに達した時点でのみ次フェーズへ進む作りのため、
   * 除外で分母が減っても自動では進まない。ここで残りプレイヤーだけで条件を満たしているか再判定する。
   */
  checkProgressAfterExclusion(room: ItoRoom): void {
    if (room.roomPhase === 'INPUT_GENERATING') {
      const activePlayers = room.players.filter((p) => !p.excluded);
      const allDone =
        activePlayers.length > 0 &&
        activePlayers.every((p) => p.playerPhase === 'DONE');
      if (allDone) {
        this.transitionToSpeaking(room);
      }
      return;
    }

    if (room.roomPhase === 'SPEAKING') {
      if (room.turnOrder.length > 0 && room.boardOrder.length >= room.turnOrder.length) {
        room.roomPhase = 'ORDERING';
        this.broadcast.broadcastPhaseChange(room);
        this.broadcast.broadcastRoomState(room);
      }
    }
  }

  // ===== private =====

  private async recordRoundResults(room: ItoRoom, success: boolean) {
    const activePlayers = room.players.filter((p) => !p.excluded);

    await Promise.all(
      activePlayers.map((p) => {
        const userId = Number(p.playerId);
        if (!Number.isInteger(userId)) return Promise.resolve();

        return this.prisma.itoGameRecord.upsert({
          where: { userId },
          create: { userId, totalGames: 1, successCount: success ? 1 : 0 },
          update: {
            totalGames: { increment: 1 },
            ...(success ? { successCount: { increment: 1 } } : {}),
          },
        });
      }),
    );
  }

  private stubGenerateImage(room: ItoRoom, playerId: string) {
    const delay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      if (!this.store.hasRoom(room.id)) return;
      const player = room.players.find((p) => p.playerId === playerId);
      if (!player || player.playerPhase !== 'GENERATING') return;

      player.imageUrl = `https://placehold.co/300x300/1a1a2e/00d4ff?text=${encodeURIComponent(player.name)}`;
      player.playerPhase = 'DONE';

      const generatedCount = room.players.filter(
        (p) => p.playerPhase === 'DONE',
      ).length;

      this.broadcast.emitPlayerPhaseChange(room.id, playerId, 'DONE');

      this.broadcast.emitToRoom(room.id, ITO_EVENTS.IMAGE_GENERATED, {
        playerId,
        imageUrl: player.imageUrl,
        generatedCount,
        totalCount: room.players.length,
      });

      if (generatedCount === room.players.length) {
        this.transitionToSpeaking(room);
      }
    }, delay);
  }

  private transitionToSpeaking(room: ItoRoom) {
    room.roomPhase = 'SPEAKING';
    room.turnOrder = this.buildTurnOrder(room);
    room.roundHostId = room.turnOrder[0];
    room.currentTurnIndex = 0;
    room.boardOrder = [];

    this.broadcast.emitToRoom(room.id, ITO_EVENTS.PHASE_CHANGE, {
      roomPhase: 'SPEAKING',
      turnOrder: [...room.turnOrder],
      roundHostId: room.roundHostId,
    });

    this.broadcast.emitToRoom(room.id, ITO_EVENTS.TURN_CHANGED, {
      currentTurnPlayerId: room.turnOrder[0],
    });

    this.broadcast.broadcastRoomState(room);
  }

  nextRound(client: Socket) {
    const room = this.store.getRoomBySocketId(client.id);
    if (!room || room.roomPhase !== 'ROUND_RESULT' || room.paused) return;

    const requester = room.players.find((p) => p.socketId === client.id);
    if (!requester?.isRoomOwner) return;

    // Reset game state for the new round but keep players, totalRounds and currentRound
    room.roomPhase = 'THEME_SETTING';
    room.theme = '';
    room.boardOrder = [];
    room.turnOrder = [];
    room.currentTurnIndex = 0;
    room.roundHostId = '';

    // Reset players for the new round
    room.players.forEach((p) => {
      p.cardNumber = undefined;
      p.playerPhase = 'INPUT';
      p.hasSubmittedPrompt = false;
      p.imageUrl = undefined;
      p.prompt = undefined;
    });

    this.broadcast.broadcastPhaseChange(room);
    this.broadcast.broadcastRoomState(room);
  }

  endGame(client: Socket) {
    const room = this.store.getRoomBySocketId(client.id);
    if (!room || room.roomPhase !== 'ROUND_RESULT' || room.paused) return;

    const requester = room.players.find((p) => p.socketId === client.id);
    if (!requester?.isRoomOwner) return;

    room.roomPhase = 'GAME_OVER';
    this.broadcast.broadcastPhaseChange(room);
    this.broadcast.broadcastRoomState(room);
  }

  private dealCards(count: number): number[] {
    const pool = Array.from({ length: 100 }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  }

  private buildTurnOrder(room: ItoRoom): string[] {
    const ids = room.players.filter((p) => !p.excluded).map((p) => p.playerId);
    if (room.currentRound === 1) {
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      return ids;
    }
    return [...room.turnOrder.slice(1), room.turnOrder[0]];
  }
}

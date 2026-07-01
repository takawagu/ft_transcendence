import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  ITO_EVENTS,
  RoomPhase,
  PlayerPhase,
  RoomStatePayload,
  PhaseChangePayload,
  PlayerPhaseChangePayload,
  DealtCardPayload,
  PromptSubmittedPayload,
  ImageGeneratedPayload,
  CardPlacedPayload,
  TurnChangedPayload,
  OrderChangedPayload,
  ChatMessagePayload,
  CardsRevealedPayload,
  JoinRoomPayload,
  StartGamePayload,
  SubmitPromptPayload,
  PlaceCardPayload,
  ReorderCardsPayload,
  SendChatPayload,
} from './ito.events';

interface ItoPlayer {
  socketId: string;
  name: string;
  isRoomOwner: boolean;
  cardNumber?: number;
  prompt?: string;           // 他プレイヤーには送らない
  imageUrl?: string;         // SPEAKING以降で公開
  playerPhase: PlayerPhase;
  hasSubmittedPrompt: boolean;
}

interface ItoRoom {
  id: string;
  roomCode: string;
  roomPhase: RoomPhase;
  players: ItoPlayer[];
  theme: string;
  totalRounds: number;
  currentRound: number;
  turnOrder: string[];       // socketId順（SPEAKINGのターン順）
  currentTurnIndex: number;
  roundHostId: string;       // ORDERINGの操作権限者
  boardOrder: string[];      // 場に置かれた順（socketId）
}

const SPEAKING_PHASES: RoomPhase[] = ['SPEAKING', 'ORDERING', 'REVEAL', 'ROUND_RESULT', 'GAME_OVER'];

@Injectable()
export class ItoService {
  private server: Server;
  private rooms = new Map<string, ItoRoom>();
  private socketToRoomId = new Map<string, string>();
  private roomCodeToId = new Map<string, string>();

  setServer(server: Server) {
    this.server = server;
  }

  createRoom(client: Socket, playerName: string) {
    const roomCode = this.generateRoomCode();
    const roomId = `ito_${Date.now()}`;

    const room: ItoRoom = {
      id: roomId,
      roomCode,
      roomPhase: 'WAITING',
      players: [{
        socketId: client.id,
        name: playerName,
        isRoomOwner: true,
        playerPhase: 'INPUT',
        hasSubmittedPrompt: false,
      }],
      theme: '',
      totalRounds: 1,
      currentRound: 0,
      turnOrder: [],
      currentTurnIndex: 0,
      roundHostId: '',
      boardOrder: [],
    };

    this.rooms.set(roomId, room);
    this.socketToRoomId.set(client.id, roomId);
    this.roomCodeToId.set(roomCode, roomId);
    client.join(roomId);

    this.broadcastRoomState(room);
    console.log(`[ITO] room created: ${roomCode} by ${playerName}`);
  }

  joinRoom(client: Socket, payload: JoinRoomPayload) {
    const roomId = this.roomCodeToId.get(payload.roomCode);
    if (!roomId) {
      client.emit('ito:error', { message: 'ルームが見つかりません' });
      return;
    }

    const room = this.rooms.get(roomId)!;
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
    this.socketToRoomId.set(client.id, roomId);
    client.join(roomId);

    this.broadcastRoomState(room);
    console.log(`[ITO] ${payload.playerName} joined room ${payload.roomCode}`);
  }

  startGame(client: Socket, payload: StartGamePayload) {
    const room = this.getRoom(client.id);
    if (!room) return;

    const owner = room.players.find(p => p.socketId === client.id);
    if (!owner?.isRoomOwner || room.roomPhase !== 'WAITING') return;
    if (room.players.length < 2) {
      client.emit('ito:error', { message: '2人以上必要です' });
      return;
    }

    room.theme = payload.theme;
    room.totalRounds = payload.totalRounds ?? 1;
    room.currentRound = 1;
    room.roomPhase = 'DEALING';

    // 重複なしでカードを配布
    const cards = this.dealCards(room.players.length);
    room.players.forEach((p, i) => {
      p.cardNumber = cards[i];
      p.playerPhase = 'INPUT';
      p.hasSubmittedPrompt = false;
      p.imageUrl = undefined;
      p.prompt = undefined;
    });

    // 各プレイヤーに自分のカード番号だけ送信（他には非公開）
    room.players.forEach(p => {
      const dealt: DealtCardPayload = { cardNumber: p.cardNumber!, theme: room.theme };
      this.server.to(p.socketId).emit(ITO_EVENTS.DEALT_CARD, dealt);
    });

    room.roomPhase = 'INPUT_GENERATING';
    this.broadcastPhaseChange(room);
    this.broadcastRoomState(room);
    console.log(`[ITO] game started in room ${room.roomCode}, theme: ${room.theme}`);
  }

  submitPrompt(client: Socket, payload: SubmitPromptPayload) {
    const room = this.getRoom(client.id);
    if (!room || room.roomPhase !== 'INPUT_GENERATING') return;

    const player = room.players.find(p => p.socketId === client.id);
    if (!player || player.playerPhase !== 'INPUT') return;

    player.prompt = payload.prompt;
    player.hasSubmittedPrompt = true;
    player.playerPhase = 'GENERATING';

    this.server.to(room.id).emit(ITO_EVENTS.PLAYER_PHASE_CHANGE, {
      playerId: client.id,
      playerPhase: 'GENERATING',
    } as PlayerPhaseChangePayload);

    const submittedCount = room.players.filter(p => p.hasSubmittedPrompt).length;
    this.server.to(room.id).emit(ITO_EVENTS.PROMPT_SUBMITTED, {
      submittedCount,
      totalCount: room.players.length,
    } as PromptSubmittedPayload);

    // TODO: 実際のAI画像生成APIに差し替え
    this.stubGenerateImage(room, client.id);
  }

  placeCard(client: Socket, payload: PlaceCardPayload) {
    const room = this.getRoom(client.id);
    if (!room || room.roomPhase !== 'SPEAKING') return;

    if (room.turnOrder[room.currentTurnIndex] !== client.id) return;

    const pos = Math.max(0, Math.min(payload.position, room.boardOrder.length));
    room.boardOrder.splice(pos, 0, client.id);
    room.currentTurnIndex++;

    this.server.to(room.id).emit(ITO_EVENTS.CARD_PLACED, {
      playerId: client.id,
      boardOrder: [...room.boardOrder],
    } as CardPlacedPayload);

    if (room.currentTurnIndex >= room.turnOrder.length) {
      // 全員配置完了 → ORDERING
      room.roomPhase = 'ORDERING';
      this.broadcastPhaseChange(room);
      this.broadcastRoomState(room);
    } else {
      this.server.to(room.id).emit(ITO_EVENTS.TURN_CHANGED, {
        currentTurnPlayerId: room.turnOrder[room.currentTurnIndex],
      } as TurnChangedPayload);
    }
  }

  reorderCards(client: Socket, payload: ReorderCardsPayload) {
    const room = this.getRoom(client.id);
    if (!room || room.roomPhase !== 'ORDERING') return;
    if (room.roundHostId !== client.id) return;

    room.boardOrder = payload.orderedPlayerIds;

    this.server.to(room.id).emit(ITO_EVENTS.ORDER_CHANGED, {
      orderedPlayerIds: [...room.boardOrder],
    } as OrderChangedPayload);
  }

  confirmOrder(client: Socket) {
    const room = this.getRoom(client.id);
    if (!room || room.roomPhase !== 'ORDERING') return;
    if (room.roundHostId !== client.id) return;

    // 正解順（カード番号の昇順）を計算
    const correctOrder = [...room.players]
      .sort((a, b) => a.cardNumber! - b.cardNumber!)
      .map(p => p.socketId);

    const success = room.boardOrder.every((id, i) => id === correctOrder[i]);

    room.roomPhase = 'REVEAL';
    this.server.to(room.id).emit(ITO_EVENTS.CARDS_REVEALED, {
      revealedCards: room.players.map(p => ({
        playerId: p.socketId,
        cardNumber: p.cardNumber!,
      })),
      submittedOrder: [...room.boardOrder],
      correctOrder,
      success,
    } as CardsRevealedPayload);

    room.roomPhase = 'ROUND_RESULT';
    this.broadcastPhaseChange(room);
    this.broadcastRoomState(room);
    console.log(`[ITO] round ${room.currentRound} result: ${success ? 'SUCCESS' : 'FAIL'}`);

    // 全ラウンド終了チェック
    if (room.currentRound >= room.totalRounds) {
      setTimeout(() => {
        if (!this.rooms.has(room.id)) return;
        room.roomPhase = 'GAME_OVER';
        this.broadcastPhaseChange(room);
        this.broadcastRoomState(room);
      }, 3000);
    }
  }

  sendChat(client: Socket, payload: SendChatPayload) {
    const room = this.getRoom(client.id);
    if (!room || room.roomPhase !== 'ORDERING') return;

    const player = room.players.find(p => p.socketId === client.id);
    if (!player) return;

    this.server.to(room.id).emit(ITO_EVENTS.CHAT_MESSAGE, {
      playerId: client.id,
      playerName: player.name,
      message: payload.message,
      timestamp: Date.now(),
    } as ChatMessagePayload);
  }

  leaveRoom(client: Socket) {
    const room = this.getRoom(client.id);
    if (!room) return;

    room.players = room.players.filter(p => p.socketId !== client.id);
    this.socketToRoomId.delete(client.id);
    client.leave(room.id);

    if (room.players.length === 0) {
      this.roomCodeToId.delete(room.roomCode);
      this.rooms.delete(room.id);
      return;
    }

    if (!room.players.some(p => p.isRoomOwner)) {
      room.players[0].isRoomOwner = true;
    }

    this.broadcastRoomState(room);
    console.log(`[ITO] player ${client.id} left room ${room.roomCode}`);
  }

  dissolveRoom(client: Socket) {
    const room = this.getRoom(client.id);
    if (!room) return;

    const player = room.players.find(p => p.socketId === client.id);
    if (!player?.isRoomOwner) return;

    this.server.to(room.id).emit(ITO_EVENTS.ROOM_DISSOLVED, {});

    for (const p of room.players) {
      this.socketToRoomId.delete(p.socketId);
    }
    this.roomCodeToId.delete(room.roomCode);
    this.rooms.delete(room.id);
    console.log(`[ITO] room ${room.roomCode} dissolved by ${player.name}`);
  }

  handleDisconnect(socketId: string) {
    const room = this.getRoom(socketId);
    if (!room) return;

    room.players = room.players.filter(p => p.socketId !== socketId);
    this.socketToRoomId.delete(socketId);

    if (room.players.length === 0) {
      this.roomCodeToId.delete(room.roomCode);
      this.rooms.delete(room.id);
      return;
    }

    // オーナーが抜けた場合、次のプレイヤーに移譲
    if (!room.players.some(p => p.isRoomOwner)) {
      room.players[0].isRoomOwner = true;
    }

    this.broadcastRoomState(room);
  }

  // ===== private =====

  private stubGenerateImage(room: ItoRoom, socketId: string) {
    const delay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      if (!this.rooms.has(room.id)) return;
      const player = room.players.find(p => p.socketId === socketId);
      if (!player || player.playerPhase !== 'GENERATING') return;

      // TODO: 実際のAI生成URLに差し替え
      player.imageUrl = `https://placehold.co/300x300/1a1a2e/00d4ff?text=${encodeURIComponent(player.name)}`;
      player.playerPhase = 'DONE';

      const generatedCount = room.players.filter(p => p.playerPhase === 'DONE').length;

      this.server.to(room.id).emit(ITO_EVENTS.PLAYER_PHASE_CHANGE, {
        playerId: socketId,
        playerPhase: 'DONE',
      } as PlayerPhaseChangePayload);

      this.server.to(room.id).emit(ITO_EVENTS.IMAGE_GENERATED, {
        playerId: socketId,
        imageUrl: player.imageUrl,
        generatedCount,
        totalCount: room.players.length,
      } as ImageGeneratedPayload);

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

    this.server.to(room.id).emit(ITO_EVENTS.PHASE_CHANGE, {
      roomPhase: 'SPEAKING',
      turnOrder: [...room.turnOrder],
      roundHostId: room.roundHostId,
    } as PhaseChangePayload);

    this.server.to(room.id).emit(ITO_EVENTS.TURN_CHANGED, {
      currentTurnPlayerId: room.turnOrder[0],
    } as TurnChangedPayload);

    this.broadcastRoomState(room);
  }

  private broadcastPhaseChange(room: ItoRoom) {
    this.server.to(room.id).emit(ITO_EVENTS.PHASE_CHANGE, {
      roomPhase: room.roomPhase,
      roundHostId: room.roundHostId || undefined,
    } as PhaseChangePayload);
  }

  private broadcastRoomState(room: ItoRoom) {
    this.server.to(room.id).emit(ITO_EVENTS.ROOM_STATE, this.buildRoomStatePayload(room));
  }

  private buildRoomStatePayload(room: ItoRoom): RoomStatePayload {
    const showImages = SPEAKING_PHASES.includes(room.roomPhase);
    return {
      roomCode: room.roomCode,
      roomPhase: room.roomPhase,
      players: room.players.map(p => ({
        id: p.socketId,
        name: p.name,
        isRoomOwner: p.isRoomOwner,
        playerPhase: room.roomPhase === 'INPUT_GENERATING' ? p.playerPhase : undefined,
        hasSubmittedPrompt: p.hasSubmittedPrompt,
        imageUrl: showImages ? p.imageUrl : undefined,
      })),
      roundHostId: room.roundHostId || undefined,
      currentTurnPlayerId: room.roomPhase === 'SPEAKING'
        ? room.turnOrder[room.currentTurnIndex]
        : undefined,
      boardOrder: room.boardOrder.length > 0 ? [...room.boardOrder] : undefined,
    };
  }

  private getRoom(socketId: string): ItoRoom | undefined {
    const roomId = this.socketToRoomId.get(socketId);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  private generateRoomCode(): string {
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

  private dealCards(count: number): number[] {
    const pool = Array.from({ length: 100 }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  }

  private buildTurnOrder(room: ItoRoom): string[] {
    const ids = room.players.map(p => p.socketId);
    if (room.currentRound === 1) {
      // 第1ラウンドはランダム
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      return ids;
    }
    // 以降は前回ターン順を1つ回転
    return [...room.turnOrder.slice(1), room.turnOrder[0]];
  }
}

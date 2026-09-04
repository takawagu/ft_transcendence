import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import {
  CHAT_MESSAGE_MAX_LENGTH,
  ITO_EVENTS,
  PlaceCardPayload,
  ReorderCardsPayload,
  SendChatPayload,
  StartGamePayload,
  SubmitPromptPayload,
  DealtCardPayload,
} from '../ito.events';
import { ItoPlayer, ItoRoom } from '../types';
import { RoomStore } from './room.store';
import { BroadcastService } from './broadcast.service';
import { activePlayers, purgeExcluded } from './player-utils';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GameService {
  constructor(
    private readonly store: RoomStore,
    private readonly broadcast: BroadcastService,
    private readonly prisma: PrismaService,
  ) {}

  startGame(client: Socket, payload: StartGamePayload) {
    const resolved = this.store.resolve(client.id);
    if (!resolved) return;
    const { room, player: owner } = resolved;

    if (room.paused) return;
    if (!owner.isRoomOwner || room.roomPhase !== 'THEME_SETTING') return;

    // THEME_SETTING中に除外が起きた場合はnextRoundを通らないため、ここでも掃除する（冪等）
    purgeExcluded(room);

    const active = activePlayers(room);
    if (active.length < 2) {
      client.emit('ito:error', { message: '2人以上必要です' });
      return;
    }

    // Validate theme length (max 100 characters)
    if (
      !payload.theme ||
      typeof payload.theme !== 'string' ||
      payload.theme.trim().length === 0 ||
      payload.theme.trim().length > 100
    ) {
      client.emit('ito:error', {
        message: 'お題は1文字以上100文字以内で入力してください。',
      });
      return;
    }

    room.theme = payload.theme.trim();
    room.totalRounds = room.totalRounds || payload.totalRounds || 3;
    room.currentRound = room.currentRound === 0 ? 1 : room.currentRound + 1;
    room.roomPhase = 'DEALING';

    const cards = this.dealCards(active.length);
    active.forEach((p, i) => {
      p.cardNumber = cards[i];
      p.playerPhase = 'INPUT';
      p.hasSubmittedPrompt = false;
      p.imageUrl = undefined;
      p.prompt = undefined;
    });

    active.forEach((p) => {
      if (!p.socketId) return;
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
    const resolved = this.store.resolve(client.id);
    if (!resolved) return;
    const { room, player } = resolved;
    if (room.roomPhase !== 'INPUT_GENERATING' || room.paused) return;
    if (player.playerPhase !== 'INPUT') return;

    // Validate prompt length (max 100 characters)
    if (!payload.prompt || typeof payload.prompt !== 'string' || payload.prompt.trim().length === 0 || payload.prompt.trim().length > 100) {
      client.emit('ito:error', { message: 'お題の回答は1文字以上100文字以内で入力してください。' });
      return;
    }

    player.prompt = payload.prompt.trim();
    player.hasSubmittedPrompt = true;
    player.playerPhase = 'DONE';

    this.broadcast.emitPlayerPhaseChange(room.id, player.playerId, 'DONE');

    // 分子・分母の両方を除外者抜きで数える。片方だけにすると完了条件が永久に成立しなくなる。
    const active = activePlayers(room);
    this.broadcast.emitToRoom(room.id, ITO_EVENTS.PROMPT_SUBMITTED, {
      submittedCount: active.filter((p) => p.hasSubmittedPrompt).length,
      totalCount: active.length,
    });

    this.advancePhaseIfComplete(room);
  }

  placeCard(client: Socket, payload: PlaceCardPayload) {
    const resolved = this.store.resolve(client.id);
    if (!resolved) return;
    const { room, player } = resolved;
    if (room.roomPhase !== 'SPEAKING' || room.paused) return;
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
    const resolved = this.store.resolve(client.id);
    if (!resolved) return;
    const { room, player } = resolved;
    if (room.roomPhase !== 'ORDERING' || room.paused) return;
    if (room.roundHostId !== player.playerId) return;

    room.boardOrder = payload.orderedPlayerIds;

    this.broadcast.emitToRoom(room.id, ITO_EVENTS.ORDER_CHANGED, {
      orderedPlayerIds: [...room.boardOrder],
    });
  }

  confirmOrder(client: Socket) {
    const resolved = this.store.resolve(client.id);
    if (!resolved) return;
    const { room, player } = resolved;
    if (room.roomPhase !== 'ORDERING' || room.paused) return;
    if (room.roundHostId !== player.playerId) return;

    // 正解順は「場に出ているカード」だけから作る。room.players全体から作ると、
    // 場に出していないプレイヤー（除外者など）が混入してboardOrderと長さがズレ、
    // every()が短い方で打ち切られて誤った成功判定が出る。
    const placed = room.boardOrder
      .map((id) => room.players.find((p) => p.playerId === id))
      .filter((p): p is ItoPlayer => !!p);

    const correctOrder = [...placed]
      .sort((a, b) => a.cardNumber! - b.cardNumber!)
      .map((p) => p.playerId);

    const success =
      room.boardOrder.length === correctOrder.length &&
      room.boardOrder.every((id, i) => id === correctOrder[i]);

    room.roomPhase = 'REVEAL';
    // CARDS_REVEALEDはこの一度しか飛ばないので、結果を部屋にも残しておく。
    // ROUND_RESULT中に復帰した人へはRESYNC_STATE経由でこれを渡す。
    room.lastReveal = {
      revealedCards: placed.map((p) => ({
        playerId: p.playerId,
        cardNumber: p.cardNumber!,
      })),
      submittedOrder: [...room.boardOrder],
      correctOrder,
      success,
    };
    this.broadcast.emitToRoom(
      room.id,
      ITO_EVENTS.CARDS_REVEALED,
      room.lastReveal,
    );

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
    const resolved = this.store.resolve(client.id);
    if (!resolved) return;
    const { room, player } = resolved;
    if (room.roomPhase !== 'ORDERING' || room.paused) return;

    /*
     * /ito名前空間にはグローバルのValidationPipeが効かず、payloadは申告されたまま届く。
     * クライアント側のmaxLengthはDevToolsでも生のsocket.io接続でも迂回できるので、
     * 型と長さの検証はここで必ず行う。ここを通った文字列がそのまま全員へ配信され、
     * room.messagesにも積まれる（部屋が消えるまでメモリに残る）。
     */
    if (typeof payload?.message !== 'string') return;

    // 保存も配信もtrim済みの本文で行う。空白だけの送信は無視する（DMのSendMessageDtoと同じ扱い）
    const message = payload.message.trim();
    if (!message) return;

    if (message.length > CHAT_MESSAGE_MAX_LENGTH) {
      client.emit('ito:error', {
        message: `メッセージは${CHAT_MESSAGE_MAX_LENGTH}文字以内で入力してください`,
      });
      return;
    }

    const chatMessage = {
      playerId: player.playerId,
      playerName: player.name,
      message,
      timestamp: Date.now(),
    };
    room.messages.push(chatMessage);

    this.broadcast.emitToRoom(room.id, ITO_EVENTS.CHAT_MESSAGE, chatMessage);
  }

  /**
   * 現フェーズの完了条件を満たしていれば次フェーズへ進める。
   * 完了判定は本来「人数カウントに達した瞬間」にしか走らないため、
   * 除外で分母が減ったときやポーズ解除で保留分を消化するときに呼び直す必要がある。
   * ポーズ中は何もしないので、どこから呼んでも安全。
   */
  advancePhaseIfComplete(room: ItoRoom): void {
    if (room.paused) return;

    if (room.roomPhase === 'INPUT_GENERATING') {
      const active = activePlayers(room);
      const allDone =
        active.length > 0 && active.every((p) => p.playerPhase === 'DONE');
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
    const active = activePlayers(room);

    await Promise.all(
      active.map((p) => {
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
    const resolved = this.store.resolve(client.id);
    if (!resolved) return;
    const { room, player: requester } = resolved;
    if (room.roomPhase !== 'ROUND_RESULT' || room.paused) return;
    if (!requester.isRoomOwner) return;

    // 結果表示はもう終わっているので、除外済みプレイヤーをここで席ごと片付ける。
    // 残したままだとカード配布と進捗の分母に混入し、次ラウンドが永久に完了しなくなる。
    purgeExcluded(room);

    // Reset game state for the new round but keep players, totalRounds and currentRound
    room.roomPhase = 'THEME_SETTING';
    room.theme = '';
    room.boardOrder = [];
    room.currentTurnIndex = 0;
    room.roundHostId = '';
    // 前ラウンドの結果はここで捨てる。purgeExcludedの直後なので、
    // 残すと既にroom.playersから消えたプレイヤーを指したまま復帰者へ送られてしまう。
    room.lastReveal = undefined;
    // turnOrderは意図的に残す。buildTurnOrderが次ラウンドの手番順を
    // 「前ラウンドの順を1つ回転させたもの」として組み立てる回転元になるため、
    // ここで空にすると次ラウンドの手番順が空になりゲームが進行不能になる。

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
    const resolved = this.store.resolve(client.id);
    if (!resolved) return;
    const { room, player: requester } = resolved;
    if (room.roomPhase !== 'ROUND_RESULT' || room.paused) return;
    if (!requester.isRoomOwner) return;

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
    const activeIds = activePlayers(room).map((p) => p.playerId);

    // 前ラウンドの手番順が無ければ（初回ラウンド）ランダムに決める。
    if (room.turnOrder.length === 0) return this.shuffle(activeIds);

    // 前ラウンド中に「配置済み」を理由に除外されたプレイヤーはturnOrderに残ったままなので、
    // ローテーションした上で現在アクティブなプレイヤーだけに絞り込む。
    const rotated = [...room.turnOrder.slice(1), room.turnOrder[0]];
    const next = rotated.filter((id) => activeIds.includes(id));
    // turnOrderに載っていないアクティブプレイヤーが居れば末尾に補い、必ず全員を含める。
    const missing = activeIds.filter((id) => !next.includes(id));
    return [...next, ...missing];
  }

  private shuffle(ids: string[]): string[] {
    const shuffled = [...ids];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

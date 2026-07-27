import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ITO_EVENTS, JoinRoomPayload, RejoinPayload } from '../ito.events';
import { ItoRoom } from '../types';
import { RoomStore } from './room.store';
import { BroadcastService } from './broadcast.service';
import { GameService } from './game.service';

@Injectable()
export class RoomService {
  constructor(
    private readonly store: RoomStore,
    private readonly broadcast: BroadcastService,
    private readonly gameService: GameService,
  ) {}

  createRoom(client: Socket, playerName: string, playerId: string) {
    const roomCode = this.store.generateRoomCode();
    const roomId = `ito_${Date.now()}`;

    const room: ItoRoom = {
      id: roomId,
      roomCode,
      roomPhase: 'WAITING',
      players: [
        {
          socketId: client.id,
          playerId,
          name: playerName,
          isRoomOwner: true,
          connected: true,
          excluded: false,
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
      paused: false,
      messages: [],
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
    if (room.players.some((p) => p.playerId === payload.playerId)) {
      client.emit('ito:error', {
        message: 'このブラウザから既に参加しています（別タブは使用できません）',
      });
      return;
    }

    room.players.push({
      socketId: client.id,
      playerId: payload.playerId,
      name: payload.playerName,
      isRoomOwner: false,
      connected: true,
      excluded: false,
      playerPhase: 'INPUT',
      hasSubmittedPrompt: false,
    });
    this.store.linkSocket(client.id, room.id);
    client.join(room.id);

    this.broadcast.broadcastRoomState(room);
    console.log(`[ITO] ${payload.playerName} joined room ${payload.roomCode}`);
  }

  confirmMembers(client: Socket) {
    const room = this.store.getRoomBySocketId(client.id);
    if (!room) return;

    const owner = room.players.find((p) => p.socketId === client.id);
    if (!owner?.isRoomOwner || room.roomPhase !== 'WAITING') return;
    if (room.players.length < 2) {
      client.emit('ito:error', { message: '2人以上必要です' });
      return;
    }

    room.roomPhase = 'THEME_SETTING';
    this.broadcast.broadcastPhaseChange(room);
    this.broadcast.broadcastRoomState(room);
    console.log(`[ITO] members confirmed in room ${room.roomCode}`);
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
    this.store.unlinkSocket(socketId);

    const player = room.players.find((p) => p.socketId === socketId);
    if (!player) return;

    if (room.roomPhase === 'WAITING') {
      room.players = room.players.filter((p) => p.socketId !== socketId);

      if (room.players.length === 0) {
        this.store.deleteRoom(room.id, room.roomCode);
        return;
      }
      if (!room.players.some((p) => p.isRoomOwner)) {
        room.players[0].isRoomOwner = true;
      }
      this.broadcast.broadcastRoomState(room);
      return;
    }

    player.connected = false;

    if (!room.players.some((p) => p.connected)) {
      this.store.deleteRoom(room.id, room.roomCode);
      return;
    }

    if (player.isRoomOwner) {
      player.isRoomOwner = false;
      const newHost =
        room.players.find((p) => p !== player && p.connected) ??
        room.players.find((p) => p !== player);
      if (newHost) newHost.isRoomOwner = true;
    }

    room.paused = true;
    room.pausedPlayerId = player.playerId;

    this.broadcast.emitToRoom(room.id, ITO_EVENTS.GAME_PAUSED, {
      disconnectedPlayerId: player.playerId,
      disconnectedPlayerName: player.name,
    });
    this.broadcast.broadcastRoomState(room);
    console.log(`[ITO] ${player.name} disconnected, room ${room.roomCode} paused`);
  }

  rejoin(client: Socket, payload: RejoinPayload) {
    const room = this.store.getRoomByCode(payload.roomCode);
    if (!room) {
      client.emit('ito:error', { message: 'ルームが見つかりません' });
      return;
    }

    const player = room.players.find((p) => p.playerId === payload.playerId);
    if (!player) {
      client.emit('ito:error', { message: '再参加できませんでした' });
      return;
    }

    player.socketId = client.id;
    player.connected = true;
    this.store.linkSocket(client.id, room.id);
    client.join(room.id);

    this.broadcast.emitResyncState(room, player);
    this.broadcast.emitToRoom(room.id, ITO_EVENTS.PLAYER_RECONNECTED, {
      playerId: player.playerId,
      playerName: player.name,
    });
    this.broadcast.broadcastRoomState(room);
    console.log(`[ITO] ${player.name} rejoined room ${room.roomCode}`);
  }

  excludePlayer(client: Socket) {
    const room = this.store.getRoomBySocketId(client.id);
    if (!room || !room.paused || !room.pausedPlayerId) return;

    const requester = room.players.find((p) => p.socketId === client.id);
    if (!requester?.isRoomOwner) return;

    const targetId = room.pausedPlayerId;
    const target = room.players.find((p) => p.playerId === targetId);
    if (!target) {
      room.paused = false;
      room.pausedPlayerId = undefined;
      this.broadcast.emitToRoom(room.id, ITO_EVENTS.GAME_RESUMED, {});
      this.broadcast.broadcastRoomState(room);
      return;
    }

    // カードが既に場に公開済みかどうかで除外範囲を分岐する（reconnect-design.md §4）
    const cardAlreadyVisible = room.boardOrder.includes(targetId);

    if (cardAlreadyVisible) {
      // 配置済み: カードは場に残し、プレイヤーとしてのみ除外する。
      // room.playersから削除すると正解判定(correctOrder)・結果画面のカード情報が失われるため、
      // 削除せずexcludedフラグを立てるだけにする。turnOrder/boardOrderも変更しない
      // （turnOrderから削除すると、まだ配置していない人がいるのに完了判定の分母が狂うため）。
      target.excluded = true;
    } else {
      // 配置前: 誰にも見えていないため、プレイヤーとカードを丸ごと除外する
      const removedTurnIndex = room.turnOrder.indexOf(targetId);

      room.players = room.players.filter((p) => p.playerId !== targetId);
      room.turnOrder = room.turnOrder.filter((id) => id !== targetId);
      room.boardOrder = room.boardOrder.filter((id) => id !== targetId);

      // 除外されたプレイヤーがcurrentTurnIndexより手前にいた場合、
      // turnOrderが1つ詰まる分だけインデックスも詰める（そうしないと次のターンがずれる）
      if (removedTurnIndex !== -1 && removedTurnIndex < room.currentTurnIndex) {
        room.currentTurnIndex -= 1;
      }
      if (room.currentTurnIndex >= room.turnOrder.length) {
        room.currentTurnIndex = Math.max(0, room.turnOrder.length - 1);
      }
    }

    if (room.roundHostId === targetId) {
      const activeIds = new Set(
        room.players.filter((p) => !p.excluded).map((p) => p.playerId),
      );
      room.roundHostId = room.turnOrder.find((id) => activeIds.has(id)) ?? '';
    }

    room.paused = false;
    room.pausedPlayerId = undefined;

    const activePlayerCount = room.players.filter((p) => !p.excluded).length;
    if (activePlayerCount < 2) {
      this.broadcast.emitToRoom(room.id, ITO_EVENTS.GAME_ABORTED, {
        reason: '人数不足のため終了しました',
      });
      for (const p of room.players) {
        this.store.unlinkSocket(p.socketId);
      }
      this.store.deleteRoom(room.id, room.roomCode);
      return;
    }

    // 除外で残りプレイヤーだけを見ると現フェーズの完了条件を既に満たしている場合があるため再判定する
    this.gameService.checkProgressAfterExclusion(room);

    this.broadcast.emitToRoom(room.id, ITO_EVENTS.GAME_RESUMED, {});
    this.broadcast.broadcastRoomState(room);
  }

  abortGame(client: Socket) {
    const room = this.store.getRoomBySocketId(client.id);
    if (!room) return;

    const requester = room.players.find((p) => p.socketId === client.id);
    if (!requester?.isRoomOwner) return;

    this.broadcast.emitToRoom(room.id, ITO_EVENTS.GAME_ABORTED, {
      reason: 'ホストが中断しました',
    });
    for (const p of room.players) {
      this.store.unlinkSocket(p.socketId);
    }
    this.store.deleteRoom(room.id, room.roomCode);
  }

  resumeGame(client: Socket) {
    const room = this.store.getRoomBySocketId(client.id);
    if (!room || !room.paused) return;

    const requester = room.players.find((p) => p.socketId === client.id);
    if (!requester?.isRoomOwner) return;

    room.paused = false;
    room.pausedPlayerId = undefined;
    this.broadcast.emitToRoom(room.id, ITO_EVENTS.GAME_RESUMED, {});
    this.broadcast.broadcastRoomState(room);
  }
}

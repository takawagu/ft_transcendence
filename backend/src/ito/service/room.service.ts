import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import {
  AwaitReturnPayload,
  ExcludePlayerPayload,
  ITO_EVENTS,
  JoinRoomPayload,
  RejoinPayload,
} from '../ito.events';
import { ItoRoom } from '../types';
import { RoomStore } from './room.store';
import { BroadcastService } from './broadcast.service';
import { GameService } from './game.service';
import { activeCount, awolPlayers, connectedPlayers } from './player-utils';

@Injectable()
export class RoomService {
  constructor(
    private readonly store: RoomStore,
    private readonly broadcast: BroadcastService,
    private readonly gameService: GameService,
  ) {}

  createRoom(client: Socket, playerName: string, playerId: string, totalRounds?: number) {
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
          status: 'ACTIVE',
          awaitingReturn: false,
          playerPhase: 'INPUT',
          hasSubmittedPrompt: false,
        },
      ],
      theme: '',
      totalRounds: totalRounds || 3,
      currentRound: 0,
      turnOrder: [],
      currentTurnIndex: 0,
      roundHostId: '',
      boardOrder: [],
      paused: false,
      messages: [],
    };

    this.store.addRoom(room);
    this.store.linkSocket(client.id, roomId, playerId);
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
      // 空のロビーが猶予中に生き残っている場合（ホストが1人でリロードした直後など）、
      // 最初に入った人がホストになる。そうしないとホスト不在で誰も確定できない部屋になる。
      isRoomOwner: room.players.length === 0,
      status: 'ACTIVE',
      awaitingReturn: false,
      playerPhase: 'INPUT',
      hasSubmittedPrompt: false,
    });
    this.store.linkSocket(client.id, room.id, payload.playerId);
    client.join(room.id);

    this.broadcast.broadcastRoomState(room);
    console.log(`[ITO] ${payload.playerName} joined room ${payload.roomCode}`);
  }

  confirmMembers(client: Socket) {
    const resolved = this.store.resolve(client.id);
    if (!resolved) return;
    const { room, player } = resolved;

    if (!player.isRoomOwner || room.roomPhase !== 'WAITING') return;
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
    const resolved = this.store.resolve(client.id);
    if (!resolved) return;
    const { room, player } = resolved;

    // ゲーム進行中の離脱はturnOrder/boardOrder/roundHostIdの再計算を伴うため、
    // このパスでは受け付けない。切断→ホストの除外操作を通すこと（不変条件I5）。
    if (room.roomPhase !== 'WAITING') {
      client.emit('ito:error', {
        message: 'ゲーム中は退室できません',
      });
      return;
    }

    room.players = room.players.filter((p) => p.playerId !== player.playerId);
    this.store.unlinkSocket(client.id);
    client.leave(room.id);

    if (room.players.length === 0) {
      this.store.unlinkRoomSockets(room);
      this.store.deleteRoom(room.id, room.roomCode);
      return;
    }

    if (!room.players.some((p) => p.isRoomOwner)) {
      room.players[0].isRoomOwner = true;
    }

    this.broadcast.broadcastRoomState(room);
    console.log(`[ITO] player ${player.name} left room ${room.roomCode}`);
  }

  dissolveRoom(client: Socket) {
    const resolved = this.store.resolve(client.id);
    if (!resolved) return;
    const { room, player } = resolved;

    if (!player.isRoomOwner) return;

    this.broadcast.emitToRoom(room.id, ITO_EVENTS.ROOM_DISSOLVED, {});

    this.store.unlinkRoomSockets(room);
    this.store.deleteRoom(room.id, room.roomCode);
    console.log(`[ITO] room ${room.roomCode} dissolved by ${player.name}`);
  }

  handleDisconnect(socketId: string) {
    const resolved = this.store.resolve(socketId);
    this.store.unlinkSocket(socketId);
    if (!resolved) return;
    const { room, player } = resolved;

    if (room.roomPhase === 'WAITING') {
      room.players = room.players.filter((p) => p.playerId !== player.playerId);

      if (room.players.length === 0) {
        // 1人きりのホストがリロードしただけ、ということが普通にある。
        // 即削除するとルームコードと配布済みの招待リンクまで道連れになるので猶予を置く。
        this.store.scheduleDisposal(room);
        return;
      }
      if (!room.players.some((p) => p.isRoomOwner)) {
        room.players[0].isRoomOwner = true;
      }
      this.broadcast.broadcastRoomState(room);
      return;
    }

    player.status = 'DISCONNECTED';
    player.socketId = null;

    if (connectedPlayers(room).length === 0) {
      // 全員が同時に落ちた（＝ポーズ中の相手を待っているホストがリロードした等）だけかもしれない。
      // 猶予内に誰か1人でも戻れば部屋はそのまま復活する。
      // ホスト権はここでは動かさない。移譲先も切断中の誰かにしかならず、
      // その人が戻らなければ誰もポーズを解けない部屋になる。
      this.store.scheduleDisposal(room);
      return;
    }

    if (player.isRoomOwner) {
      player.isRoomOwner = false;
      // 除外済みプレイヤーをホストに据えないよう、接続中→未除外の順に探す
      const newHost =
        connectedPlayers(room).find((p) => p !== player) ??
        room.players.find((p) => p !== player && p.status !== 'EXCLUDED');
      if (newHost) newHost.isRoomOwner = true;
    }

    // GAME_OVERは結果を眺めるだけのフェーズなので、抜けても進行を止める必要がない
    if (room.roomPhase !== 'GAME_OVER') {
      room.paused = true;
      this.broadcast.emitToRoom(room.id, ITO_EVENTS.GAME_PAUSED, {
        disconnectedPlayerId: player.playerId,
        disconnectedPlayerName: player.name,
      });
    }

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
      // WAITINGは席を保持しない設計（handleDisconnect/leaveRoomが物理削除する）なので、
      // ここで見つからないのは異常ではなく正常系。新規参加に倒す。
      // 逆にWAITING以外で見つからない＝purgeExcludedで掃除済み＝戻してはいけない人。
      if (room.roomPhase === 'WAITING' && payload.playerName) {
        this.joinRoom(client, {
          roomCode: payload.roomCode,
          playerId: payload.playerId,
          playerName: payload.playerName,
        });
        return;
      }
      // 「未参加の人が開始済みの部屋に入ろうとした」場合と区別が付かない
      // （purgeExcludedは痕跡を残さない）ので、両方に通じる文言にする
      client.emit('ito:error', {
        message: 'ゲームが進行中のため参加できません',
      });
      return;
    }

    // 除外済みの席は復活させない（復活させると集計対象に幽霊が戻ってしまう）。
    // ホストが「復帰を待つ」を選んでいる/まだ何も選んでいない切断者は復帰できる。
    if (player.status === 'EXCLUDED') {
      client.emit(ITO_EVENTS.GAME_ABORTED, {
        reason: 'ゲームから除外されました',
      });
      return;
    }

    // 同一ページ内でのsocket.io自動再接続では旧ソケットのリンクが残り得るため先に外す
    if (player.socketId) this.store.unlinkSocket(player.socketId);

    player.socketId = client.id;
    player.status = 'ACTIVE';
    player.awaitingReturn = false;
    this.store.linkSocket(client.id, room.id, player.playerId);
    client.join(room.id);

    // 接続中が0人になった部屋が復活したとき、ホストが切断中のままだと
    // ポーズを解ける人が誰も居ない部屋になる。最初に戻った人がホストを引き継ぐ。
    // 通常の切断ではhandleDisconnectが接続中の誰かへ移譲済みなので、ここは発火しない。
    // 元ホストが後から戻ってもホスト権は返さない（reconnect-design.mdの決定事項）。
    if (!connectedPlayers(room).some((p) => p.isRoomOwner)) {
      room.players.forEach((p) => (p.isRoomOwner = false));
      player.isRoomOwner = true;
    }

    this.broadcast.emitResyncState(room, player);
    this.broadcast.emitToRoom(room.id, ITO_EVENTS.PLAYER_RECONNECTED, {
      playerId: player.playerId,
      playerName: player.name,
    });
    this.broadcast.broadcastRoomState(room);
    console.log(`[ITO] ${player.name} rejoined room ${room.roomCode}`);
  }

  excludePlayer(client: Socket, payload?: ExcludePlayerPayload) {
    const resolved = this.store.resolve(client.id);
    if (!resolved) return;
    const { room, player: requester } = resolved;
    if (!room.paused || !requester.isRoomOwner) return;

    // 対象は必ず「今まさに切断中の人」に限る。再接続済みの人を誤って除外できないようにする。
    // playerId未指定の場合は先頭の切断者（旧クライアント互換）。
    const awol = awolPlayers(room);
    const target = payload?.playerId
      ? awol.find((p) => p.playerId === payload.playerId)
      : awol[0];

    if (!target) {
      client.emit('ito:error', {
        message: '対象のプレイヤーは既に復帰しています',
      });
      return;
    }
    const targetId = target.playerId;

    // カードが既に場に公開済みかどうかで除外範囲を分岐する（reconnect-design.md §4）
    const cardAlreadyVisible = room.boardOrder.includes(targetId);

    // room.playersからは削除しない（不変条件I5）。ラウンド途中で消すと、
    // 場に出ているカードの番号・名前・画像が失われて正解判定と結果画面が壊れる。
    // 実際に消えるのはラウンド境界のpurgeExcluded。
    target.status = 'EXCLUDED';
    target.awaitingReturn = false;

    if (!cardAlreadyVisible) {
      // 配置前: まだ誰にも見えていないので、この人の手番ごと消す。
      // turnOrderに残すと本人の番でゲームが止まる。
      room.turnOrder = room.turnOrder.filter((id) => id !== targetId);
      // 不変条件I4: SPEAKING中、次に置くべき人のindexは常に「場に出ている枚数」に等しい
      room.currentTurnIndex = room.boardOrder.length;
    }
    // 配置済みの場合はturnOrder/boardOrderをそのまま維持する。
    // turnOrderから抜くと、まだ配置していない人が居るのに完了判定の分母がずれる。

    if (room.roundHostId === targetId) {
      const activeIds = new Set(
        room.players.filter((p) => p.status !== 'EXCLUDED').map((p) => p.playerId),
      );
      room.roundHostId = room.turnOrder.find((id) => activeIds.has(id)) ?? '';
    }

    if (activeCount(room) < 2) {
      this.broadcast.emitToRoom(room.id, ITO_EVENTS.GAME_ABORTED, {
        reason: '人数不足のため終了しました',
      });
      this.store.unlinkRoomSockets(room);
      this.store.deleteRoom(room.id, room.roomCode);
      return;
    }

    // 切断者がまだ他に残っていればポーズは解除しない。
    // ここで無条件に解除すると、未処理の切断者が幽霊のまま進行して集計が固まる。
    if (awolPlayers(room).length === 0) {
      room.paused = false;
      // 除外で分母が減り、残りだけで現フェーズの完了条件を満たしている場合があるため再判定する
      this.gameService.advancePhaseIfComplete(room);
      this.broadcast.emitToRoom(room.id, ITO_EVENTS.GAME_RESUMED, {});
    }

    this.broadcast.broadcastRoomState(room);
  }

  /** ホストが切断中プレイヤーの復帰を待つと宣言する。ゲームはポーズしたまま */
  awaitReturn(client: Socket, payload: AwaitReturnPayload) {
    const resolved = this.store.resolve(client.id);
    if (!resolved) return;
    const { room, player: requester } = resolved;
    if (!room.paused || !requester.isRoomOwner) return;

    const target = awolPlayers(room).find(
      (p) => p.playerId === payload.playerId,
    );
    if (!target) {
      client.emit('ito:error', {
        message: '対象のプレイヤーは既に復帰しています',
      });
      return;
    }

    target.awaitingReturn = true;
    this.broadcast.broadcastRoomState(room);
  }

  abortGame(client: Socket) {
    const resolved = this.store.resolve(client.id);
    if (!resolved) return;
    const { room, player: requester } = resolved;
    if (!requester.isRoomOwner) return;

    this.broadcast.emitToRoom(room.id, ITO_EVENTS.GAME_ABORTED, {
      reason: 'ホストが中断しました',
    });
    this.store.unlinkRoomSockets(room);
    this.store.deleteRoom(room.id, room.roomCode);
  }

  resumeGame(client: Socket) {
    const resolved = this.store.resolve(client.id);
    if (!resolved) return;
    const { room, player: requester } = resolved;
    if (!room.paused) return;
    if (!requester.isRoomOwner) return;

    // 切断者を抱えたまま再開すると、その人の手番や集計で必ず止まる。
    // ホストは常に「除外」を選べるので、この制限で詰むことはない。
    if (awolPlayers(room).length > 0) {
      client.emit('ito:error', {
        message: '切断中のプレイヤーがいるため再開できません',
      });
      return;
    }

    room.paused = false;
    this.broadcast.emitToRoom(room.id, ITO_EVENTS.GAME_RESUMED, {});
    // ポーズ中に完了していた画像生成などをここで消化する
    this.gameService.advancePhaseIfComplete(room);
    this.broadcast.broadcastRoomState(room);
  }
}

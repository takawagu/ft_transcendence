import { Socket } from 'socket.io';
import { RoomService } from './room.service';
import { ROOM_DISPOSE_GRACE_MS, RoomStore } from './room.store';
import { BroadcastService } from './broadcast.service';
import { GameService } from './game.service';
import { ItoPlayer, ItoRoom } from '../types';
import { awolPlayers } from './player-utils';
import { FriendsService } from '../../friends/friends.service';

function makePlayer(overrides: Partial<ItoPlayer>): ItoPlayer {
  return {
    socketId: `sock-${overrides.playerId}`,
    playerId: 'unset',
    name: `p${overrides.playerId}`,
    isRoomOwner: false,
    status: 'ACTIVE',
    awaitingReturn: false,
    cardNumber: 50,
    playerPhase: 'DONE',
    hasSubmittedPrompt: true,
    ...overrides,
  };
}

function makeRoom(overrides: Partial<ItoRoom>): ItoRoom {
  return {
    id: 'room1',
    roomCode: 'ABC123',
    roomPhase: 'SPEAKING',
    players: [],
    theme: 'theme',
    totalRounds: 3,
    currentRound: 1,
    turnOrder: [],
    currentTurnIndex: 0,
    roundHostId: '',
    boardOrder: [],
    paused: false,
    messages: [],
    ...overrides,
  };
}

function fakeSocket(id: string): Socket {
  return { id, join: jest.fn(), leave: jest.fn(), emit: jest.fn() } as unknown as Socket;
}

describe('RoomService disconnect handling', () => {
  let service: RoomService;
  let store: RoomStore;
  let broadcast: jest.Mocked<
    Pick<
      BroadcastService,
      | 'emitToRoom'
      | 'broadcastRoomState'
      | 'broadcastPhaseChange'
      | 'emitResyncState'
      | 'dropSocket'
    >
  >;
  let gameService: jest.Mocked<Pick<GameService, 'advancePhaseIfComplete'>>;
  let friends: jest.Mocked<Pick<FriendsService, 'areBlockedEitherWay'>>;

  beforeEach(() => {
    broadcast = {
      emitToRoom: jest.fn(),
      broadcastRoomState: jest.fn(),
      broadcastPhaseChange: jest.fn(),
      emitResyncState: jest.fn(),
      dropSocket: jest.fn(),
    };
    gameService = { advancePhaseIfComplete: jest.fn() };
    // 既定はブロック無し。ブロックを検証するテストだけが個別に上書きする
    friends = { areBlockedEitherWay: jest.fn().mockResolvedValue(false) };
    store = new RoomStore();
    service = new RoomService(
      store,
      broadcast as unknown as BroadcastService,
      gameService as unknown as GameService,
      friends as unknown as FriendsService,
    );
  });

  /** SPEAKING中の部屋を登録する。先頭がホスト。boardOrderに載せたIDは「配置済み」扱い */
  function seedRoom(ids = ['a', 'b', 'c'], boardOrder: string[] = []): ItoRoom {
    const room = makeRoom({
      turnOrder: [...ids],
      roundHostId: ids[0],
      boardOrder,
      players: ids.map((id, i) => makePlayer({ playerId: id, isRoomOwner: i === 0 })),
    });
    store.addRoom(room);
    for (const p of room.players) {
      store.linkSocket(p.socketId!, room.id, p.playerId);
    }
    return room;
  }

  it('tracks every disconnected player, not just the most recent one', () => {
    const room = seedRoom();

    service.handleDisconnect('sock-b');
    service.handleDisconnect('sock-c');

    expect(awolPlayers(room).map((p) => p.playerId)).toEqual(['b', 'c']);
    expect(room.paused).toBe(true);
  });

  it('keeps the game paused until every disconnected player is dealt with', () => {
    // 2人除外しても最小人数(2)を割らないよう4人で始める
    const room = seedRoom(['a', 'b', 'c', 'd']);
    service.handleDisconnect('sock-b');
    service.handleDisconnect('sock-c');

    service.excludePlayer(fakeSocket('sock-a'), { playerId: 'b' });
    expect(room.paused).toBe(true);

    service.excludePlayer(fakeSocket('sock-a'), { playerId: 'c' });
    expect(room.paused).toBe(false);
  });

  it('refuses to exclude a player who already reconnected', async () => {
    const room = seedRoom();
    service.handleDisconnect('sock-b');
    await service.rejoin(fakeSocket('sock-b2'), { roomCode: 'ABC123', playerId: 'b' });

    const host = fakeSocket('sock-a');
    service.excludePlayer(host, { playerId: 'b' });

    expect(host.emit).toHaveBeenCalledWith(
      'ito:error',
      expect.objectContaining({ message: expect.stringContaining('復帰') }),
    );
    expect(room.players.find((p) => p.playerId === 'b')?.status).toBe('ACTIVE');
  });

  it('refuses to resume while someone is still disconnected', () => {
    const room = seedRoom();
    service.handleDisconnect('sock-b');

    const host = fakeSocket('sock-a');
    service.resumeGame(host);

    expect(room.paused).toBe(true);
    expect(host.emit).toHaveBeenCalledWith('ito:error', expect.anything());
  });

  it('resumes once the disconnected player is back', async () => {
    const room = seedRoom();
    service.handleDisconnect('sock-b');
    await service.rejoin(fakeSocket('sock-b2'), { roomCode: 'ABC123', playerId: 'b' });

    // 本人が戻っただけでは自動再開しない（ホストの明示操作が要る）
    expect(room.paused).toBe(true);

    service.resumeGame(fakeSocket('sock-a'));
    expect(room.paused).toBe(false);
  });

  it('does not let an excluded player rejoin', async () => {
    // bのカードは場に出ている＝除外してもplayersには残る（EXCLUDED）ケース
    const room = seedRoom(['a', 'b', 'c'], ['b']);
    service.handleDisconnect('sock-b');
    service.excludePlayer(fakeSocket('sock-a'), { playerId: 'b' });

    const ghost = fakeSocket('sock-b2');
    await service.rejoin(ghost, { roomCode: 'ABC123', playerId: 'b' });

    expect(ghost.emit).toHaveBeenCalledWith('ito:gameAborted', expect.anything());
    expect(room.players.find((p) => p.playerId === 'b')?.status).not.toBe('ACTIVE');
  });

  it('marks a player as awaited without resuming the game', () => {
    const room = seedRoom();
    service.handleDisconnect('sock-b');

    service.awaitReturn(fakeSocket('sock-a'), { playerId: 'b' });

    expect(room.players.find((p) => p.playerId === 'b')?.awaitingReturn).toBe(true);
    expect(room.paused).toBe(true);
  });

  it('keeps an excluded player in the array so their placed card survives the round', () => {
    // bのカードは場に出ている。ここでplayersから消すと結果画面の番号・名前が失われる
    const room = seedRoom(['a', 'b', 'c'], ['b']);
    service.handleDisconnect('sock-b');
    service.excludePlayer(fakeSocket('sock-a'), { playerId: 'b' });

    expect(room.players.map((p) => p.playerId)).toContain('b');
    expect(room.boardOrder).toContain('b');
    // 既に自分の番を終えているのでturnOrderもそのまま（完了判定の分母を保つ）
    expect(room.turnOrder).toContain('b');
  });

  it('drops a not-yet-placed player from turnOrder and keeps the turn index consistent', () => {
    // aだけ配置済み。bは未配置のまま切断→除外される
    const room = seedRoom(['a', 'b', 'c'], ['a']);
    room.currentTurnIndex = 1;
    service.handleDisconnect('sock-b');
    service.excludePlayer(fakeSocket('sock-a'), { playerId: 'b' });

    expect(room.turnOrder).toEqual(['a', 'c']);
    // 不変条件I4: 次に置く人のindexは常に場の枚数と一致する
    expect(room.currentTurnIndex).toBe(room.boardOrder.length);
    expect(room.turnOrder[room.currentTurnIndex]).toBe('c');
  });

  it('rejects leaving the room once the game has started', () => {
    const room = seedRoom();
    const leaver = fakeSocket('sock-c');

    service.leaveRoom(leaver);

    expect(room.players.map((p) => p.playerId)).toContain('c');
    expect(leaver.emit).toHaveBeenCalledWith('ito:error', expect.anything());
  });

  it('hands the host role to a connected player when the host drops', () => {
    const room = seedRoom();

    service.handleDisconnect('sock-a');

    const owner = room.players.find((p) => p.isRoomOwner);
    expect(owner?.status).toBe('ACTIVE');
    expect(owner?.playerId).not.toBe('a');
  });

  /**
   * WAITINGは席を保持しない（handleDisconnect/leaveRoomが物理削除する）ので、
   * rejoin時に「playersに居ない」のは正常系。ここを弾くと退室後の再入室と
   * ロビーでのリロードが両方詰む。
   */
  describe('rejoin in WAITING', () => {
    function seedLobby(ids = ['a', 'b']): ItoRoom {
      const room = makeRoom({
        roomPhase: 'WAITING',
        currentRound: 0,
        players: ids.map((id, i) => makePlayer({ playerId: id, isRoomOwner: i === 0 })),
      });
      store.addRoom(room);
      for (const p of room.players) {
        store.linkSocket(p.socketId!, room.id, p.playerId);
      }
      return room;
    }

    it('re-seats a player who left the lobby and came back with the same code', async () => {
      const room = seedLobby();
      service.leaveRoom(fakeSocket('sock-b'));
      expect(room.players.map((p) => p.playerId)).toEqual(['a']);

      const returning = fakeSocket('sock-b2');
      await service.rejoin(returning, { roomCode: 'ABC123', playerId: 'b', playerName: 'pb' });

      expect(room.players.map((p) => p.playerId)).toEqual(['a', 'b']);
      expect(returning.emit).not.toHaveBeenCalledWith('ito:error', expect.anything());
      expect(store.resolve('sock-b2')?.player.playerId).toBe('b');
    });

    it('re-seats a player who reloaded the lobby page', async () => {
      const room = seedLobby();
      service.handleDisconnect('sock-b');
      expect(room.players.map((p) => p.playerId)).toEqual(['a']);

      await service.rejoin(fakeSocket('sock-b2'), {
        roomCode: 'ABC123',
        playerId: 'b',
        playerName: 'pb',
      });

      expect(room.players.map((p) => p.playerId)).toEqual(['a', 'b']);
    });

    it('does not re-seat someone who is missing from a started game', async () => {
      // purgeExcludedで掃除された後の状態。戻してはいけない人
      seedRoom(['a', 'c']);
      const ghost = fakeSocket('sock-b2');

      await service.rejoin(ghost, { roomCode: 'ABC123', playerId: 'b', playerName: 'pb' });

      expect(ghost.emit).toHaveBeenCalledWith('ito:error', expect.anything());
      expect(store.resolve('sock-b2')).toBeUndefined();
    });

    it('seats a first-time joiner arriving through the rejoin path', async () => {
      // クライアントは初回参加とリロードを区別せず常にrejoinを送る
      const room = seedLobby(['a']);

      await service.rejoin(fakeSocket('sock-z'), {
        roomCode: 'ABC123',
        playerId: 'z',
        playerName: 'pz',
      });

      expect(room.players.map((p) => p.playerId)).toEqual(['a', 'z']);
      expect(room.players.find((p) => p.playerId === 'z')?.isRoomOwner).toBe(false);
    });

    it('still refuses a duplicate seat for a player already in the lobby', async () => {
      const room = seedLobby();
      const dupe = fakeSocket('sock-dupe');

      await service.rejoin(dupe, { roomCode: 'ABC123', playerId: 'b', playerName: 'pb' });

      // 既に席がある＝rejoin本来の経路。joinRoomの重複チェックには落ちない
      expect(room.players.filter((p) => p.playerId === 'b')).toHaveLength(1);
      expect(room.players.find((p) => p.playerId === 'b')?.socketId).toBe('sock-dupe');
    });

    it('falls back to the plain failure when the client sends no name', async () => {
      const room = seedLobby();
      service.leaveRoom(fakeSocket('sock-b'));

      const returning = fakeSocket('sock-b2');
      await service.rejoin(returning, { roomCode: 'ABC123', playerId: 'b' });

      expect(returning.emit).toHaveBeenCalledWith('ito:error', expect.anything());
      expect(room.players.map((p) => p.playerId)).toEqual(['a']);
    });
  });

  describe('seat takeover', () => {
    it('cuts the old socket loose when a second connection takes the seat', async () => {
      // 回帰: 旧ソケットを部屋に残すと、操作は全てresolveで弾かれるのに
      // ブロードキャストだけは届き続ける「何も効かないタブ」になっていた。
      const room = seedRoom(['a', 'b']);

      await service.rejoin(fakeSocket('sock-b2'), { roomCode: 'ABC123', playerId: 'b' });

      expect(broadcast.dropSocket).toHaveBeenCalledWith('sock-b', room.id);
      expect(store.resolve('sock-b')).toBeUndefined();
      expect(store.resolve('sock-b2')?.player.playerId).toBe('b');
    });

    it('has nothing to cut loose when the seat was already empty', async () => {
      seedRoom(['a', 'b']);
      service.handleDisconnect('sock-b');

      await service.rejoin(fakeSocket('sock-b2'), { roomCode: 'ABC123', playerId: 'b' });

      expect(broadcast.dropSocket).not.toHaveBeenCalled();
    });

    it('does not announce a reconnect when the seat was never seen to drop', async () => {
      // 別タブが席を引き継いだだけ。他プレイヤーは離脱を見ていないので通知は嘘になる
      const room = seedRoom(['a', 'b']);

      await service.rejoin(fakeSocket('sock-b2'), { roomCode: 'ABC123', playerId: 'b' });

      expect(broadcast.emitToRoom).not.toHaveBeenCalledWith(
        room.id,
        'ito:playerReconnected',
        expect.anything(),
      );
    });

    it('announces a reconnect when the player really had dropped', async () => {
      const room = seedRoom(['a', 'b']);
      service.handleDisconnect('sock-b');

      await service.rejoin(fakeSocket('sock-b2'), { roomCode: 'ABC123', playerId: 'b' });

      expect(broadcast.emitToRoom).toHaveBeenCalledWith(room.id, 'ito:playerReconnected', {
        playerId: 'b',
        playerName: 'pb',
      });
    });

    it('does not cut loose the very socket that is rejoining', async () => {
      // 同じソケットからrejoinが二度来ても、自分を部屋から外してはいけない
      seedRoom(['a', 'b']);

      await service.rejoin(fakeSocket('sock-b'), { roomCode: 'ABC123', playerId: 'b' });

      expect(broadcast.dropSocket).not.toHaveBeenCalled();
      expect(store.resolve('sock-b')?.player.playerId).toBe('b');
    });
  });

  describe('disposal grace period', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    /** 猶予が確実に切れるところまで時計を進める */
    function waitOutGrace() {
      jest.advanceTimersByTime(ROOM_DISPOSE_GRACE_MS + 1);
    }

    it('keeps a started room alive when the last connected player drops', () => {
      seedRoom(['a', 'b']);

      service.handleDisconnect('sock-b');
      service.handleDisconnect('sock-a');

      expect(store.getRoomByCode('ABC123')).toBeDefined();
    });

    it('disposes the room once the grace period passes with nobody back', () => {
      seedRoom(['a', 'b']);

      service.handleDisconnect('sock-b');
      service.handleDisconnect('sock-a');
      waitOutGrace();

      expect(store.getRoomByCode('ABC123')).toBeUndefined();
    });

    it('revives the room when someone rejoins inside the grace period', async () => {
      const room = seedRoom(['a', 'b']);
      service.handleDisconnect('sock-b');
      service.handleDisconnect('sock-a');

      await service.rejoin(fakeSocket('sock-a2'), { roomCode: 'ABC123', playerId: 'a' });
      waitOutGrace();

      expect(store.getRoomByCode('ABC123')).toBe(room);
      expect(room.players.find((p) => p.playerId === 'a')?.status).toBe('ACTIVE');
      // 相手はまだ戻っていないので、ホストが対応するまでポーズは続く
      expect(room.paused).toBe(true);
      expect(awolPlayers(room).map((p) => p.playerId)).toEqual(['b']);
    });

    it('hands the host role to whoever comes back first', async () => {
      // ホストaが最後に落ちた部屋では移譲が起きないため、bが戻った時点でbがホストになる
      const room = seedRoom(['a', 'b']);
      service.handleDisconnect('sock-b');
      service.handleDisconnect('sock-a');

      await service.rejoin(fakeSocket('sock-b2'), { roomCode: 'ABC123', playerId: 'b' });

      expect(room.players.filter((p) => p.isRoomOwner).map((p) => p.playerId)).toEqual([
        'b',
      ]);
    });

    it('does not take the host role from a connected host', async () => {
      const room = seedRoom(['a', 'b', 'c']);
      service.handleDisconnect('sock-c');

      await service.rejoin(fakeSocket('sock-c2'), { roomCode: 'ABC123', playerId: 'c' });

      expect(room.players.filter((p) => p.isRoomOwner).map((p) => p.playerId)).toEqual([
        'a',
      ]);
    });

    it('keeps an empty lobby alive so a solo host can reload back into it', async () => {
      const room = makeRoom({
        roomPhase: 'WAITING',
        currentRound: 0,
        players: [makePlayer({ playerId: 'a', isRoomOwner: true })],
      });
      store.addRoom(room);
      store.linkSocket('sock-a', room.id, 'a');

      service.handleDisconnect('sock-a');
      expect(room.players).toHaveLength(0);
      expect(store.getRoomByCode('ABC123')).toBe(room);

      await service.rejoin(fakeSocket('sock-a2'), {
        roomCode: 'ABC123',
        playerId: 'a',
        playerName: 'pa',
      });
      waitOutGrace();

      expect(store.getRoomByCode('ABC123')).toBe(room);
      expect(room.players.map((p) => p.playerId)).toEqual(['a']);
      expect(room.players[0].isRoomOwner).toBe(true);
    });

    it('still deletes the room immediately when the last player leaves on purpose', () => {
      const room = makeRoom({
        roomPhase: 'WAITING',
        currentRound: 0,
        players: [makePlayer({ playerId: 'a', isRoomOwner: true })],
      });
      store.addRoom(room);
      store.linkSocket('sock-a', room.id, 'a');

      service.leaveRoom(fakeSocket('sock-a'));

      expect(store.getRoomByCode('ABC123')).toBeUndefined();
    });
  });

  /**
   * itoのルームはコードを知っていれば誰でも入れる設計なので、招待経路を塞ぐだけでは
   * ブロックした相手の同席を防げない。参加そのものを止めるのはjoinRoomだけ。
   */
  describe('block check on join', () => {
    /** playerIdはJWT由来の数値文字列。ブロック判定はこれをそのままuserIdとして使う */
    function seedLobby(ids = ['1']): ItoRoom {
      const room = makeRoom({
        roomPhase: 'WAITING',
        currentRound: 0,
        players: ids.map((id, i) => makePlayer({ playerId: id, isRoomOwner: i === 0 })),
      });
      store.addRoom(room);
      for (const p of room.players) {
        store.linkSocket(p.socketId!, room.id, p.playerId);
      }
      return room;
    }

    it('refuses a joiner who has a block relation with the host', async () => {
      const room = seedLobby();
      friends.areBlockedEitherWay.mockResolvedValue(true);

      const joiner = fakeSocket('sock-9');
      await service.joinRoom(joiner, {
        roomCode: 'ABC123',
        playerId: '9',
        playerName: 'p9',
      });

      expect(joiner.emit).toHaveBeenCalledWith('ito:error', {
        message: 'このルームには参加できません',
      });
      expect(room.players.map((p) => p.playerId)).toEqual(['1']);
      expect(store.resolve('sock-9')).toBeUndefined();
    });

    it('asks about the host, not about whoever joined first', async () => {
      seedLobby(['1', '2']);

      await service.joinRoom(fakeSocket('sock-9'), {
        roomCode: 'ABC123',
        playerId: '9',
        playerName: 'p9',
      });

      expect(friends.areBlockedEitherWay).toHaveBeenCalledTimes(1);
      expect(friends.areBlockedEitherWay).toHaveBeenCalledWith(1, 9);
    });

    it('blocks the rejoin path too, since first-time joiners arrive through it', async () => {
      // クライアントは初回参加とリロードを区別せず常にrejoinを送る
      const room = seedLobby();
      friends.areBlockedEitherWay.mockResolvedValue(true);

      await service.rejoin(fakeSocket('sock-9'), {
        roomCode: 'ABC123',
        playerId: '9',
        playerName: 'p9',
      });

      expect(room.players.map((p) => p.playerId)).toEqual(['1']);
    });

    it('lets an unrelated player in', async () => {
      const room = seedLobby();

      await service.joinRoom(fakeSocket('sock-9'), {
        roomCode: 'ABC123',
        playerId: '9',
        playerName: 'p9',
      });

      expect(room.players.map((p) => p.playerId)).toEqual(['1', '9']);
    });

    it('does not seat anyone when the block check itself fails', async () => {
      // DBが引けない状態で通すと遮断が意味をなさないので、拒否に倒す
      const room = seedLobby();
      friends.areBlockedEitherWay.mockRejectedValue(new Error('db down'));
      const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});

      const joiner = fakeSocket('sock-9');
      await service.joinRoom(joiner, {
        roomCode: 'ABC123',
        playerId: '9',
        playerName: 'p9',
      });

      expect(room.players.map((p) => p.playerId)).toEqual(['1']);
      expect(joiner.emit).toHaveBeenCalledWith('ito:error', expect.anything());
      errorLog.mockRestore();
    });

    it('does not seat anyone into a room that was disposed while the check ran', async () => {
      const room = seedLobby();
      friends.areBlockedEitherWay.mockImplementation(async () => {
        store.deleteRoom(room.id, room.roomCode);
        return false;
      });

      const joiner = fakeSocket('sock-9');
      await service.joinRoom(joiner, {
        roomCode: 'ABC123',
        playerId: '9',
        playerName: 'p9',
      });

      expect(room.players.map((p) => p.playerId)).toEqual(['1']);
      expect(joiner.emit).toHaveBeenCalledWith('ito:error', expect.anything());
    });

    it('skips the check for an empty lobby, which has no host to compare against', async () => {
      const room = seedLobby();
      service.handleDisconnect('sock-1');
      expect(room.players).toHaveLength(0);

      await service.joinRoom(fakeSocket('sock-9'), {
        roomCode: 'ABC123',
        playerId: '9',
        playerName: 'p9',
      });

      expect(friends.areBlockedEitherWay).not.toHaveBeenCalled();
      expect(room.players.map((p) => p.playerId)).toEqual(['9']);
    });
  });
});

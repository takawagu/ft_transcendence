import { Socket } from 'socket.io';
import { RoomService } from './room.service';
import { RoomStore } from './room.store';
import { BroadcastService } from './broadcast.service';
import { GameService } from './game.service';
import { ItoPlayer, ItoRoom } from '../types';
import { awolPlayers } from './player-utils';

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
      'emitToRoom' | 'broadcastRoomState' | 'broadcastPhaseChange' | 'emitResyncState'
    >
  >;
  let gameService: jest.Mocked<Pick<GameService, 'advancePhaseIfComplete'>>;

  beforeEach(() => {
    broadcast = {
      emitToRoom: jest.fn(),
      broadcastRoomState: jest.fn(),
      broadcastPhaseChange: jest.fn(),
      emitResyncState: jest.fn(),
    };
    gameService = { advancePhaseIfComplete: jest.fn() };
    store = new RoomStore();
    service = new RoomService(
      store,
      broadcast as unknown as BroadcastService,
      gameService as unknown as GameService,
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

  it('refuses to exclude a player who already reconnected', () => {
    const room = seedRoom();
    service.handleDisconnect('sock-b');
    service.rejoin(fakeSocket('sock-b2'), { roomCode: 'ABC123', playerId: 'b' });

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

  it('resumes once the disconnected player is back', () => {
    const room = seedRoom();
    service.handleDisconnect('sock-b');
    service.rejoin(fakeSocket('sock-b2'), { roomCode: 'ABC123', playerId: 'b' });

    // 本人が戻っただけでは自動再開しない（ホストの明示操作が要る）
    expect(room.paused).toBe(true);

    service.resumeGame(fakeSocket('sock-a'));
    expect(room.paused).toBe(false);
  });

  it('does not let an excluded player rejoin', () => {
    // bのカードは場に出ている＝除外してもplayersには残る（EXCLUDED）ケース
    const room = seedRoom(['a', 'b', 'c'], ['b']);
    service.handleDisconnect('sock-b');
    service.excludePlayer(fakeSocket('sock-a'), { playerId: 'b' });

    const ghost = fakeSocket('sock-b2');
    service.rejoin(ghost, { roomCode: 'ABC123', playerId: 'b' });

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
});

import { GameService } from './game.service';
import { RoomStore } from './room.store';
import { BroadcastService } from './broadcast.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ItoRoom, ItoPlayer } from '../types';

function makePlayer(overrides: Partial<ItoPlayer>): ItoPlayer {
  return {
    socketId: `sock-${overrides.playerId}`,
    playerId: 'unset',
    name: `p${overrides.playerId}`,
    isRoomOwner: false,
    connected: true,
    excluded: false,
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
    roomPhase: 'INPUT_GENERATING',
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

describe('GameService turn order', () => {
  let service: GameService;
  let broadcast: jest.Mocked<Pick<BroadcastService, 'emitToRoom' | 'broadcastRoomState'>>;

  beforeEach(() => {
    broadcast = {
      emitToRoom: jest.fn(),
      broadcastRoomState: jest.fn(),
    };
    const store = new RoomStore();
    const prisma = {} as PrismaService;
    service = new GameService(store, broadcast as unknown as BroadcastService, prisma);
  });

  it('round1: buildTurnOrder includes exactly the active players', () => {
    const room = makeRoom({
      currentRound: 1,
      players: [
        makePlayer({ playerId: 'a' }),
        makePlayer({ playerId: 'b' }),
        makePlayer({ playerId: 'c' }),
      ],
    });

    const order: string[] = (service as any).buildTurnOrder(room);

    expect(order.sort()).toEqual(['a', 'b', 'c']);
  });

  it('round>=2: buildTurnOrder rotates and drops a player excluded mid-previous-round', () => {
    // シナリオ: round1でturnOrder=[a,b,c]、aが配置済み除外(excluded:true)されたが
    // turnOrder/boardOrderには残ったまま round1 が ORDERING まで到達したケース
    const room = makeRoom({
      currentRound: 2,
      turnOrder: ['a', 'b', 'c'],
      players: [
        makePlayer({ playerId: 'a', excluded: true, connected: false }),
        makePlayer({ playerId: 'b' }),
        makePlayer({ playerId: 'c' }),
      ],
    });

    const order: string[] = (service as any).buildTurnOrder(room);

    // 除外されたaは含まれない
    expect(order).not.toContain('a');
    // 残りはローテーション: [b,c,a] から a を除いた [b,c]
    expect(order).toEqual(['b', 'c']);
  });

  it('round>=2: transitionToSpeaking never points currentTurnIndex at an excluded player (no deadlock)', () => {
    const room = makeRoom({
      currentRound: 2,
      turnOrder: ['a', 'b', 'c'],
      players: [
        makePlayer({ playerId: 'a', excluded: true, connected: false }),
        makePlayer({ playerId: 'b' }),
        makePlayer({ playerId: 'c' }),
      ],
    });

    (service as any).transitionToSpeaking(room);

    expect(room.turnOrder).not.toContain('a');
    expect(room.roundHostId).not.toBe('a');
    const currentTurnPlayerId = room.turnOrder[room.currentTurnIndex];
    const currentPlayer = room.players.find((p) => p.playerId === currentTurnPlayerId);
    expect(currentPlayer?.excluded).toBe(false);
  });

  it('round>=2: all players excluded except host still produces a valid single-player order', () => {
    const room = makeRoom({
      currentRound: 3,
      turnOrder: ['a', 'b', 'c'],
      players: [
        makePlayer({ playerId: 'a', excluded: true, connected: false }),
        makePlayer({ playerId: 'b', excluded: true, connected: false }),
        makePlayer({ playerId: 'c' }),
      ],
    });

    const order: string[] = (service as any).buildTurnOrder(room);

    expect(order).toEqual(['c']);
  });
});

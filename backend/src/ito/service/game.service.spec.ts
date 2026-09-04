import { Socket } from 'socket.io';
import { GameService } from './game.service';
import { RoomStore } from './room.store';
import { BroadcastService } from './broadcast.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ItoRoom, ItoPlayer } from '../types';
import { CHAT_MESSAGE_MAX_LENGTH } from '../ito.events';

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
  let broadcast: jest.Mocked<
    Pick<
      BroadcastService,
      'emitToRoom' | 'broadcastRoomState' | 'broadcastPhaseChange' | 'emitToSocket'
    >
  >;

  beforeEach(() => {
    broadcast = {
      emitToRoom: jest.fn(),
      broadcastRoomState: jest.fn(),
      broadcastPhaseChange: jest.fn(),
      emitToSocket: jest.fn(),
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
        makePlayer({ playerId: 'a', status: 'EXCLUDED' }),
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
        makePlayer({ playerId: 'a', status: 'EXCLUDED' }),
        makePlayer({ playerId: 'b' }),
        makePlayer({ playerId: 'c' }),
      ],
    });

    (service as any).transitionToSpeaking(room);

    expect(room.turnOrder).not.toContain('a');
    expect(room.roundHostId).not.toBe('a');
    const currentTurnPlayerId = room.turnOrder[room.currentTurnIndex];
    const currentPlayer = room.players.find((p) => p.playerId === currentTurnPlayerId);
    expect(currentPlayer?.status).toBe('ACTIVE');
  });

  it('nextRound keeps the previous turn order so round 2 can rotate from it', () => {
    // 回帰: nextRound()がturnOrderを空にしていた頃は、次ラウンドのbuildTurnOrderが
    // 空配列を回転元にして[]を返し、手番が誰にも回らずゲームが停止していた。
    const room = makeRoom({
      roomPhase: 'ROUND_RESULT',
      currentRound: 1,
      turnOrder: ['a', 'b', 'c'],
      boardOrder: ['a', 'b', 'c'],
      players: [
        makePlayer({ playerId: 'a', isRoomOwner: true }),
        makePlayer({ playerId: 'b' }),
        makePlayer({ playerId: 'c' }),
      ],
    });
    const store = (service as any).store as RoomStore;
    store.addRoom(room);
    store.linkSocket('sock-a', room.id, 'a');

    service.nextRound({ id: 'sock-a' } as any);
    expect(room.turnOrder).toEqual(['a', 'b', 'c']);

    room.currentRound = 2;
    (service as any).transitionToSpeaking(room);

    expect(room.turnOrder).toEqual(['b', 'c', 'a']);
    expect(room.roundHostId).toBe('b');
    expect(room.turnOrder[room.currentTurnIndex]).toBe('b');
  });

  it('nextRound removes excluded players so they stop counting toward the next round', () => {
    // 回帰: 除外済みプレイヤーがplayersに残り続けると、次ラウンドでカードが配られ
    // 進捗の分母にも入り、本人は切断済みで応答できないため永久に完了しなかった。
    const room = makeRoom({
      roomPhase: 'ROUND_RESULT',
      currentRound: 1,
      turnOrder: ['a', 'b', 'c'],
      boardOrder: ['a', 'b', 'c'],
      players: [
        makePlayer({ playerId: 'a', isRoomOwner: true }),
        makePlayer({ playerId: 'b' }),
        makePlayer({ playerId: 'c', status: 'EXCLUDED', socketId: null }),
      ],
    });
    const store = (service as any).store as RoomStore;
    store.addRoom(room);
    store.linkSocket('sock-a', room.id, 'a');

    service.nextRound({ id: 'sock-a' } as any);

    expect(room.players.map((p) => p.playerId)).toEqual(['a', 'b']);

    room.currentRound = 2;
    (service as any).transitionToSpeaking(room);
    expect(room.turnOrder).toEqual(['b', 'a']);
  });

  describe('reveal snapshot', () => {
    /** ORDERING中の部屋を作り、ホストaのソケットを繋いだ状態にする */
    function seedOrdering(): ItoRoom {
      const room = makeRoom({
        roomPhase: 'ORDERING',
        turnOrder: ['a', 'b', 'c'],
        boardOrder: ['a', 'b', 'c'],
        roundHostId: 'a',
        players: [
          makePlayer({ playerId: 'a', isRoomOwner: true, cardNumber: 10 }),
          makePlayer({ playerId: 'b', cardNumber: 20 }),
          makePlayer({ playerId: 'c', cardNumber: 30 }),
        ],
      });
      const store = (service as any).store as RoomStore;
      store.addRoom(room);
      store.linkSocket('sock-a', room.id, 'a');
      return room;
    }

    it('keeps the revealed result on the room so a late rejoin can still see it', () => {
      // 回帰: cardsRevealedは公開の瞬間にしか飛ばないため、保存しないと
      // ROUND_RESULT中に復帰した人の結果画面が空欄になっていた。
      const room = seedOrdering();

      service.confirmOrder({ id: 'sock-a' } as any);

      expect(room.lastReveal).toEqual({
        revealedCards: [
          { playerId: 'a', cardNumber: 10 },
          { playerId: 'b', cardNumber: 20 },
          { playerId: 'c', cardNumber: 30 },
        ],
        submittedOrder: ['a', 'b', 'c'],
        correctOrder: ['a', 'b', 'c'],
        success: true,
      });
      // 保存したものと配信したものが同一であること（片方だけ直る事故を防ぐ）
      expect(broadcast.emitToRoom).toHaveBeenCalledWith(
        room.id,
        'ito:cardsRevealed',
        room.lastReveal,
      );
    });

    it('drops the stored result at the round boundary', () => {
      // purgeExcludedの直後なので、残すと既に消えたプレイヤーを指したまま復帰者へ送られる
      const room = seedOrdering();
      service.confirmOrder({ id: 'sock-a' } as any);
      expect(room.lastReveal).toBeDefined();

      service.nextRound({ id: 'sock-a' } as any);

      expect(room.lastReveal).toBeUndefined();
    });
  });

  it('round>=2: all players excluded except host still produces a valid single-player order', () => {
    const room = makeRoom({
      currentRound: 3,
      turnOrder: ['a', 'b', 'c'],
      players: [
        makePlayer({ playerId: 'a', status: 'EXCLUDED' }),
        makePlayer({ playerId: 'b', status: 'EXCLUDED' }),
        makePlayer({ playerId: 'c' }),
      ],
    });

    const order: string[] = (service as any).buildTurnOrder(room);

    expect(order).toEqual(['c']);
  });
});

/**
 * /ito名前空間にはグローバルのValidationPipeが効かず、payloadは申告されたまま届く。
 * クライアントのmaxLengthは迂回できるので、上限はサーバ側で担保する必要がある。
 */
describe('GameService chat validation', () => {
  let service: GameService;
  let store: RoomStore;
  let broadcast: jest.Mocked<Pick<BroadcastService, 'emitToRoom'>>;
  let room: ItoRoom;

  function fakeSocket(id: string): Socket {
    return {
      id,
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
    } as unknown as Socket;
  }

  beforeEach(() => {
    broadcast = { emitToRoom: jest.fn() };
    store = new RoomStore();
    service = new GameService(
      store,
      broadcast as unknown as BroadcastService,
      {} as PrismaService,
    );

    // チャットが使えるのはORDERING中かつポーズしていない部屋だけ
    room = makeRoom({
      roomPhase: 'ORDERING',
      players: [makePlayer({ playerId: 'a' })],
    });
    store.addRoom(room);
    store.linkSocket('sock-a', room.id, 'a');
  });

  /** 配信された本文。何も配信されていなければundefined */
  function broadcastedMessage(): string | undefined {
    const payload = broadcast.emitToRoom.mock.calls[0]?.[2] as
      | { message?: string }
      | undefined;
    return payload?.message;
  }

  it('accepts a message at exactly the limit', () => {
    const message = 'あ'.repeat(CHAT_MESSAGE_MAX_LENGTH);

    service.sendChat(fakeSocket('sock-a'), { message });

    expect(broadcastedMessage()).toBe(message);
    expect(room.messages).toHaveLength(1);
  });

  it('refuses a message one character over the limit', () => {
    const client = fakeSocket('sock-a');

    service.sendChat(client, {
      message: 'あ'.repeat(CHAT_MESSAGE_MAX_LENGTH + 1),
    });

    expect(broadcast.emitToRoom).not.toHaveBeenCalled();
    expect(room.messages).toHaveLength(0);
    expect(client.emit).toHaveBeenCalledWith(
      'ito:error',
      expect.objectContaining({ message: expect.stringContaining('200') }),
    );
  });

  it('measures the trimmed body, so trailing spaces do not push it over', () => {
    const message = 'あ'.repeat(CHAT_MESSAGE_MAX_LENGTH);

    service.sendChat(fakeSocket('sock-a'), { message: `  ${message}  ` });

    expect(broadcastedMessage()).toBe(message);
  });

  it('drops a whitespace-only message', () => {
    service.sendChat(fakeSocket('sock-a'), { message: '   \n  ' });

    expect(broadcast.emitToRoom).not.toHaveBeenCalled();
    expect(room.messages).toHaveLength(0);
  });

  it('drops a non-string message instead of broadcasting it', () => {
    // ValidationPipeが効かない以上、messageは文字列とは限らない
    service.sendChat(fakeSocket('sock-a'), {
      message: 12345 as unknown as string,
    });

    expect(broadcast.emitToRoom).not.toHaveBeenCalled();
    expect(room.messages).toHaveLength(0);
  });
});

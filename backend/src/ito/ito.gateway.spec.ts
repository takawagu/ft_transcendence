import { Socket } from 'socket.io';
import { ItoGateway } from './ito.gateway';
import { RoomService } from './service/room.service';
import { GameService } from './service/game.service';
import { BroadcastService } from './service/broadcast.service';
import { AuthService } from '../auth/auth.service';

function fakeSocket(token?: unknown): Socket {
  return {
    id: 'sock-1',
    data: {},
    handshake: { auth: token === undefined ? {} : { token } },
    disconnect: jest.fn(),
    emit: jest.fn(),
  } as unknown as Socket;
}

describe('ItoGateway authentication', () => {
  let gateway: ItoGateway;
  let roomService: jest.Mocked<Pick<RoomService, 'createRoom' | 'joinRoom' | 'rejoin' | 'excludePlayer'>>;

  beforeEach(() => {
    roomService = {
      createRoom: jest.fn(),
      joinRoom: jest.fn(),
      rejoin: jest.fn(),
      excludePlayer: jest.fn(),
    };
    // 'good'だけを有効なトークンとして、userId 42 を返す
    const authService = {
      userIdFromToken: (token: unknown) => (token === 'good' ? 42 : undefined),
    };
    gateway = new ItoGateway(
      roomService as unknown as RoomService,
      {} as GameService,
      {} as BroadcastService,
      authService as unknown as AuthService,
    );
  });

  /** 認証を通したソケットを作る */
  function connected(): Socket {
    const client = fakeSocket('good');
    gateway.handleConnection(client);
    return client;
  }

  it('drops a connection with no token', () => {
    const client = fakeSocket();

    gateway.handleConnection(client);

    expect(client.disconnect).toHaveBeenCalled();
    expect((client.data as { playerId?: string }).playerId).toBeUndefined();
  });

  it('drops a connection with an invalid token', () => {
    const client = fakeSocket('forged');

    gateway.handleConnection(client);

    expect(client.disconnect).toHaveBeenCalled();
  });

  it('pins the playerId to the token on connect', () => {
    const client = connected();

    expect(client.disconnect).not.toHaveBeenCalled();
    expect((client.data as { playerId?: string }).playerId).toBe('42');
  });

  it('ignores the playerId a client claims when rejoining', async () => {
    // 他人のuserIdを名乗って席を奪おうとするケース
    const client = connected();

    await gateway.handleRejoin(client, {
      roomCode: 'ABC123',
      playerId: '99',
      playerName: 'なりすまし',
    });

    expect(roomService.rejoin).toHaveBeenCalledWith(client, {
      roomCode: 'ABC123',
      playerId: '42',
      playerName: 'なりすまし',
    });
  });

  it('ignores the playerId a client claims when joining or creating', async () => {
    const client = connected();

    await gateway.handleJoinRoom(client, {
      roomCode: 'ABC123',
      playerName: 'pa',
      playerId: '99',
    });
    gateway.handleCreateRoom(client, { playerName: 'pa', playerId: '99' });

    expect(roomService.joinRoom).toHaveBeenCalledWith(client, {
      roomCode: 'ABC123',
      playerName: 'pa',
      playerId: '42',
    });
    expect(roomService.createRoom).toHaveBeenCalledWith(
      client,
      'pa',
      '42',
      undefined,
    );
  });

  it('leaves the target playerId alone when excluding someone', () => {
    // excludePlayerのplayerIdは「名乗り」ではなく「操作の対象」なので上書きしてはいけない
    const client = connected();

    gateway.handleExcludePlayer(client, { playerId: '99' });

    expect(roomService.excludePlayer).toHaveBeenCalledWith(client, {
      playerId: '99',
    });
  });
});

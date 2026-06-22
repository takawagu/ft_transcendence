import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

// --- canvas constants ---
const W = 800;
const H = 600;
const BALL_R = 10;
const P_W = 10;
const P_H = 100;
const P_HALF = P_H / 2;
const P_MARGIN = 20;
const P_LEFT_EDGE = P_MARGIN + P_W; // ball bounces when x <= this
const P_RIGHT_EDGE = W - P_MARGIN - P_W; // ball bounces when x >= this
const PADDLE_SPEED = 15;
const BALL_INIT_SPEED = 6;
const BALL_MAX_SPEED = 14;
const WIN_SCORE = 11;
const TICK_MS = 30;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface GameState {
  ball: Ball;
  paddle1Y: number;
  paddle2Y: number;
  score1: number;
  score2: number;
}

interface Room {
  id: string;
  player1: string;
  player2: string;
  state: GameState;
  ticker: ReturnType<typeof setInterval> | null;
}

@Injectable()
export class GameService {
  private server: Server;
  private queue: string[] = [];
  private rooms = new Map<string, Room>();
  private playerToRoom = new Map<string, string>();

  setServer(server: Server) {
    this.server = server;
  }

  joinQueue(client: Socket) {
    if (this.playerToRoom.has(client.id)) return;
    if (this.queue.includes(client.id)) return;

    this.queue.push(client.id);
    client.emit('waitingForOpponent');
    console.log(`[Queue] ${client.id} joined. queue size: ${this.queue.length}`);

    if (this.queue.length >= 2) {
      const [p1, p2] = this.queue.splice(0, 2);
      this.createRoom(p1, p2);
    }
  }

  leaveQueue(socketId: string) {
    this.queue = this.queue.filter((id) => id !== socketId);
  }

  movePaddle(socketId: string, direction: 'up' | 'down') {
    const room = this.getRoomByPlayer(socketId);
    if (!room) return;

    const delta = direction === 'up' ? -PADDLE_SPEED : PADDLE_SPEED;
    const clamp = (v: number) => Math.max(P_HALF, Math.min(H - P_HALF, v));

    if (room.player1 === socketId) {
      room.state.paddle1Y = clamp(room.state.paddle1Y + delta);
    } else {
      room.state.paddle2Y = clamp(room.state.paddle2Y + delta);
    }
  }

  handleDisconnect(socketId: string) {
    this.leaveQueue(socketId);

    const room = this.getRoomByPlayer(socketId);
    if (!room) return;

    const opponent = room.player1 === socketId ? room.player2 : room.player1;
    this.server.to(opponent).emit('opponentDisconnected');
    this.destroyRoom(room.id);
  }

  // --- private ---

  private createRoom(p1: string, p2: string) {
    const id = `room_${Date.now()}`;
    const room: Room = {
      id,
      player1: p1,
      player2: p2,
      state: {
        ball: this.spawnBall(1),
        paddle1Y: H / 2,
        paddle2Y: H / 2,
        score1: 0,
        score2: 0,
      },
      ticker: null,
    };

    this.rooms.set(id, room);
    this.playerToRoom.set(p1, id);
    this.playerToRoom.set(p2, id);

    this.server.to(p1).emit('gameStart', { side: 'left' });
    this.server.to(p2).emit('gameStart', { side: 'right' });
    console.log(`[Game] room ${id} created: ${p1} vs ${p2}`);

    room.ticker = setInterval(() => this.tick(room), TICK_MS);
  }

  private tick(room: Room) {
    const s = room.state;
    const b = s.ball;

    b.x += b.vx;
    b.y += b.vy;

    // top / bottom wall
    if (b.y - BALL_R <= 0) {
      b.y = BALL_R;
      b.vy = Math.abs(b.vy);
    } else if (b.y + BALL_R >= H) {
      b.y = H - BALL_R;
      b.vy = -Math.abs(b.vy);
    }

    // left paddle hit
    if (
      b.vx < 0 &&
      b.x - BALL_R <= P_LEFT_EDGE &&
      b.x > P_MARGIN &&
      b.y + BALL_R >= s.paddle1Y - P_HALF &&
      b.y - BALL_R <= s.paddle1Y + P_HALF
    ) {
      b.x = P_LEFT_EDGE + BALL_R;
      b.vx = Math.min(Math.abs(b.vx) * 1.05, BALL_MAX_SPEED);
      b.vy += ((b.y - s.paddle1Y) / P_HALF) * 3;
    }

    // right paddle hit
    if (
      b.vx > 0 &&
      b.x + BALL_R >= P_RIGHT_EDGE &&
      b.x < W - P_MARGIN &&
      b.y + BALL_R >= s.paddle2Y - P_HALF &&
      b.y - BALL_R <= s.paddle2Y + P_HALF
    ) {
      b.x = P_RIGHT_EDGE - BALL_R;
      b.vx = -Math.min(Math.abs(b.vx) * 1.05, BALL_MAX_SPEED);
      b.vy += ((b.y - s.paddle2Y) / P_HALF) * 3;
    }

    // scoring
    if (b.x + BALL_R < 0) {
      s.score2++;
      s.ball = this.spawnBall(-1);
    } else if (b.x - BALL_R > W) {
      s.score1++;
      s.ball = this.spawnBall(1);
    }

    if (s.score1 >= WIN_SCORE) { this.endGame(room, 'player1'); return; }
    if (s.score2 >= WIN_SCORE) { this.endGame(room, 'player2'); return; }

    this.server.to(room.player1).emit('gameState', s);
    this.server.to(room.player2).emit('gameState', s);
  }

  private endGame(room: Room, winner: 'player1' | 'player2') {
    this.server.to(room.player1).emit('gameOver', { winner });
    this.server.to(room.player2).emit('gameOver', { winner });
    console.log(`[Game] room ${room.id} ended. winner: ${winner}`);
    this.destroyRoom(room.id);
  }

  private destroyRoom(id: string) {
    const room = this.rooms.get(id);
    if (!room) return;
    if (room.ticker) clearInterval(room.ticker);
    this.playerToRoom.delete(room.player1);
    this.playerToRoom.delete(room.player2);
    this.rooms.delete(id);
  }

  private getRoomByPlayer(socketId: string): Room | undefined {
    const id = this.playerToRoom.get(socketId);
    return id ? this.rooms.get(id) : undefined;
  }

  private spawnBall(direction: 1 | -1): Ball {
    const angle = ((Math.random() * 60 - 30) * Math.PI) / 180;
    return {
      x: W / 2,
      y: H / 2,
      vx: direction * BALL_INIT_SPEED * Math.cos(angle),
      vy: BALL_INIT_SPEED * Math.sin(angle),
    };
  }
}

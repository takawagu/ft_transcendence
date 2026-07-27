import { ChatMessagePayload, PlayerPhase } from './ito.events';

export interface ItoPlayer {
  socketId: string;
  playerId: string;
  name: string;
  isRoomOwner: boolean;
  connected: boolean;
  excluded: boolean;
  cardNumber?: number;
  prompt?: string;
  imageUrl?: string;
  playerPhase: PlayerPhase;
  hasSubmittedPrompt: boolean;
}

export interface ItoRoom {
  id: string;
  roomCode: string;
  roomPhase: import('./ito.events').RoomPhase;
  players: ItoPlayer[];
  theme: string;
  totalRounds: number;
  currentRound: number;
  turnOrder: string[];
  currentTurnIndex: number;
  roundHostId: string;
  boardOrder: string[];
  paused: boolean;
  pausedPlayerId?: string;
  messages: ChatMessagePayload[];
}

export const SPEAKING_PHASES = [
  'SPEAKING',
  'ORDERING',
  'REVEAL',
  'ROUND_RESULT',
  'GAME_OVER',
] as const;

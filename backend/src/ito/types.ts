import { ChatMessagePayload, PlayerPhase, PlayerStatus } from './ito.events';

export interface ItoPlayer {
  /** 現在紐づいている接続。切断中はnull。identityとしては使わない（playerIdを使うこと） */
  socketId: string | null;
  /** 不変のidentity（DBのuserId） */
  playerId: string;
  name: string;
  isRoomOwner: boolean;
  /** 不変条件: ACTIVE ⟺ socketId !== null / EXCLUDED ⟹ socketId === null */
  status: PlayerStatus;
  /** ホストが「復帰を待つ」を選択済み。表示専用。不変条件: true ⟹ status === 'DISCONNECTED' */
  awaitingReturn: boolean;
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
  /**
   * ゲーム進行の停止フラグ。切断で立ち、切断者が全員片付いた時点でのみ解除できる。
   * 「誰が切断中か」はplayers[].statusから導出するので、ここには持たない。
   */
  paused: boolean;
  messages: ChatMessagePayload[];
}

export const SPEAKING_PHASES = [
  'SPEAKING',
  'ORDERING',
  'REVEAL',
  'ROUND_RESULT',
  'GAME_OVER',
] as const;

export type RoomPhase =
  | 'WAITING'
  | 'THEME_SETTING'
  | 'DEALING'
  | 'INPUT_GENERATING'
  | 'SPEAKING'
  | 'ORDERING'
  | 'REVEAL'
  | 'ROUND_RESULT'
  | 'GAME_OVER';

export type PlayerPhase = 'INPUT' | 'GENERATING' | 'DONE';

/** ACTIVE: 接続中 / DISCONNECTED: 切断中でホストの対応待ち / EXCLUDED: 除外済み */
export type PlayerStatus = 'ACTIVE' | 'DISCONNECTED' | 'EXCLUDED';

export interface PlayerInGameInfo {
  id: string;
  name: string;
  isRoomOwner: boolean;
  playerPhase?: PlayerPhase;
  hasSubmittedPrompt: boolean;
  imageUrl?: string;
  status: PlayerStatus;
  /** ホストが「復帰を待つ」を選択済み */
  awaitingReturn: boolean;
}

export interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

export interface RevealResult {
  revealedCards: { playerId: string; cardNumber: number }[];
  submittedOrder: string[];
  correctOrder: string[];
  success: boolean;
}

export interface GameState {
  roomCode: string;
  roomPhase: RoomPhase;
  players: PlayerInGameInfo[];
  roundHostId?: string;
  currentTurnPlayerId?: string;
  boardOrder: string[];
  myCardNumber?: number;
  myTheme?: string;
  chatMessages: ChatMessage[];
  revealResult?: RevealResult;
  error?: string;
  promptSubmittedCount?: number;
  promptTotalCount?: number;
  imageGeneratedCount?: number;
  imageTotalCount?: number;
  paused: boolean;
  aborted?: string;
  currentRound?: number;
  totalRounds?: number;
}

export interface PhaseProps {
  state: GameState;
  myId: string;
  emit: (event: string, payload?: unknown) => void;
}

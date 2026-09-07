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

export type PlayerPhase = 'INPUT' | 'DONE';

/** ACTIVE: 接続中 / DISCONNECTED: 切断中でホストの対応待ち / EXCLUDED: 除外済み */
export type PlayerStatus = 'ACTIVE' | 'DISCONNECTED' | 'EXCLUDED';

export interface PlayerInGameInfo {
  id: string;
  name: string;
  isRoomOwner: boolean;
  playerPhase?: PlayerPhase;
  hasSubmittedPrompt: boolean;
  imageUrl?: string;
  prompt?: string;
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
  /** エラーではない一時的な通知（プレイヤーの復帰など） */
  notice?: string;
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

// ===== サーバ → クライアントのイベントペイロード =====
//
// backend/src/ito/ito.events.ts の「ペイロード型（Server → Client）」と対になる。
// WebSocket にはRESTのような型の同期機構が無く、片方だけ変えても TypeScript は
// 何も言わずに undefined を読むだけになるので、必ず両方を揃えて変更すること。

export interface RoomStatePayload {
  roomCode: string;
  roomPhase: RoomPhase;
  players: PlayerInGameInfo[];
  roundHostId?: string;
  currentTurnPlayerId?: string;
  /** SPEAKINGフェーズ以降のみ送られる */
  boardOrder?: string[];
  paused: boolean;
  currentRound?: number;
  totalRounds?: number;
}

/** 再接続した本人にのみ送られる、完全な状態復元用ペイロード */
export interface ResyncStatePayload extends RoomStatePayload {
  theme: string;
  totalRounds: number;
  currentRound: number;
  turnOrder: string[];
  messages: ChatMessage[];
  /** 本人のみに送られる */
  myCardNumber?: number;
  /** 直近ラウンドの公開結果。ROUND_RESULT/GAME_OVER中に復帰した人の結果画面を復元する */
  lastReveal?: RevealResult;
}

export interface PhaseChangePayload {
  roomPhase: RoomPhase;
  turnOrder?: string[];
  roundHostId?: string;
  confirmedOrder?: string[];
}

export interface PlayerPhaseChangePayload {
  playerId: string;
  playerPhase: PlayerPhase;
}

export interface DealtCardPayload {
  cardNumber: number;
  theme: string;
}

export interface PromptSubmittedPayload {
  submittedCount: number;
  totalCount: number;
}

export interface ImageGeneratedPayload {
  playerId: string;
  imageUrl: string;
  generatedCount: number;
  totalCount: number;
}

export interface CardPlacedPayload {
  playerId: string;
  boardOrder: string[];
}

export interface TurnChangedPayload {
  currentTurnPlayerId: string;
}

export interface OrderChangedPayload {
  orderedPlayerIds: string[];
}

/** ito:chatMessage は ChatMessage をそのまま流す */
export type ChatMessagePayload = ChatMessage;

/**
 * ito:cardsRevealed。RevealResult と同じ形だが、
 * page.tsx では同名のフェーズコンポーネントと衝突するのでこの別名で受ける。
 */
export type CardsRevealedPayload = RevealResult;

export interface PlayerReconnectedPayload {
  playerId: string;
  playerName: string;
}

export interface GameAbortedPayload {
  reason: string;
}

/** ito:error。バックエンドは常に message を入れて送る */
export interface ErrorPayload {
  message: string;
}

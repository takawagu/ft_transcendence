// ===== フェーズ型 =====

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

// ===== 共通型 =====

export interface PlayerInfo {
  id: string;
  name: string;
  isRoomOwner: boolean;
}

export interface PlayerInGameInfo extends PlayerInfo {
  playerPhase?: PlayerPhase; // INPUT_GENERATING中のみ有効
  hasSubmittedPrompt: boolean; // 他プレイヤーから見える（プロンプト内容は非公開）
  imageUrl?: string; // SPEAKING以降で全員に公開
}

// ===== イベント名定数 =====

export const ITO_EVENTS = {
  // ---------- Client → Server ----------

  /** 新しいルームを作成する */
  CREATE_ROOM: 'ito:createRoom',

  /** ルームに参加する（ルームコード指定） */
  JOIN_ROOM: 'ito:joinRoom',

  /** ルームから退出する */
  LEAVE_ROOM: 'ito:leaveRoom',

  /** ルームを解散する（ルームオーナーのみ） */
  DISSOLVE_ROOM: 'ito:dissolveRoom',

  /** メンバーを確定してお題設定フェーズへ進む（ルームオーナーのみ） */
  CONFIRM_MEMBERS: 'ito:confirmMembers',

  /** お題を確定してゲームを開始する（ルームオーナーのみ） */
  START_GAME: 'ito:startGame',

  /** プロンプトを送信する（INPUT_GENERATING / INPUTフェーズ） */
  SUBMIT_PROMPT: 'ito:submitPrompt',

  /** 自分のカードを場に配置する（SPEAKINGフェーズ / 自分のターンのみ） */
  PLACE_CARD: 'ito:placeCard',

  /** 並び順を変更する（ORDERINGフェーズ / ラウンドホストのみ） */
  REORDER_CARDS: 'ito:reorderCards',

  /** 並び順を確定する（ORDERINGフェーズ / ラウンドホストのみ） */
  CONFIRM_ORDER: 'ito:confirmOrder',

  /** チャットメッセージを送信する（ORDERINGフェーズのみ） */
  SEND_CHAT: 'ito:sendChat',

  // ---------- Server → Client ----------

  /** ルームの現在状態を送信（参加時の初期同期） */
  ROOM_STATE: 'ito:roomState',

  /** ルームフェーズが切り替わった */
  PHASE_CHANGE: 'ito:phaseChange',

  /** プレイヤー個別フェーズが切り替わった（INPUT_GENERATING中のみ） */
  PLAYER_PHASE_CHANGE: 'ito:playerPhaseChange',

  /** 自分のカード番号とお題を受け取る（本人のみ / DEALINGフェーズ） */
  DEALT_CARD: 'ito:dealtCard',

  /** 誰かがプロンプトを送信した（内容は非公開、人数のみ通知） */
  PROMPT_SUBMITTED: 'ito:promptSubmitted',

  /** 1人分の画像生成が完了した */
  IMAGE_GENERATED: 'ito:imageGenerated',

  /** 誰かが場にカードを配置した（SPEAKINGフェーズ） */
  CARD_PLACED: 'ito:cardPlaced',

  /** ターンが変わった（SPEAKINGフェーズ） */
  TURN_CHANGED: 'ito:turnChanged',

  /** ORDERINGフェーズでホストが並び順を変更した（リアルタイム反映） */
  ORDER_CHANGED: 'ito:orderChanged',

  /** チャットメッセージを受信した（ORDERINGフェーズ） */
  CHAT_MESSAGE: 'ito:chatMessage',

  /** カードを一斉公開（REVEALフェーズ） */
  CARDS_REVEALED: 'ito:cardsRevealed',

  /** ルームが解散された（全員にブロードキャスト） */
  ROOM_DISSOLVED: 'ito:roomDissolved',
} as const;

// ===== ペイロード型（Client → Server） =====

export class CreateRoomPayload {
  playerName: string;
}

export class JoinRoomPayload {
  roomCode: string;
  playerName: string;
}

export class StartGamePayload {
  theme: string;
  totalRounds: number;
}

export class SubmitPromptPayload {
  prompt: string;
}

export class PlaceCardPayload {
  position: number;
}

export class ReorderCardsPayload {
  orderedPlayerIds: string[];
}

export class SendChatPayload {
  message: string;
}

// ===== ペイロード型（Server → Client） =====

export interface RoomStatePayload {
  roomCode: string;
  roomPhase: RoomPhase;
  players: PlayerInGameInfo[];
  roundHostId?: string;
  currentTurnPlayerId?: string;
  boardOrder?: string[]; // 場のプレイヤーID順（SPEAKINGフェーズ以降）
}

export interface PhaseChangePayload {
  roomPhase: RoomPhase;
  /** SPEAKINGへの遷移時: ターン順とラウンドホスト */
  turnOrder?: string[];
  roundHostId?: string;
  /** REVEALへの遷移時: 確定した並び順 */
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
  boardOrder: string[]; // 更新後の場の並び順（プレイヤーID）
}

export interface TurnChangedPayload {
  currentTurnPlayerId: string;
}

export interface OrderChangedPayload {
  orderedPlayerIds: string[];
}

export interface ChatMessagePayload {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

export interface CardsRevealedPayload {
  revealedCards: { playerId: string; cardNumber: number }[];
  submittedOrder: string[]; // 提出した並び順（プレイヤーID）
  correctOrder: string[]; // 正解の並び順（プレイヤーID）
  success: boolean;
}

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

/**
 * プレイヤーの参加状態。
 * - ACTIVE: 接続中で通常どおりプレイ可能
 * - DISCONNECTED: 切断中。席は保持され、ホストの対応待ちでゲームはポーズする
 * - EXCLUDED: ホストの判断でゲームから除外済み。人数・進捗の集計対象外
 */
export type PlayerStatus = 'ACTIVE' | 'DISCONNECTED' | 'EXCLUDED';

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
  status: PlayerStatus;
  /** ホストが「復帰を待つ」を明示選択済み。表示専用でゲームロジックは参照しない */
  awaitingReturn: boolean;
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

  /** 次のラウンドへ進む（ROUND_RESULTフェーズ / ルームオーナーのみ） */
  NEXT_ROUND: 'ito:nextRound',

  /** ゲームを終了して最終リザルトへ進む（ROUND_RESULTフェーズ / ルームオーナーのみ） */
  END_GAME: 'ito:endGame',

  /** 切断済みプレイヤーとして同一playerIdで再接続する */
  REJOIN: 'ito:rejoin',

  /** 切断中のプレイヤーを除外してゲームを続行する（ルームオーナーのみ） */
  EXCLUDE_PLAYER: 'ito:excludePlayer',

  /** 切断中のプレイヤーの復帰を待つと宣言する（ルームオーナーのみ） */
  AWAIT_RETURN: 'ito:awaitReturn',

  /** ゲームを中断して終了する（ルームオーナーのみ） */
  ABORT_GAME: 'ito:abortGame',

  /** 一時停止を解除してゲームを再開する（ルームオーナーのみ） */
  RESUME_GAME: 'ito:resumeGame',

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

  /** 誰かが切断し、ゲームが一時停止した */
  GAME_PAUSED: 'ito:gamePaused',

  /** ホストの操作で一時停止が解除された */
  GAME_RESUMED: 'ito:gameResumed',

  /** 切断していたプレイヤーが再接続した */
  PLAYER_RECONNECTED: 'ito:playerReconnected',

  /** ゲームが中断され終了した */
  GAME_ABORTED: 'ito:gameAborted',

  /** 再接続した本人にのみ送る、完全な状態復元用ペイロード */
  RESYNC_STATE: 'ito:resyncState',
} as const;

// ===== ペイロード型（Client → Server） =====

export class CreateRoomPayload {
  playerName: string;
  playerId: string;
  totalRounds?: number;
}

export class JoinRoomPayload {
  roomCode: string;
  playerName: string;
  playerId: string;
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

export class RejoinPayload {
  roomCode: string;
  playerId: string;
}

export class ExcludePlayerPayload {
  playerId: string;
}

export class AwaitReturnPayload {
  playerId: string;
}

// ===== ペイロード型（Server → Client） =====

export interface RoomStatePayload {
  roomCode: string;
  roomPhase: RoomPhase;
  players: PlayerInGameInfo[];
  roundHostId?: string;
  currentTurnPlayerId?: string;
  boardOrder?: string[]; // 場のプレイヤーID順（SPEAKINGフェーズ以降）
  paused: boolean;
  currentRound?: number;
  totalRounds?: number;
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

export interface GamePausedPayload {
  disconnectedPlayerId: string;
  disconnectedPlayerName: string;
}

export interface PlayerReconnectedPayload {
  playerId: string;
  playerName: string;
}

export interface GameAbortedPayload {
  reason: string;
}

export interface ResyncStatePayload extends RoomStatePayload {
  theme: string;
  totalRounds: number;
  currentRound: number;
  turnOrder: string[];
  messages: ChatMessagePayload[];
  myCardNumber?: number; // 本人のみに送る
}

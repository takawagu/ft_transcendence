/**
 * `/presence` 名前空間のイベント定義。
 * オンライン状態の配信に加え、フレンド申請の通知経路も兼ねる。
 * 詳細は docs/friend-requirements.md セクション4・5。
 */

/** 通知ペイロードに載せるユーザー情報。emailは含めない */
export interface PublicUser {
  id: number;
  username: string;
  bio: string | null;
  profileImage: string | null;
}

export const PRESENCE_EVENTS = {
  // ---------- Server → Client ----------
  // クライアントは接続を維持するだけでよく、C→Sのイベントは無い

  /** 接続認証の直後に1回だけ送る、オンライン中のフレンド一覧 */
  SNAPSHOT: 'presence:snapshot',

  /** フレンドの在席が変化した時 */
  CHANGED: 'presence:changed',

  /** フレンド申請を受け取った時 */
  FRIEND_REQUEST_RECEIVED: 'friend:requestReceived',

  /** 自分が送った申請が承認された時 */
  FRIEND_ACCEPTED: 'friend:accepted',

  /** DMが作成された時。受信者と送信者の両方に送る（別タブの同期のため） */
  DM_RECEIVED: 'dm:received',

  /** 会話を既読にした時。本人の全タブへ送り、未読バッジを揃える */
  DM_READ: 'dm:read',

  /** 相手が自分のメッセージを既読にした時。送信者へ送り、既読表示を更新する */
  DM_READ_RECEIPT: 'dm:readReceipt',

  /** メッセージ入力中状態の変化 */
  DM_TYPING: 'dm:typing',

  /** ブロックやフレンド解除等により未読バッジを消去させる時 */
  DM_CLEAR_UNREAD: 'dm:clearUnread',
} as const;

/**
 * 接続を拒否した理由。socket.ioのミドルウェアがErrorのmessageとして返し、
 * クライアントには connect_error の err.message として届く。
 * フロント側（frontend/src/lib/presence.tsx）に同じ文字列がある。
 */
export const PRESENCE_CONNECT_ERRORS = {
  /** トークンが無い・不正・期限切れ */
  UNAUTHORIZED: 'UNAUTHORIZED',
  /** 同じアカウントが既に別のタブ／端末で接続している */
  DUPLICATE_SESSION: 'DUPLICATE_SESSION',
} as const;

export interface PresenceSnapshotPayload {
  onlineFriendIds: number[];
}

export interface PresenceChangedPayload {
  userId: number;
  online: boolean;
}

export interface FriendRequestReceivedPayload {
  friendshipId: number;
  user: PublicUser;
}

export interface FriendAcceptedPayload {
  user: PublicUser;
}

export interface DmReceivedPayload {
  message: {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    createdAt: Date;
    /** TEXT | ROOM_INVITE。招待も同じイベントで流す（docs/room-invite-requirements.md セクション2） */
    type: string;
    /** type = 'ROOM_INVITE' のときだけ入る招待先のルームコード */
    roomCode: string | null;
  };
  /** 会話の相手。受信者には送信者、送信者には受信者が入る */
  user: PublicUser;
}

export interface DmReadPayload {
  /** 既読にした会話の相手 */
  userId: number;
  lastReadMessageId: number;
}

export interface DmReadReceiptPayload {
  /** メッセージを読んだ相手（相手目線での自分） */
  userId: number;
  lastReadMessageId: number;
}

export interface DmTypingPayload {
  /** 入力状態が変化した相手 */
  userId: number;
  isTyping: boolean;
}

export interface DmClearUnreadPayload {
  /** 未読バッジを消去する相手 */
  userId: number;
}

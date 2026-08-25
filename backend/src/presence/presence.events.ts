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
  };
  /** 会話の相手。受信者には送信者、送信者には受信者が入る */
  user: PublicUser;
}

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession, type User } from './session';

/** nginxが同一オリジンで配信するため通常は空。itoルーム側と同じ扱い */
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? '';

/** DateはJSONを経由するとISO文字列になるため string で受ける */
export interface DirectMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
}

/**
 * サーバーが `/presence` へ流すイベント。
 * backend/src/presence/presence.events.ts と対応させる。
 */
export interface PresenceEventPayloads {
  'presence:snapshot': { onlineFriendIds: number[] };
  'presence:changed': { userId: number; online: boolean };
  'friend:requestReceived': { friendshipId: number; user: User };
  'friend:accepted': { user: User };
  /** user は会話の相手。受信者には送信者、送信者には受信者が入る */
  'dm:received': { message: DirectMessage; user: User };
}

export type PresenceEventName = keyof PresenceEventPayloads;

const PRESENCE_EVENT_NAMES: PresenceEventName[] = [
  'presence:snapshot',
  'presence:changed',
  'friend:requestReceived',
  'friend:accepted',
  'dm:received',
];

type Handler = (payload: any) => void;

interface PresenceContextValue {
  /** オンライン中のフレンドのID。未ログイン時は空 */
  onlineFriendIds: Set<number>;
  /**
   * 未読のDMが届いている相手のID。
   * DBに既読列を持たないため、この情報はリロードで消える
   * （docs/dm-requirements.md セクション1・4）。
   */
  unreadSenderIds: Set<number>;
  /** その相手との会話を開いた時に呼ぶ。未読から外す */
  markConversationRead: (userId: number) => void;
  /** サーバーイベントの購読。戻り値の関数を呼ぶと解除する */
  subscribe: <E extends PresenceEventName>(
    event: E,
    handler: (payload: PresenceEventPayloads[E]) => void,
  ) => () => void;
}

const PresenceContext = createContext<PresenceContextValue | null>(null);

export function usePresence(): PresenceContextValue {
  const ctx = useContext(PresenceContext);
  if (!ctx) {
    throw new Error('usePresence は PresenceProvider の内側でのみ使えます');
  }
  return ctx;
}

/**
 * オンライン状態・フレンド申請通知・DM配信を受け取る `/presence` 接続。
 *
 * ページごとに張るとホーム↔itoルーム↔/messages の遷移のたびに切断・再接続が起き、
 * ゲーム中のユーザーがフレンドからオフラインに見えてしまう。
 * そのため layout に置き、ログイン中は接続を1本だけ維持する。
 * itoルームの `/ito` とは名前空間が違うので、2本が並存しても競合しない。
 */
export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { token } = useSession();
  const [onlineFriendIds, setOnlineFriendIds] = useState<Set<number>>(new Set());
  const [unreadSenderIds, setUnreadSenderIds] = useState<Set<number>>(new Set());

  const markConversationRead = useCallback((userId: number) => {
    setUnreadSenderIds(prev => {
      if (!prev.has(userId)) return prev;
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  }, []);

  /**
   * 購読者一覧。socket本体はトークン変化時に張り直すが、
   * 購読者はそれとは無関係に残るのでソケット側ではなくここに持つ。
   */
  const handlersRef = useRef<Map<PresenceEventName, Set<Handler>>>(new Map());

  const subscribe = useCallback(
    <E extends PresenceEventName>(
      event: E,
      handler: (payload: PresenceEventPayloads[E]) => void,
    ) => {
      const map = handlersRef.current;
      let set = map.get(event);
      if (!set) {
        set = new Set();
        map.set(event, set);
      }
      set.add(handler as Handler);
      return () => {
        set!.delete(handler as Handler);
      };
    },
    [],
  );

  useEffect(() => {
    if (!token) {
      setOnlineFriendIds(new Set());
      setUnreadSenderIds(new Set());
      return;
    }

    const socket: Socket = io(`${WS_URL}/presence`, { auth: { token } });

    // 在席状態だけは Provider 自身が state として持つ（各ページが同じ集計をしないで済むように）
    socket.on('presence:snapshot', (p: PresenceEventPayloads['presence:snapshot']) => {
      setOnlineFriendIds(new Set(p.onlineFriendIds));
    });

    socket.on('presence:changed', (p: PresenceEventPayloads['presence:changed']) => {
      setOnlineFriendIds(prev => {
        const next = new Set(prev);
        if (p.online) next.add(p.userId);
        else next.delete(p.userId);
        return next;
      });
    });

    /*
     * 未読は購読者より先に立てる。
     * `dm:received` は送信者本人にも届く（別タブ同期のため）ので、
     * 差出人が「会話の相手」と一致する時だけ＝受信した時だけ未読にする。
     * 会話を開いているページが直後の中継で markConversationRead を呼んで取り消す。
     */
    socket.on('dm:received', (p: PresenceEventPayloads['dm:received']) => {
      if (p.message.senderId !== p.user.id) return;
      setUnreadSenderIds(prev => new Set(prev).add(p.user.id));
    });

    // 全イベントを購読者へ中継する。何に反応するかは各ページ側の判断に委ねる
    for (const event of PRESENCE_EVENT_NAMES) {
      socket.on(event, (payload: unknown) => {
        handlersRef.current.get(event)?.forEach(handler => handler(payload));
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return (
    <PresenceContext.Provider
      value={{ onlineFriendIds, unreadSenderIds, markConversationRead, subscribe }}
    >
      {children}
    </PresenceContext.Provider>
  );
}

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
  /** ROOM_INVITE はitoルームへの招待。バックエンドの DirectMessage.type と対応する */
  type: 'TEXT' | 'ROOM_INVITE';
  /** ROOM_INVITE のときのみ入る */
  roomCode?: string | null;
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
  /** 自分が別タブで会話を既読にした時、または相手がメッセージを読んだ時 */
  'dm:read': { userId: number; lastReadMessageId: number };
  /** 相手の入力状態が変化した時 */
  'dm:typing': { userId: number; isTyping: boolean };
}

export type PresenceEventName = keyof PresenceEventPayloads;

const PRESENCE_EVENT_NAMES: PresenceEventName[] = [
  'presence:snapshot',
  'presence:changed',
  'friend:requestReceived',
  'friend:accepted',
  'dm:received',
  'dm:read',
  'dm:typing',
];

type Handler = (payload: any) => void;

interface PresenceContextValue {
  /** オンライン中のフレンドのID。未ログイン時は空 */
  onlineFriendIds: Set<number>;
  /**
   * 相手のID → その相手からの未読件数。
   * 「誰から何件見逃しているか」を出せるよう、有無ではなく件数で持つ。
   * 初期値はサーバーの既読カーソルから取得するので、リロードしても残る
   * （docs/dm-requirements.md セクション4）。
   */
  unreadCounts: Map<number, number>;
  /**
   * その相手との会話を lastMessageId まで読んだことにする。
   * 表示は即座に消し、サーバーへも記録する。
   */
  markConversationRead: (userId: number, lastMessageId: number) => void;
  /** 相手への入力中状態の送信 */
  sendTyping: (toUserId: number, isTyping: boolean) => void;
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
  const { token, apiCall, logout } = useSession();
  const [onlineFriendIds, setOnlineFriendIds] = useState<Set<number>>(new Set());
  const [unreadCounts, setUnreadCounts] = useState<Map<number, number>>(new Map());
  /** 同一アカウントが既に別のタブ／端末で開いていて、接続を拒否された */
  const [duplicateSession, setDuplicateSession] = useState(false);

  /**
   * 初期取得（/api/messages/unread）の応答待ちの間に既読にした相手。
   * 応答が後から届いて未読を復活させてしまうのを防ぐために覚えておく。
   * 取得していない間は null。
   */
  const clearedWhileFetchingRef = useRef<Set<number> | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const sendTyping = useCallback((toUserId: number, isTyping: boolean) => {
    socketRef.current?.emit('dm:typing', { toUserId, isTyping });
  }, []);

  /** サーバーへの記録を待たずにバッジを消す（往復を待つとタップの手応えが鈍るため） */
  const clearUnreadLocally = useCallback((userId: number) => {
    clearedWhileFetchingRef.current?.add(userId);
    setUnreadCounts(prev => {
      if (!prev.has(userId)) return prev;
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
  }, []);

  const markConversationRead = useCallback(
    (userId: number, lastMessageId: number) => {
      clearUnreadLocally(userId);
      // 失敗しても画面は既読のまま。次回の取得でサーバーの値に戻るだけなので握りつぶす
      apiCall('/api/messages/read', 'POST', { userId, lastMessageId }).catch(
        () => {},
      );
    },
    [apiCall, clearUnreadLocally],
  );

  /*
   * ログイン時と再ログイン時に、サーバーの既読カーソルから未読件数を取り直す。
   *
   * この応答は、/messages を直接開いた時に「履歴取得 → 既読POST」と競合する。
   * 素直に上書きすると、既読にしたばかりの相手の未読が復活してしまうため、
   * 取得中に既読にした相手は結果から取り除く。
   */
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const clearedDuringFetch = new Set<number>();
    clearedWhileFetchingRef.current = clearedDuringFetch;

    apiCall('/api/messages/unread')
      .then((rows: { userId: number; count: number }[]) => {
        if (cancelled) return;
        setUnreadCounts(
          new Map(
            rows
              .filter(r => !clearedDuringFetch.has(r.userId))
              .map(r => [r.userId, r.count]),
          ),
        );
      })
      .catch(() => {})
      .finally(() => {
        if (clearedWhileFetchingRef.current === clearedDuringFetch) {
          clearedWhileFetchingRef.current = null;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, apiCall]);

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
      setUnreadCounts(new Map());
      return;
    }

    const socket: Socket = io(`${WS_URL}/presence`, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => setDuplicateSession(false));

    /*
     * サーバのミドルウェアが接続を拒否した理由が message に入る。
     * 文字列は backend/src/presence/presence.events.ts の PRESENCE_CONNECT_ERRORS と対応。
     * ミドルウェア起因のエラーなので socket.io は自動再接続しない（拒否したまま止まる）。
     */
    socket.on('connect_error', (err: Error) => {
      if (err.message === 'DUPLICATE_SESSION') setDuplicateSession(true);
    });

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
      setUnreadCounts(prev => {
        const next = new Map(prev);
        next.set(p.user.id, (next.get(p.user.id) ?? 0) + 1);
        return next;
      });
    });

    // 別タブで既読にした分をこのタブにも反映する
    socket.on('dm:read', (p: PresenceEventPayloads['dm:read']) => {
      clearUnreadLocally(p.userId);
    });

    // 全イベントを購読者へ中継する。何に反応するかは各ページ側の判断に委ねる
    for (const event of PRESENCE_EVENT_NAMES) {
      socket.on(event, (payload: unknown) => {
        handlersRef.current.get(event)?.forEach(handler => handler(payload));
      });
    }

    return () => {
      socketRef.current = null;
      socket.disconnect();
    };
  }, [token, clearUnreadLocally]);

  return (
    <PresenceContext.Provider
      value={{ onlineFriendIds, unreadCounts, markConversationRead, sendTyping, subscribe }}
    >
      {children}
      {duplicateSession && <DuplicateSessionBlock onLogout={logout} />}
    </PresenceContext.Provider>
  );
}

/**
 * 同一アカウントが既に別の場所で開いているときの全画面ブロック。
 * layout直下に置くProviderから出すので、itoルームを含むどの画面の上にも被さる。
 */
function DuplicateSessionBlock({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-zinc-800 rounded-2xl p-10 flex flex-col items-center gap-5 shadow-2xl max-w-md text-center">
        <p className="text-xl font-bold text-white">
          このアカウントは別のタブまたは端末で開いています
        </p>
        <p className="text-zinc-400 text-sm">
          同時に使えるのは1つまでです。先に開いている方を閉じてから、再読み込みしてください。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            再読み込み
          </button>
          <button
            onClick={onLogout}
            className="rounded-lg bg-zinc-700 px-6 py-2 font-semibold text-zinc-200 hover:bg-zinc-600 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}

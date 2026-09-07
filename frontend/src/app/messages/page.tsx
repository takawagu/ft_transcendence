'use client';

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, type User } from '@/lib/session';
import { errorMessage } from '@/lib/error-message';
import { usePresence, type DirectMessage } from '@/lib/presence';
import { renderAvatar } from '@/lib/avatar';
import { isInviteExpired, joinInvitedRoom } from '@/lib/room-invite';
import { FriendInfoWindow } from '@/lib/friend-info';

/** 本文の上限。SendMessageDto の @MaxLength と揃える */
const MESSAGE_MAX_LENGTH = 1000;

/** 1回に読む履歴の件数。HistoryQueryDto の @Max(100) 以下であること */
const HISTORY_PAGE_SIZE = 50;

/** 残り何文字から文字数表示を出すか。常に出すと普段の入力の邪魔になる */
const COUNTER_VISIBLE_FROM = 100;

/** GET /api/messages/conversations の1件 */
interface Conversation {
  userId: number;
  content: string;
  createdAt: string;
  senderId: number;
}

/** 会話一覧の1行。メッセージがまだ無いフレンドは lastMessage が null */
interface ConversationRow {
  friend: User;
  lastMessage: Conversation | null;
}

/**
 * GET /api/messages/:userId のレスポンス。
 * 現行のバックエンドは必ずオブジェクトで返すが、配列を返していた頃の形も
 * 受け取れるようにしてある（呼び出し側の Array.isArray 分岐と対応）。
 */
type HistoryResponse =
  | DirectMessage[]
  | { messages: DirectMessage[]; partnerLastReadMessageId: number };

function formatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  if (sameDay) return `${hh}:${mm}`;
  return `${date.getMonth() + 1}/${date.getDate()} ${hh}:${mm}`;
}

/**
 * スレッド内のルーム招待（docs/room-invite-requirements.md セクション4-c）。
 * 自分が送った招待も同じカードで描く。ただし自分は既にその部屋に居るので参加ボタンは出さない。
 */
function RoomInviteCard({
  roomCode,
  mine,
  expired,
  onJoin,
}: {
  roomCode: string;
  mine: boolean;
  expired: boolean;
  onJoin: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border px-3 py-2.5 ${
        expired
          ? 'border-zinc-700 bg-zinc-900/60'
          : 'border-indigo-800/60 bg-indigo-950/40'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-sm">🎮</span>
        <span className="text-[11px] font-bold text-zinc-200">
          ゲームルームへの招待
        </span>
        {expired && (
          <span className="text-[9px] font-bold text-zinc-500 border border-zinc-700 rounded-full px-1.5 py-0.5">
            期限切れ
          </span>
        )}
      </div>

      <p
        className={`mt-1.5 text-center font-mono text-base font-bold tracking-widest ${
          expired ? 'text-zinc-600' : 'text-indigo-300'
        }`}
      >
        {roomCode}
      </p>

      {mine ? (
        <p className="mt-1.5 text-center text-[10px] text-zinc-500">
          招待を送信しました
        </p>
      ) : (
        <button
          onClick={onJoin}
          disabled={expired}
          className="mt-2 w-full rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          参加
        </button>
      )}
    </div>
  );
}

function MessagesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mounted, token, user, apiCall } = useSession();
  const { onlineFriendIds, unreadCounts, subscribe, markConversationRead, sendTyping } = usePresence();

  const [friends, setFriends] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [listLoading, setListLoading] = useState(true);

  /**
   * ユーザーが明示的に選んだ会話。null は「まだ何も選んでいない」で、
   * その間だけ ?to= の指定が効く（{ id: null } は「閉じた」を表す）。
   */
  const [picked, setPicked] = useState<{ id: number | null } | null>(null);

  /*
   * 開いている会話。?to=<userId> が指す相手だけを自動で開く。
   * 指定が無い時は何も開かない（ヘッダーのボタンからは一覧を見せたいため。
   * 直近の会話を勝手に開くと、狭い画面ではその会話画面に着地してしまう）。
   *
   * effect で選択 state を書くのではなく導出する。picked が null の間だけ
   * ?to= に従い、一度でも選んだ（閉じたのも選択のうち）ら以降は選択が優先される。
   */
  const toParam = Number(searchParams.get('to'));
  const selectedId = picked
    ? picked.id
    : !listLoading && toParam && friends.some(f => f.id === toParam)
      ? toParam
      : null;
  const setSelectedId = (id: number | null) => setPicked({ id });

  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  /** 相手がどこまで読んだか（既読判定用） */
  const [partnerLastReadMessageId, setPartnerLastReadMessageId] = useState<number>(0);
  /** 相手が入力中かどうか */
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  const [draft, setDraft] = useState('');
  const [sendError, setSendError] = useState('');

  /** プロフィールウィンドウの対象。null なら非表示 */
  const [infoTarget, setInfoTarget] = useState<User | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  /** dm:received のハンドラから現在開いている会話を参照するため */
  const selectedIdRef = useRef<number | null>(null);
  /** 末尾が変わった時だけ最下部へ追従するための記録。過去読み足し（先頭への追加）では動かさない */
  const lastMessageIdRef = useRef<number | null>(null);
  /** 過去を読み足した直後にスクロール位置を戻すための、読み足す前の高さ */
  const restoreHeightRef = useRef<number | null>(null);
  /** 相手の入力中表示を一定時間後に解除するタイマー */
  const partnerTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  /** 自分の入力中通知を一定時間後に止めるタイマー */
  const myTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // 未ログインならホームへ戻す
  useEffect(() => {
    if (mounted && !token) router.replace('/');
  }, [mounted, token, router]);

  // フレンドと会話一覧
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const [friendsList, conversationList] = await Promise.all([
          apiCall<User[]>('/api/friends'),
          apiCall<Conversation[]>('/api/messages/conversations'),
        ]);
        if (cancelled) return;
        setFriends(friendsList || []);
        setConversations(conversationList || []);
      } catch {
        if (!cancelled) {
          setFriends([]);
          setConversations([]);
        }
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, apiCall]);

  /*
   * 会話一覧の行。
   * conversations には「フレンドを解除した相手との過去の会話」も含まれうるが、
   * 履歴取得が403になるので friends に含まれるものだけを出す
   * （docs/dm-requirements.md セクション3）。
   */
  const friendMap = new Map(friends.map(f => [f.id, f]));
  const rows: ConversationRow[] = [
    ...conversations
      .filter(c => friendMap.has(c.userId))
      .map(c => ({ friend: friendMap.get(c.userId)!, lastMessage: c })),
    ...friends
      .filter(f => !conversations.some(c => c.userId === f.id))
      .map(f => ({ friend: f, lastMessage: null })),
  ];

  /*
   * 選んだ相手の履歴。
   * 会話を切り替えた／閉じたときは、前の相手のメッセージ・既読位置・入力中表示を
   * 引き継がないよう明示的に消す。
   *
   * ルールが想定する書き方は「会話ペインを子コンポーネントに切り出して
   * key={selectedId} で作り直す」だが、この画面では dm:received / dm:read / dm:typing の
   * 購読も同じコンポーネントに同居しており、それらを丸ごと子へ移す必要がある。
   * DMの中核の作り直しになるので、ここでは明示的なリセットのままにしている。
   */
  useEffect(() => {
    if (!token || selectedId === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([]);
      setPartnerLastReadMessageId(0);
      setIsPartnerTyping(false);
      return;
    }
    let cancelled = false;
    setHistoryLoading(true);
    setSendError('');
    setIsPartnerTyping(false);
    (async () => {
      try {
        const res = await apiCall<HistoryResponse>(
          `/api/messages/${selectedId}?limit=${HISTORY_PAGE_SIZE}`,
        );
        if (cancelled) return;
        const history: DirectMessage[] = Array.isArray(res) ? res : res.messages;
        setMessages(history || []);
        setHasMore((history?.length ?? 0) === HISTORY_PAGE_SIZE);
        if (!Array.isArray(res) && res.partnerLastReadMessageId !== undefined) {
          setPartnerLastReadMessageId(res.partnerLastReadMessageId);
        }
        // 既読は履歴が取れてから打つ。どこまで読んだかを表すIDが要るため
        const last = history?.[history.length - 1];
        if (last) markConversationRead(selectedId, last.id);
      } catch (err) {
        if (cancelled) return;
        setMessages([]);
        setHasMore(false);
        setSendError(errorMessage(err, '履歴を取得できませんでした。'));
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, selectedId, apiCall, markConversationRead]);

  // リアルタイム受信 (dm:received, dm:read, dm:typing)
  useEffect(() => {
    if (!token) return;
    const unsubReceived = subscribe('dm:received', ({ message, user: partner }) => {
      setConversations(prev => [
        {
          userId: partner.id,
          content: message.content,
          createdAt: message.createdAt,
          senderId: message.senderId,
        },
        ...prev.filter(c => c.userId !== partner.id),
      ]);

      if (selectedIdRef.current !== partner.id) return;
      // 開いている会話に届いた分はその場で既読にする
      markConversationRead(partner.id, message.id);
      // 自分の送信は POST の応答で既に足しているので、idで重複を弾く
      setMessages(prev =>
        prev.some(m => m.id === message.id) ? prev : [...prev, message],
      );
    });

    const unsubRead = subscribe('dm:read', ({ userId, lastReadMessageId }) => {
      // 相手がこちらのメッセージを読んだ時、既読カーソルを更新
      if (selectedIdRef.current === userId) {
        setPartnerLastReadMessageId(prev => Math.max(prev, lastReadMessageId));
      }
    });

    const unsubTyping = subscribe('dm:typing', ({ userId, isTyping }) => {
      if (selectedIdRef.current === userId) {
        if (isTyping) {
          setIsPartnerTyping(true);
          if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
          partnerTypingTimeoutRef.current = setTimeout(() => {
            setIsPartnerTyping(false);
          }, 4000);
        } else {
          setIsPartnerTyping(false);
          if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
        }
      }
    });

    return () => {
      unsubReceived();
      unsubRead();
      unsubTyping();
    };
  }, [token, subscribe, markConversationRead]);

  // 過去の読み足しでは、増えた分だけ下へずらして見えている位置を保つ
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && restoreHeightRef.current !== null) {
      el.scrollTop = el.scrollHeight - restoreHeightRef.current;
      restoreHeightRef.current = null;
    }
  }, [messages]);

  /*
   * 末尾のメッセージが変わった時だけ最下部へ追従する。
   * 「メッセージが増えたら」にすると、上に読み足した時まで最下部へ飛んでしまう。
   */
  useEffect(() => {
    const lastId = messages.length > 0 ? messages[messages.length - 1].id : null;
    if (lastId === lastMessageIdRef.current && !isPartnerTyping) return;
    lastMessageIdRef.current = lastId;
    scrollToBottom();
  }, [messages, isPartnerTyping, scrollToBottom]);

  /** 上端に達したら過去を読み足す */
  const handleScroll = async () => {
    const el = scrollRef.current;
    if (!el || el.scrollTop > 0) return;
    if (!hasMore || loadingMore || historyLoading || messages.length === 0) return;

    setLoadingMore(true);
    restoreHeightRef.current = el.scrollHeight;
    try {
      const res = await apiCall<HistoryResponse>(
        `/api/messages/${selectedId}?before=${messages[0].id}&limit=${HISTORY_PAGE_SIZE}`,
      );
      const older: DirectMessage[] = Array.isArray(res) ? res : res.messages;
      setMessages(prev => [...(older || []), ...prev]);
      setHasMore((older?.length ?? 0) === HISTORY_PAGE_SIZE);
      if (!Array.isArray(res) && res.partnerLastReadMessageId !== undefined) {
        setPartnerLastReadMessageId(prev => Math.max(prev, res.partnerLastReadMessageId));
      }
    } catch {
      restoreHeightRef.current = null;
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDraft(value);
    if (selectedId) {
      if (value.trim()) {
        sendTyping(selectedId, true);
        if (myTypingTimeoutRef.current) clearTimeout(myTypingTimeoutRef.current);
        myTypingTimeoutRef.current = setTimeout(() => {
          if (selectedIdRef.current) sendTyping(selectedIdRef.current, false);
        }, 2500);
      } else {
        sendTyping(selectedId, false);
        if (myTypingTimeoutRef.current) clearTimeout(myTypingTimeoutRef.current);
      }
    }
  };

  const handleSend = async () => {
    const content = draft.trim();
    // 上限超過はここでも見る。ボタンは disabled にしてあるが、
    // Enter キー送信（handleKeyDown）はボタンを経由しないため
    if (!content || content.length > MESSAGE_MAX_LENGTH || selectedId === null) return;
    if (myTypingTimeoutRef.current) clearTimeout(myTypingTimeoutRef.current);
    sendTyping(selectedId, false);
    setSendError('');
    setDraft('');
    try {
      const message = await apiCall<DirectMessage>('/api/messages', 'POST', {
        receiverId: selectedId,
        content,
      });
      // WebSocketの往復を待たずに出す。届いた dm:received は id で弾かれる
      setMessages(prev =>
        prev.some(m => m.id === message.id) ? prev : [...prev, message],
      );
    } catch (err) {
      setDraft(content);
      setSendError(errorMessage(err, '送信に失敗しました。'));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift+Enter は改行。IME変換中のEnterで送ってしまわないよう isComposing を見る
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    handleSend();
  };

  /**
   * フレンド削除・ブロックの後片付け。どちらも相手がフレンドでなくなるので、
   * 一覧から消して会話も閉じる（開いたままだと履歴取得が403になる）。
   * 失敗した時はウィンドウを閉じてから出す。開いたままだとメッセージが裏に隠れる。
   */
  const endFriendship = async (
    endpoint: string,
    body: Record<string, number>,
    friendId: number,
  ) => {
    setSendError('');
    setInfoTarget(null);
    try {
      await apiCall(endpoint, 'POST', body);
      setFriends(prev => prev.filter(f => f.id !== friendId));
      setSelectedId(null);
    } catch (err) {
      setSendError(errorMessage(err, '操作に失敗しました。'));
    }
  };

  const selectConversation = (userId: number) => {
    setSelectedId(userId);
    setDraft('');
  };

  if (!mounted || !token || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-r-2 border-indigo-500"></div>
      </main>
    );
  }

  const selectedFriend = selectedId !== null ? friendMap.get(selectedId) : undefined;
  /*
   * 上限判定は「実際に送られる文字列」で行う。SendMessageDto は検証の前に trim するので、
   * 末尾の改行や空白を数えるとサーバーは通るのにフロントで止まる、という食い違いが出る。
   * 数え方は UTF-16 のコード単位（JSの String#length、class-validator の @MaxLength と同じ）。
   */
  const contentLength = draft.trim().length;
  const remaining = MESSAGE_MAX_LENGTH - contentLength;
  const overLimit = remaining < 0;

  return (
    <main className="h-screen flex flex-col bg-zinc-950 text-white">
      {/* Header */}
      <header className="shrink-0 border-b border-zinc-700 bg-zinc-950/70 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="p-2 text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 rounded-full border border-zinc-800/80 transition-all cursor-pointer"
          title="ホームへ戻る"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-zinc-100">メッセージ</h1>
        <span className="text-[11px] text-zinc-600 hidden sm:inline">フレンドとのみやり取りできます</span>
      </header>

      <div className="flex-1 min-h-0 flex">
        {/* Left: conversation list. 狭い画面では会話を開いている間は隠す。
            境界を線1本に頼らず、一覧側の面を一段明るくして分ける */}
        <aside
          className={`${
            selectedId !== null ? 'hidden md:flex' : 'flex'
          } w-full md:w-80 shrink-0 flex-col border-r border-zinc-700 bg-zinc-900/60`}
        >
          <div className="flex-1 overflow-y-auto">
            {listLoading ? (
              <p className="p-4 text-xs text-zinc-600">読み込み中...</p>
            ) : rows.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <p className="text-xs text-zinc-500">フレンドがいません</p>
                <p className="text-[10px] text-zinc-600 mt-1 leading-relaxed">
                  DMはフレンドとのみやり取りできます。
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-3 px-3 py-1.5 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all cursor-pointer"
                >
                  ホームでフレンドを追加
                </button>
              </div>
            ) : (
              rows.map(({ friend, lastMessage }) => {
                const unread = unreadCounts.get(friend.id) ?? 0;
                return (
                <button
                  key={friend.id}
                  onClick={() => selectConversation(friend.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left border-b border-zinc-700/60 transition-all cursor-pointer ${
                    selectedId === friend.id
                      ? 'bg-indigo-950/50 border-l-2 border-l-indigo-500'
                      : 'hover:bg-zinc-800/60 border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    {renderAvatar(friend.profileImage, 'w-9 h-9 text-base')}
                    <span
                      className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-zinc-900 ${
                        onlineFriendIds.has(friend.id) ? 'bg-emerald-500' : 'bg-zinc-600'
                      }`}
                      title={onlineFriendIds.has(friend.id) ? 'オンライン' : 'オフライン'}
                    ></span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`text-xs truncate ${
                          unread > 0 ? 'font-bold text-white' : 'font-semibold text-zinc-100'
                        }`}
                      >
                        {friend.username}
                      </span>
                      {lastMessage && (
                        <span className="text-[9px] text-zinc-600 shrink-0">
                          {formatTime(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-[10px] truncate ${
                          unread > 0 ? 'text-zinc-300' : 'text-zinc-500'
                        }`}
                      >
                        {lastMessage
                          ? `${lastMessage.senderId === user.id ? 'あなた: ' : ''}${lastMessage.content}`
                          : 'まだメッセージはありません'}
                      </p>
                      {/* 誰から何件見逃しているかが一覧で分かるようにする */}
                      {unread > 0 && (
                        <span className="shrink-0 min-w-[18px] h-[18px] px-1.5 bg-indigo-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right: messages */}
        <section
          className={`${
            selectedId === null ? 'hidden md:flex' : 'flex'
          } flex-1 min-w-0 flex-col bg-zinc-950`}
        >
          {!selectedFriend ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-zinc-600">会話を選んでください</p>
            </div>
          ) : (
            <>
              <div className="shrink-0 px-4 py-3 border-b border-zinc-700 bg-zinc-900/50 flex items-center gap-3">
                <button
                  onClick={() => setSelectedId(null)}
                  className="md:hidden p-1.5 text-zinc-400 hover:text-white transition-all cursor-pointer"
                  title="一覧へ戻る"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {renderAvatar(selectedFriend.profileImage, 'w-8 h-8 text-base')}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-zinc-100 truncate">
                    {selectedFriend.username}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {onlineFriendIds.has(selectedFriend.id) ? 'オンライン' : 'オフライン'}
                  </div>
                </div>
                {/* 会話画面から相手のプロフィールを開く。ホーム画面の「詳細」と同じウィンドウ */}
                <button
                  onClick={() => setInfoTarget(selectedFriend)}
                  className="shrink-0 p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-950/20 border border-transparent hover:border-indigo-900/30 rounded-lg transition-all cursor-pointer"
                  title="プロフィール"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>

              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-4"
              >
                {loadingMore && (
                  <p className="text-center text-[10px] text-zinc-600">読み込み中...</p>
                )}
                {!historyLoading && messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-zinc-600">まだメッセージはありません</p>
                    <p className="text-[10px] text-zinc-700 mt-1">
                      下の入力欄から送ってみましょう
                    </p>
                  </div>
                )}
                {messages.map((message, i) => {
                  const mine = message.senderId === user.id;
                  const speaker = mine ? user : selectedFriend;
                  /*
                   * 連投は1つのまとまりとして扱い、アバターと名前は先頭にだけ出す。
                   * 毎行に出すと縦に間延びして、かえって誰の発言か追いにくくなる。
                   */
                  const startsGroup =
                    i === 0 || messages[i - 1].senderId !== message.senderId;
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${mine ? 'flex-row-reverse' : 'flex-row'} ${
                        startsGroup ? 'pt-3' : 'pt-0.5'
                      }`}
                    >
                      {/* 連投の2件目以降もこの幅を空けて、吹き出しの左端を揃える */}
                      <div className="w-8 shrink-0">
                        {startsGroup && renderAvatar(speaker.profileImage, 'w-8 h-8 text-base')}
                      </div>
                      <div
                        className={`max-w-[75%] flex flex-col ${
                          mine ? 'items-end' : 'items-start'
                        }`}
                      >
                        {startsGroup && (
                          <span className="mb-1 px-1 text-[10px] font-semibold text-zinc-400">
                            {speaker.username}
                          </span>
                        )}
                        {/* 招待は吹き出しではなくカードで描く。content（固定文言）は
                            会話一覧のプレビュー専用なのでここでは使わない */}
                        {message.type === 'ROOM_INVITE' && message.roomCode ? (
                          <RoomInviteCard
                            roomCode={message.roomCode}
                            mine={mine}
                            expired={isInviteExpired(message.createdAt)}
                            onJoin={() =>
                              joinInvitedRoom(
                                message.roomCode!,
                                user.username,
                                router,
                              )
                            }
                          />
                        ) : (
                          <div
                            className={`px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap break-words ${
                              mine
                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
                            }`}
                          >
                            {message.content}
                          </div>
                        )}
                        <div className={`flex items-center gap-1.5 mt-0.5 px-1 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                          {mine && message.id <= partnerLastReadMessageId && (
                            <span className="text-[9px] font-bold text-indigo-400 select-none flex items-center gap-0.5">
                              既読
                            </span>
                          )}
                          <span className="text-[9px] text-zinc-600">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* 相手の入力中インジケーター */}
                {isPartnerTyping && (
                  <div className="flex items-center gap-2 pt-2 pb-1">
                    <div className="w-8 shrink-0">
                      {renderAvatar(selectedFriend.profileImage, 'w-8 h-8 text-base')}
                    </div>
                    <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-2xl rounded-bl-sm px-3.5 py-2 flex items-center gap-2 shadow-sm">
                      <span className="text-xs text-zinc-300 font-medium">
                        {selectedFriend.username} が入力中
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-zinc-700 bg-zinc-900/50 p-3">
                {sendError && (
                  <p className="mb-2 text-[10px] text-red-400">{sendError}</p>
                )}
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={handleDraftChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="メッセージを入力（Enterで送信 / Shift+Enterで改行）"
                    className={`flex-1 resize-none rounded-xl bg-zinc-950 border px-3 py-2.5 text-xs text-white placeholder-zinc-600 outline-none transition-all max-h-32 ${
                      overLimit
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-zinc-700 focus:border-indigo-500'
                    }`}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!draft.trim() || overLimit}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-xs font-bold text-white transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
                  >
                    送信
                  </button>
                </div>
                {/* 入力自体は止めず（maxLength を使うと無言で受け付けなくなる）、
                    近づいたら残量を、超えたら超過量と送信できない旨を出す */}
                {remaining <= COUNTER_VISIBLE_FROM && (
                  <p
                    className={`mt-1.5 text-right text-[10px] tabular-nums ${
                      remaining <= 0 ? 'text-red-400 font-bold' : 'text-zinc-500'
                    }`}
                  >
                    {overLimit
                      ? `${MESSAGE_MAX_LENGTH} 文字を ${-remaining} 文字超えています`
                      : remaining === 0
                        ? `上限の ${MESSAGE_MAX_LENGTH} 文字に達しました`
                        : `残り ${remaining} 文字`}
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {infoTarget && (
        <FriendInfoWindow
          key={infoTarget.id}
          friend={infoTarget}
          online={onlineFriendIds.has(infoTarget.id)}
          onClose={() => setInfoTarget(null)}
          /* onMessage は渡さない。今まさにその相手との会話を開いている */
          onRemoveFriend={friendId =>
            endFriendship('/api/friends/remove', { friendId }, friendId)
          }
          onBlock={userId =>
            endFriendship('/api/friends/block', { userId }, userId)
          }
        />
      )}
    </main>
  );
}

export default function MessagesPage() {
  // useSearchParams はプリレンダリング時に Suspense 境界を要求する
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-r-2 border-indigo-500"></div>
        </main>
      }
    >
      <MessagesView />
    </Suspense>
  );
}

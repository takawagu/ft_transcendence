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
import { usePresence, type DirectMessage } from '@/lib/presence';
import { renderAvatar } from '@/lib/avatar';

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

function MessagesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mounted, token, user, apiCall } = useSession();
  const { onlineFriendIds, unreadCounts, subscribe, markConversationRead } = usePresence();

  const [friends, setFriends] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [listLoading, setListLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const [draft, setDraft] = useState('');
  const [sendError, setSendError] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  /** ?to= による初期選択は最初の一度だけ行う（以降のクリックを上書きしないため） */
  const initialSelectionDoneRef = useRef(false);
  /** dm:received のハンドラから現在開いている会話を参照するため */
  const selectedIdRef = useRef<number | null>(null);
  /** 末尾が変わった時だけ最下部へ追従するための記録。過去読み足し（先頭への追加）では動かさない */
  const lastMessageIdRef = useRef<number | null>(null);
  /** 過去を読み足した直後にスクロール位置を戻すための、読み足す前の高さ */
  const restoreHeightRef = useRef<number | null>(null);

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
          apiCall('/api/friends'),
          apiCall('/api/messages/conversations'),
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
   * ?to=<userId> が指す相手だけを自動で開く。
   * 指定が無い時は何も開かない（ヘッダーのボタンからは一覧を見せたいため。
   * 直近の会話を勝手に開くと、狭い画面ではその会話画面に着地してしまう）。
   */
  useEffect(() => {
    if (listLoading || initialSelectionDoneRef.current) return;
    initialSelectionDoneRef.current = true;

    const to = Number(searchParams.get('to'));
    if (to && friends.some(f => f.id === to)) setSelectedId(to);
  }, [listLoading, friends, searchParams]);

  // 選んだ相手の履歴
  useEffect(() => {
    if (!token || selectedId === null) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setHistoryLoading(true);
    setSendError('');
    (async () => {
      try {
        const history: DirectMessage[] = await apiCall(
          `/api/messages/${selectedId}?limit=${HISTORY_PAGE_SIZE}`,
        );
        if (cancelled) return;
        setMessages(history || []);
        setHasMore((history?.length ?? 0) === HISTORY_PAGE_SIZE);
        // 既読は履歴が取れてから打つ。どこまで読んだかを表すIDが要るため
        const last = history?.[history.length - 1];
        if (last) markConversationRead(selectedId, last.id);
      } catch (err: any) {
        if (cancelled) return;
        setMessages([]);
        setHasMore(false);
        setSendError(err.message || '履歴を取得できませんでした。');
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, selectedId, apiCall, markConversationRead]);

  // リアルタイム受信
  useEffect(() => {
    if (!token) return;
    return subscribe('dm:received', ({ message, user: partner }) => {
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
    if (lastId === lastMessageIdRef.current) return;
    lastMessageIdRef.current = lastId;
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /** 上端に達したら過去を読み足す */
  const handleScroll = async () => {
    const el = scrollRef.current;
    if (!el || el.scrollTop > 0) return;
    if (!hasMore || loadingMore || historyLoading || messages.length === 0) return;

    setLoadingMore(true);
    restoreHeightRef.current = el.scrollHeight;
    try {
      const older: DirectMessage[] = await apiCall(
        `/api/messages/${selectedId}?before=${messages[0].id}&limit=${HISTORY_PAGE_SIZE}`,
      );
      setMessages(prev => [...(older || []), ...prev]);
      setHasMore((older?.length ?? 0) === HISTORY_PAGE_SIZE);
    } catch {
      restoreHeightRef.current = null;
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || selectedId === null) return;
    setSendError('');
    setDraft('');
    try {
      const message: DirectMessage = await apiCall('/api/messages', 'POST', {
        receiverId: selectedId,
        content,
      });
      // WebSocketの往復を待たずに出す。届いた dm:received は id で弾かれる
      setMessages(prev =>
        prev.some(m => m.id === message.id) ? prev : [...prev, message],
      );
    } catch (err: any) {
      setDraft(content);
      setSendError(err.message || '送信に失敗しました。');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift+Enter は改行。IME変換中のEnterで送ってしまわないよう isComposing を見る
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    handleSend();
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
  // maxLength と同じ数え方（UTF-16のコード単位）で残量を出す
  const remaining = MESSAGE_MAX_LENGTH - draft.length;

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
                <div>
                  <div className="text-sm font-semibold text-zinc-100">
                    {selectedFriend.username}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {onlineFriendIds.has(selectedFriend.id) ? 'オンライン' : 'オフライン'}
                  </div>
                </div>
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
                        <div
                          className={`px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap break-words ${
                            mine
                              ? 'bg-indigo-600 text-white rounded-br-sm'
                              : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
                          }`}
                        >
                          {message.content}
                        </div>
                        <span className="mt-0.5 text-[9px] text-zinc-600 px-1">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="shrink-0 border-t border-zinc-700 bg-zinc-900/50 p-3">
                {sendError && (
                  <p className="mb-2 text-[10px] text-red-400">{sendError}</p>
                )}
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    maxLength={MESSAGE_MAX_LENGTH}
                    placeholder="メッセージを入力（Enterで送信 / Shift+Enterで改行）"
                    className="flex-1 resize-none rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-indigo-500 transition-all max-h-32"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!draft.trim()}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-xs font-bold text-white transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
                  >
                    送信
                  </button>
                </div>
                {/* maxLength は上限に達すると無言で入力を受け付けなくなるので、
                    近づいたら残量を出して打ち止めの理由が分かるようにする */}
                {remaining <= COUNTER_VISIBLE_FROM && (
                  <p
                    className={`mt-1.5 text-right text-[10px] tabular-nums ${
                      remaining === 0 ? 'text-red-400 font-bold' : 'text-zinc-500'
                    }`}
                  >
                    {remaining === 0
                      ? `上限の ${MESSAGE_MAX_LENGTH} 文字に達しました`
                      : `残り ${remaining} 文字`}
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      </div>
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

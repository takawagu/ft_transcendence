'use client';

import { useEffect, useState } from 'react';
import { useSession, type User } from '@/lib/session';
import { usePresence } from '@/lib/presence';
import { renderAvatar } from '@/lib/avatar';
import type { PlayerInGameInfo } from '@/lib/ito/types';

interface InvitePanelProps {
  roomCode: string;
  players: PlayerInGameInfo[];
  /** 送信済みの相手。開閉で消えないよう WaitingRoom 側が保持する */
  invitedIds: Set<number>;
  onInvited: (userId: number) => void;
  onClose: () => void;
}

/**
 * ホストがフレンドをこのルームへ招待するパネル（docs/room-invite-requirements.md セクション4-a）。
 *
 * ルームページは仮想解像度を transform: scale() で拡縮しているため、
 * `fixed` ではなく `absolute` で枠の内側に収める。`fixed` にすると
 * スケールの外に出て見た目が壊れる。
 */
export function InvitePanel({
  roomCode,
  players,
  invitedIds,
  onInvited,
  onClose,
}: InvitePanelProps) {
  const { apiCall } = useSession();
  const { onlineFriendIds } = usePresence();

  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  /** 送信中の相手。連打で同じ招待を二重に投げないため */
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list: User[] = await apiCall('/api/friends');
        if (!cancelled) setFriends(list || []);
      } catch (err: any) {
        if (!cancelled) {
          setFriends([]);
          setError(err.message || 'フレンドを取得できませんでした。');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiCall]);

  /*
   * オンラインを上にする。オフラインにも送れる（DMとして残るので後から気づける）が、
   * 今すぐ来られる相手が上にいた方が選びやすい。
   */
  const sorted = [...friends].sort((a, b) => {
    const aOnline = onlineFriendIds.has(a.id);
    const bOnline = onlineFriendIds.has(b.id);
    if (aOnline !== bOnline) return aOnline ? -1 : 1;
    return a.username.localeCompare(b.username);
  });

  const handleInvite = async (friendId: number) => {
    setError('');
    setSendingId(friendId);
    try {
      await apiCall('/api/messages/invite', 'POST', {
        receiverId: friendId,
        roomCode,
      });
      onInvited(friendId);
    } catch (err: any) {
      // ito:error トーストではなくパネル内に出す。これはRESTの失敗であってitoのイベントではない
      setError(err.message || '招待を送れませんでした。');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40 p-4">
      <div className="bg-zinc-800 rounded-2xl p-6 max-w-md w-full flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-white">フレンドを招待</p>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
            title="閉じる"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-zinc-500 py-6 text-center">読み込み中...</p>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-zinc-500 py-6 text-center">
            フレンドがいません
          </p>
        ) : (
          <ul className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {sorted.map(friend => {
              const online = onlineFriendIds.has(friend.id);
              // players[].id は userId を文字列にしたもの
              const joined = players.some(p => p.id === String(friend.id));
              const invited = invitedIds.has(friend.id);
              const sending = sendingId === friend.id;

              return (
                <li
                  key={friend.id}
                  className={`flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 ${
                    online ? '' : 'opacity-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    {renderAvatar(friend.profileImage, 'w-8 h-8 text-base')}
                    <span
                      className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-zinc-900 ${
                        online ? 'bg-emerald-500' : 'bg-zinc-600'
                      }`}
                    ></span>
                  </div>
                  <span className="flex-1 min-w-0 truncate text-sm text-zinc-100">
                    {friend.username}
                  </span>

                  {joined ? (
                    <span className="shrink-0 text-xs font-semibold text-emerald-400">
                      参加中
                    </span>
                  ) : invited ? (
                    <span className="shrink-0 text-xs font-semibold text-zinc-500">
                      招待済み
                    </span>
                  ) : (
                    <button
                      onClick={() => handleInvite(friend.id)}
                      disabled={sending}
                      className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
                    >
                      {sending ? '送信中...' : '招待'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-[11px] text-zinc-600 leading-relaxed">
          オフラインのフレンドにも送れます。招待はメッセージとして残ります。
        </p>
      </div>
    </div>
  );
}

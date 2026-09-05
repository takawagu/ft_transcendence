'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, type User } from './session';
import { usePresence } from './presence';
import { renderAvatar } from './avatar';
import { joinInvitedRoom } from './room-invite';

/** 自動で消えるまでの時間。読んで押すには足りて、居座らない程度 */
const TOAST_TTL_MS = 20_000;

interface InviteToast {
  /** DirectMessage.id。同じ招待が二重に積まれないよう鍵にする */
  id: number;
  roomCode: string;
  sender: User;
}

/**
 * ルーム招待の受信トースト（docs/room-invite-requirements.md セクション4-b）。
 * layout の PresenceProvider の内側に置き、どの画面に居ても招待に気づけるようにする。
 */
export function RoomInviteToast() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSession();
  const { subscribe } = usePresence();

  const [toasts, setToasts] = useState<InviteToast[]>([]);

  /*
   * ハンドラは購読時のクロージャに閉じ込められるので、その時々の値は ref で読む。
   * user を依存に入れて張り直すこともできるが、購読の張り直しは取りこぼしの元になる。
   */
  const userIdRef = useRef<number | null>(null);
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    userIdRef.current = user?.id ?? null;
  }, [user]);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    return subscribe('dm:received', ({ message, user: partner }) => {
      if (message.type !== 'ROOM_INVITE' || !message.roomCode) return;
      // dm:received は別タブ同期のため送信者にも届く。自分が送った招待は無視する
      if (message.senderId === userIdRef.current) return;

      /*
       * ルームに居る間は積まない（表示を抑えるだけにしない）。
       * 抑止だけだと、ルームを出た瞬間に溜まっていた古い招待が一斉に出てくる。
       * 招待自体は /messages に残るので失われない。
       */
      if (pathnameRef.current?.startsWith('/ito/room/')) return;

      setToasts(prev =>
        prev.some(t => t.id === message.id)
          ? prev
          : [...prev, { id: message.id, roomCode: message.roomCode!, sender: partner }],
      );

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== message.id));
      }, TOAST_TTL_MS);
    });
  }, [subscribe]);

  const dismiss = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleJoin = (toast: InviteToast) => {
    if (!user) return;
    dismiss(toast.id);
    joinInvitedRoom(toast.roomCode, user.username, router);
  };

  if (!user || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[70] flex flex-col gap-2 max-w-[calc(100vw-2rem)]">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="w-80 max-w-full rounded-xl border border-indigo-800/60 bg-zinc-900/95 p-3 shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center gap-2">
            {renderAvatar(toast.sender.profileImage, 'w-8 h-8 text-base')}
            <p className="min-w-0 flex-1 truncate text-xs text-zinc-200">
              <span className="font-bold text-white">{toast.sender.username}</span>
              さんがルームに招待しました
            </p>
            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              title="閉じる"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="flex-1 rounded-lg bg-zinc-950/70 px-2 py-1.5 text-center font-mono text-sm font-bold tracking-widest text-indigo-300">
              {toast.roomCode}
            </span>
            <button
              onClick={() => handleJoin(toast)}
              className="shrink-0 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              参加
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

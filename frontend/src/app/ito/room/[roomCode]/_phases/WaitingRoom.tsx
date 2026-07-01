'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PhaseProps } from '@/lib/ito/types';

export function WaitingRoom({ state, myId, emit }: PhaseProps) {
  const router = useRouter();
  const [theme, setTheme] = useState('');
  const me = state.players.find(p => p.id === myId);
  const isOwner = me?.isRoomOwner ?? false;

  const handleStart = () => {
    if (!theme.trim()) return;
    emit('ito:startGame', { theme: theme.trim(), totalRounds: 1 });
  };

  const handleLeave = () => {
    emit('ito:leaveRoom');
    router.push('/');
  };

  const handleDissolve = () => {
    emit('ito:dissolveRoom');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <p className="text-zinc-500 text-sm mb-1">ルームコード</p>
        <p className="text-5xl font-mono font-bold tracking-widest text-indigo-400">
          {state.roomCode || '------'}
        </p>
        <p className="text-zinc-600 text-xs mt-2">このコードを他のプレイヤーに共有してください</p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        <p className="text-zinc-400 text-sm">参加者 ({state.players.length} / 6)</p>
        <ul className="space-y-2">
          {state.players.map(p => (
            <li key={p.id} className="flex items-center gap-2 bg-zinc-800 rounded-lg px-4 py-2">
              {p.isRoomOwner && <span className="text-yellow-400 text-xs">★</span>}
              <span className="flex-1">{p.name}</span>
              {p.id === myId && (
                <span className="text-xs text-zinc-500">あなた</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {isOwner ? (
        <div className="w-full max-w-sm space-y-3">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">お題</label>
            <input
              className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="例: 速さ、幸福度、辛さ..."
              value={theme}
              onChange={e => setTheme(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
            />
          </div>
          <button
            onClick={handleStart}
            disabled={state.players.length < 2 || !theme.trim()}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
          >
            ゲームを開始する
          </button>
          {state.players.length < 2 && (
            <p className="text-xs text-zinc-600 text-center">2人以上必要です</p>
          )}
          <button
            onClick={handleDissolve}
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 font-semibold text-red-400 hover:bg-zinc-700 border border-red-900 transition-colors"
          >
            部屋を解散する
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-3">
          <p className="text-zinc-500 text-sm text-center">オーナーがゲームを開始するまでお待ちください...</p>
          <button
            onClick={handleLeave}
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            退室する
          </button>
        </div>
      )}
    </div>
  );
}

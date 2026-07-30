'use client';

import { useState } from 'react';
import type { PhaseProps } from '@/lib/ito/types';

export function ThemeSetting({ state, myId, emit }: PhaseProps) {
  const [theme, setTheme] = useState('');
  const me = state.players.find(p => p.id === myId);
  const isOwner = me?.isRoomOwner ?? false;

  const handleStart = () => {
    if (!theme.trim()) return;
    emit('ito:startGame', { theme: theme.trim() });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <p className="text-zinc-500 text-sm mb-1">お題設定</p>
        <p className="text-2xl font-bold text-indigo-400">
          {isOwner ? 'お題を決めてください' : 'ホストがお題を設定中です'}
        </p>
      </div>

      {isOwner ? (
        <div className="w-full max-w-sm space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5 font-semibold">お題</label>
            <input
              className="w-full rounded-lg bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="例: 速さ、幸福度、辛さ..."
              value={theme}
              onChange={e => setTheme(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
            />
          </div>
          <button
            onClick={handleStart}
            disabled={!theme.trim()}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-sm text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            ゲームを開始する
          </button>
        </div>
      ) : (
        <p className="text-zinc-500 text-sm text-center">まもなくゲームが始まります...</p>
      )}
    </div>
  );
}

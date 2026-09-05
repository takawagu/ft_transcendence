'use client';

import { useState } from 'react';
import type { PhaseProps } from '@/lib/ito/types';

export function ThemeSetting({ state, myId, emit }: PhaseProps) {
  const [theme, setTheme] = useState('');
  const me = state.players.find(p => p.id === myId);
  const isOwner = me?.isRoomOwner ?? false;

  const isTooLong = theme.length > 100;

  const handleStart = () => {
    if (!theme.trim() || isTooLong) return;
    emit('ito:startGame', { theme: theme.trim() });
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <p className="text-zinc-500 text-sm mb-1">お題設定</p>
        <p className="text-2xl font-bold text-indigo-400">
          {isOwner ? 'お題を決めてください' : 'ホストがお題を設定中です'}
        </p>
      </div>

      {isOwner ? (
        <div className="w-full max-w-sm space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm text-zinc-400 font-semibold">お題</label>
              <span
                className={`text-xs tabular-nums ${
                  isTooLong
                    ? 'text-red-400 font-bold'
                    : theme.length === 100
                    ? 'text-amber-400 font-medium'
                    : 'text-zinc-500'
                }`}
              >
                {theme.length} / 100
              </span>
            </div>
            <input
              className={`w-full rounded-lg bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 ${
                isTooLong
                  ? 'border border-red-500 focus:ring-red-500'
                  : 'focus:ring-indigo-500'
              } text-sm transition-all`}
              placeholder="例: 速さ、幸福度、辛さ..."
              value={theme}
              onChange={e => setTheme(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  handleStart();
                }
              }}
            />
            {isTooLong && (
              <p className="mt-1 text-xs text-red-400">
                お題は100文字以内で入力してください（現在 {theme.length} 文字）
              </p>
            )}
          </div>
          <button
            onClick={handleStart}
            disabled={!theme.trim() || isTooLong}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-sm text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 transition-colors shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
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

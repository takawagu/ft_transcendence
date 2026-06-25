'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'join'>('menu');

  const goCreate = () => {
    if (!name.trim()) return;
    sessionStorage.setItem('ito_player_name', name.trim());
    router.push('/ito/room/new');
  };

  const goJoin = () => {
    if (!name.trim() || roomCode.length < 6) return;
    sessionStorage.setItem('ito_player_name', name.trim());
    router.push(`/ito/room/${roomCode.toUpperCase()}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="w-full max-w-xs space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white tracking-tight">ITO</h1>
          <p className="text-zinc-400 text-sm mt-1">数字を言葉で表すゲーム</p>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">プレイヤー名</label>
          <input
            className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="名前を入力"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && mode === 'join' && goJoin()}
          />
        </div>

        {mode === 'menu' ? (
          <div className="space-y-3">
            <button
              onClick={goCreate}
              disabled={!name.trim()}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
            >
              部屋を作る
            </button>
            <button
              onClick={() => setMode('join')}
              disabled={!name.trim()}
              className="w-full rounded-lg bg-zinc-700 px-4 py-3 font-semibold text-white hover:bg-zinc-600 disabled:opacity-40 transition-colors"
            >
              部屋に入る
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">ルームコード</label>
              <input
                className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-widest uppercase"
                placeholder="ABCDEF"
                maxLength={6}
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && goJoin()}
              />
            </div>
            <button
              onClick={goJoin}
              disabled={!name.trim() || roomCode.length < 6}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
            >
              参加する
            </button>
            <button
              onClick={() => setMode('menu')}
              className="w-full rounded-lg bg-zinc-700 px-4 py-3 font-semibold text-white hover:bg-zinc-600 transition-colors"
            >
              戻る
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

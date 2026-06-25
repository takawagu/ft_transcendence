'use client';

import { useRouter } from 'next/navigation';
import type { PhaseProps } from '@/lib/ito/types';

export function RevealResult({ state, myId }: PhaseProps) {
  const router = useRouter();
  const { revealResult, roomPhase, players } = state;
  const playerMap = new Map(players.map(p => [p.id, p]));
  const cardMap = new Map(
    revealResult?.revealedCards.map(c => [c.playerId, c.cardNumber]) ?? []
  );

  if (roomPhase === 'REVEAL' && !revealResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400">カードを公開中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center gap-6 p-6 pt-10 max-w-lg mx-auto w-full">
      {revealResult && (
        <>
          {/* Result banner */}
          <div className="text-center">
            {revealResult.success ? (
              <>
                <p className="text-5xl mb-2">🎉</p>
                <h2 className="text-3xl font-bold text-green-400">成功！</h2>
                <p className="text-zinc-400 text-sm mt-1">見事に正しい順番に並べられました</p>
              </>
            ) : (
              <>
                <p className="text-5xl mb-2">😢</p>
                <h2 className="text-3xl font-bold text-red-400">失敗...</h2>
                <p className="text-zinc-400 text-sm mt-1">順番が違っていました</p>
              </>
            )}
          </div>

          {/* Submitted order with card numbers */}
          <div className="w-full">
            <p className="text-xs text-zinc-600 mb-2">提出した順番</p>
            <div className="space-y-2">
              {revealResult.submittedOrder.map((pid, i) => {
                const p = playerMap.get(pid);
                const cardNum = cardMap.get(pid);
                const isCorrectPos = revealResult.correctOrder[i] === pid;
                return (
                  <div
                    key={pid}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2 ${
                      isCorrectPos
                        ? 'bg-green-900/30 ring-1 ring-green-600'
                        : 'bg-red-900/30 ring-1 ring-red-600'
                    }`}
                  >
                    <span className="text-zinc-500 w-5 text-sm font-mono">{i + 1}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p?.imageUrl && (
                      <img src={p.imageUrl} alt={p?.name ?? ''} className="w-9 h-9 rounded object-cover" />
                    )}
                    <span className="flex-1 text-sm">{p?.name}</span>
                    {pid === myId && <span className="text-xs text-indigo-400">あなた</span>}
                    <span className="font-mono font-bold text-xl">{cardNum}</span>
                    <span>{isCorrectPos ? '✓' : '✗'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Correct order (on failure) */}
          {!revealResult.success && (
            <div className="w-full">
              <p className="text-xs text-zinc-600 mb-2">正解の順番</p>
              <div className="flex gap-3 flex-wrap">
                {revealResult.correctOrder.map((pid, i) => {
                  const p = playerMap.get(pid);
                  return (
                    <div key={pid} className="text-center">
                      <p className="text-xs text-zinc-500 mb-1">{i + 1}番目</p>
                      <p className="text-sm font-medium">{p?.name}</p>
                      <p className="font-mono text-indigo-400 font-bold">{cardMap.get(pid)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {roomPhase === 'GAME_OVER' && (
        <div className="text-center space-y-4 mt-4">
          <p className="text-zinc-400">ゲーム終了！</p>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            トップに戻る
          </button>
        </div>
      )}
    </div>
  );
}

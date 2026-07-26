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
    <div className="min-h-screen flex flex-col items-center gap-6 p-6 pt-10 max-w-2xl mx-auto w-full">
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
            <p className="text-xs text-zinc-600 mb-3">提出した順番</p>
            <div className="flex flex-wrap justify-center gap-3">
              {revealResult.submittedOrder.map((pid, i) => {
                const p = playerMap.get(pid);
                const cardNum = cardMap.get(pid);
                const isCorrectPos = revealResult.correctOrder[i] === pid;
                return (
                  <div
                    key={pid}
                    className={`flex flex-col items-center gap-2 rounded-xl p-3 w-28 text-center transition-all duration-200 select-none ${
                      isCorrectPos
                        ? 'bg-green-950/30 ring-1 ring-green-600/80 shadow-lg shadow-green-900/5'
                        : 'bg-red-950/30 ring-1 ring-red-600/80 shadow-lg shadow-red-900/5'
                    }`}
                  >
                    {/* Index & correctness indicator */}
                    <div className="flex items-center justify-between w-full text-xs font-bold">
                      <span className="text-zinc-400 font-mono bg-zinc-800/80 rounded-full w-5 h-5 flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className={isCorrectPos ? 'text-green-400' : 'text-red-400'}>
                        {isCorrectPos ? '✓' : '✗'}
                      </span>
                    </div>

                    {/* Image */}
                    {p?.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.imageUrl}
                        alt={p?.name ?? ''}
                        className="w-16 h-16 rounded-lg object-cover shadow-inner"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-lg">
                        {p?.name?.[0]}
                      </div>
                    )}

                    {/* Name & number */}
                    <div className="w-full">
                      <p className="text-sm font-medium text-white truncate">{p?.name}</p>
                      {pid === myId && (
                        <p className="text-[10px] text-indigo-400 font-semibold truncate mt-0.5">あなた</p>
                      )}
                      <p className="font-mono font-bold text-xl text-white mt-1">{cardNum}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Correct order (on failure) */}
          {!revealResult.success && (
            <div className="w-full">
              <p className="text-xs text-zinc-600 mb-3">正解の順番</p>
              <div className="flex flex-wrap justify-center gap-3">
                {revealResult.correctOrder.map((pid, i) => {
                  const p = playerMap.get(pid);
                  return (
                    <div
                      key={pid}
                      className="flex flex-col items-center gap-2 bg-zinc-800/40 rounded-xl p-3 w-28 text-center ring-1 ring-zinc-700/50 select-none"
                    >
                      <p className="text-xs text-zinc-500 font-mono">{i + 1}番目</p>
                      {p?.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={p.imageUrl}
                          alt={p?.name ?? ''}
                          className="w-10 h-10 rounded object-cover shadow-inner"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-sm">
                          {p?.name?.[0]}
                        </div>
                      )}
                      <p className="text-xs font-medium text-white truncate w-full">{p?.name}</p>
                      <p className="font-mono text-indigo-400 font-bold text-sm mt-0.5">{cardMap.get(pid)}</p>
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

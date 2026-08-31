'use client';

import { useRouter } from 'next/navigation';
import type { PhaseProps } from '@/lib/ito/types';

export function RevealResult({ state, myId, emit }: PhaseProps) {
  const router = useRouter();
  const { revealResult, roomPhase, players } = state;
  const playerMap = new Map(players.map(p => [p.id, p]));
  const cardMap = new Map(
    revealResult?.revealedCards.map(c => [c.playerId, c.cardNumber]) ?? []
  );

  const me = players.find(p => p.id === myId);
  const isOwner = me?.isRoomOwner ?? false;

  if (roomPhase === 'REVEAL' && !revealResult) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400">カードを公開中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col items-center gap-6 p-6 pt-10 max-w-2xl mx-auto overflow-y-auto">
      {revealResult && (
        <>
          {/* Result banner */}
          <div className="text-center">
            {revealResult.success ? (
              <>
                <h2 className="text-3xl font-bold text-green-400">大成功！</h2>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-red-400">失敗...</h2>
              </>
            )}
          </div>

          {/* Submitted order with card numbers */}
          <div className="w-full">
            <p className="text-xs text-zinc-600 mb-3 font-semibold">並べた順番</p>
            <div className="flex flex-wrap justify-center gap-3">
              {revealResult.submittedOrder.map((pid, i) => {
                const p = playerMap.get(pid);
                const cardNum = cardMap.get(pid);
                const isCorrectPos = revealResult.correctOrder[i] === pid;
                return (
                  <div
                    key={pid}
                    className={`flex flex-col items-center gap-2 rounded-xl p-3 w-40 text-center transition-all duration-200 select-none ${
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

                    {/* Prompt Content */}
                    <div className="w-36 h-36 rounded-lg border border-cyan-500/20 bg-gradient-to-br from-[#0c1020] to-[#151c3c] flex flex-col items-center justify-center p-3 text-center select-none overflow-y-auto shadow-inner scrollbar-thin">
                      <p className="font-semibold text-sm text-white break-words leading-tight">
                        {p?.prompt || '未入力'}
                      </p>
                    </div>

                    {/* Name & number */}
                    <div className="w-full">
                      <p className="text-sm font-semibold text-white truncate">{p?.name}</p>
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
              <p className="text-xs text-zinc-600 mb-3 font-semibold">正解の順番</p>
              <div className="flex flex-wrap justify-center gap-3">
                {revealResult.correctOrder.map((pid, i) => {
                  const p = playerMap.get(pid);
                  return (
                    <div
                      key={pid}
                      className="flex flex-col items-center gap-2 bg-zinc-800/40 rounded-xl p-3 w-40 text-center ring-1 ring-zinc-700/50 select-none"
                    >
                      <p className="text-xs text-zinc-500 font-mono">{i + 1}番目</p>
                      <div className="w-36 h-36 rounded border border-cyan-500/20 bg-gradient-to-br from-[#0c1020] to-[#151c3c] flex flex-col items-center justify-center p-3 text-center select-none overflow-y-auto shadow-inner scrollbar-thin">
                        <p className="font-semibold text-sm text-white break-words leading-tight">
                          {p?.prompt || '未入力'}
                        </p>
                      </div>
                      <p className="text-xs font-semibold text-white truncate w-full">{p?.name}</p>
                      <p className="font-mono text-indigo-400 font-bold text-sm mt-0.5">{cardMap.get(pid)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Rounds Progression & Host Control Buttons */}
      {roomPhase === 'ROUND_RESULT' && (
        <div className="w-full bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-5 text-center mt-4 space-y-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">ラウンド進行状況</span>
            <span className="text-xs bg-zinc-805 border border-zinc-800 text-zinc-300 font-bold px-2.5 py-1 rounded-full">
              ラウンド {state.currentRound ?? 1} / {state.totalRounds ?? 1}
            </span>
          </div>

          {isOwner ? (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {(state.currentRound ?? 1) < (state.totalRounds ?? 1) ? (
                <>
                  <button
                    onClick={() => emit('ito:nextRound')}
                    className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-4 py-3.5 font-bold text-sm text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    次のラウンドへ進む 🚀
                  </button>
                  <button
                    onClick={() => emit('ito:endGame')}
                    className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 border border-zinc-700 px-4 py-3.5 font-bold text-sm text-zinc-300 transition-all cursor-pointer"
                  >
                    ゲームを途中で終了する 🏁
                  </button>
                </>
              ) : (
                <button
                  onClick={() => emit('ito:endGame')}
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-4 py-3.5 font-bold text-sm text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  結果を確認してゲームを終了する 🏆
                </button>
              )}
            </div>
          ) : (
            <div className="text-sm text-zinc-400 py-2 animate-pulse font-medium">
              {(state.currentRound ?? 1) < (state.totalRounds ?? 1)
                ? 'ホストが次のラウンドを開始するのを待っています...'
                : 'ホストがゲームを終了するのを待っています...'}
            </div>
          )}
        </div>
      )}

      {roomPhase === 'GAME_OVER' && (
        <div className="text-center space-y-4 mt-6 bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-6 w-full">
          <p className="text-zinc-300 font-bold text-lg">ゲーム終了！お疲れ様でした！</p>
          <button
            onClick={() => router.push('/')}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-6 py-3.5 font-bold text-sm text-white transition-all shadow-md cursor-pointer"
          >
            ホームに戻る
          </button>
        </div>
      )}
    </div>
  );
}

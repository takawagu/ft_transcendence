'use client';

import type { PhaseProps } from '@/lib/ito/types';

export function PauseOverlay({ state, myId, emit }: PhaseProps) {
  const me = state.players.find(p => p.id === myId);
  const isHost = me?.isRoomOwner ?? false;

  const disconnected = state.players.filter(p => p.status === 'DISCONNECTED');
  const activeCount = state.players.filter(p => p.status !== 'EXCLUDED').length;
  // 除外して2人を割るとゲーム自体が終了するので、押す前に警告する
  const excludeEndsGame = activeCount - 1 < 2;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-2xl p-8 max-w-md w-full flex flex-col items-center gap-5 shadow-2xl">
        <p className="text-4xl">⏸️</p>

        {disconnected.length === 0 ? (
          <p className="text-lg font-bold text-emerald-400 text-center">
            全員が復帰しました
          </p>
        ) : (
          <p className="text-lg font-bold text-white text-center">
            {disconnected.length}人が切断しています
          </p>
        )}

        {isHost ? (
          <div className="w-full space-y-4">
            {disconnected.map(p => (
              <div
                key={p.id}
                className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white truncate">{p.name}</span>
                  {p.awaitingReturn && (
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/50 border border-amber-800/60 rounded-full px-2 py-0.5">
                      復帰待ち
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => emit('ito:awaitReturn', { playerId: p.id })}
                    disabled={p.awaitingReturn}
                    className="flex-1 rounded-lg bg-zinc-700 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-600 disabled:opacity-40 transition-colors"
                  >
                    復帰を待つ
                  </button>
                  <button
                    onClick={() => emit('ito:excludePlayer', { playerId: p.id })}
                    className="flex-1 rounded-lg bg-red-900/70 border border-red-800 px-3 py-2 text-sm font-semibold text-red-100 hover:bg-red-900 transition-colors"
                  >
                    除外して続行
                  </button>
                </div>

                {excludeEndsGame && (
                  <p className="text-[11px] text-amber-400">
                    除外すると人数不足でゲームが終了します
                  </p>
                )}
              </div>
            ))}

            {disconnected.length === 0 && (
              <button
                onClick={() => emit('ito:resumeGame')}
                className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                再開する
              </button>
            )}

            <button
              onClick={() => emit('ito:abortGame')}
              className="w-full rounded-lg bg-zinc-800 px-4 py-3 font-semibold text-red-400 hover:bg-zinc-700 border border-red-900 transition-colors"
            >
              中断して終了
            </button>
          </div>
        ) : (
          <div className="w-full space-y-2 text-center">
            {disconnected.length > 0 && (
              <ul className="text-sm text-zinc-300 space-y-1">
                {disconnected.map(p => (
                  <li key={p.id}>
                    {p.name}
                    {p.awaitingReturn && (
                      <span className="text-amber-400 text-xs">（復帰待ち）</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <p className="text-sm text-zinc-400">
              ホストが対応中です。しばらくお待ちください...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

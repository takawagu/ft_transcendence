'use client';

import type { PhaseProps } from '@/lib/ito/types';

export function PauseOverlay({ state, myId, emit }: PhaseProps) {
  const me = state.players.find(p => p.id === myId);
  const isHost = me?.isRoomOwner ?? false;
  const target = state.players.find(p => p.id === state.pausedPlayerId);
  const targetReconnected = target?.connected ?? false;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-2xl p-8 max-w-sm w-full flex flex-col items-center gap-5 shadow-2xl">
        <p className="text-4xl">⏸️</p>
        <p className="text-lg font-bold text-white text-center">
          {target?.name ?? 'プレイヤー'}さんが切断しました
        </p>

        {isHost ? (
          <div className="w-full space-y-3">
            {targetReconnected ? (
              <>
                <p className="text-sm text-emerald-400 text-center">
                  {target?.name}さんが再接続しました
                </p>
                <button
                  onClick={() => emit('ito:resumeGame')}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  再開する
                </button>
              </>
            ) : (
              <p className="text-sm text-zinc-400 text-center">
                再接続を待つか、除外して続行するか選んでください
              </p>
            )}
            <button
              onClick={() => emit('ito:excludePlayer')}
              className="w-full rounded-lg bg-zinc-700 px-4 py-3 font-semibold text-white hover:bg-zinc-600 transition-colors"
            >
              除外して続行
            </button>
            <button
              onClick={() => emit('ito:abortGame')}
              className="w-full rounded-lg bg-zinc-800 px-4 py-3 font-semibold text-red-400 hover:bg-zinc-700 border border-red-900 transition-colors"
            >
              中断して終了
            </button>
          </div>
        ) : (
          <p className="text-sm text-zinc-400 text-center">
            ホストが対応中です。しばらくお待ちください...
          </p>
        )}
      </div>
    </div>
  );
}

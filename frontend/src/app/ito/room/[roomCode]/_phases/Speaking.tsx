'use client';

import type { PhaseProps } from '@/lib/ito/types';

export function Speaking({ state, myId, emit }: PhaseProps) {
  const isMyTurn = state.currentTurnPlayerId === myId;
  const alreadyPlaced = state.boardOrder.includes(myId);
  const playerMap = new Map(state.players.map(p => [p.id, p]));
  const currentPlayer = playerMap.get(state.currentTurnPlayerId ?? '');

  const handlePlace = (position: number) => {
    emit('ito:placeCard', { position });
  };

  return (
    <div className="min-h-screen flex flex-col gap-6 p-6 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="text-center pt-4">
        <p className="text-zinc-500 text-sm">お題: <span className="text-white font-semibold">{state.myTheme}</span></p>
        <div className="mt-2">
          {isMyTurn ? (
            <p className="text-indigo-400 font-semibold">あなたのターンです！カードを置く位置を選んでください</p>
          ) : alreadyPlaced ? (
            <p className="text-zinc-400">
              <span className="text-white font-medium">{currentPlayer?.name ?? '?'}</span> のターンを見守りましょう
            </p>
          ) : (
            <p className="text-zinc-400">
              <span className="text-white font-medium">{currentPlayer?.name ?? '?'}</span> のターン
            </p>
          )}
        </div>
      </div>

      {/* Board */}
      <div>
        <p className="text-xs text-zinc-600 mb-2">場 ({state.boardOrder.length} / {state.players.length}人)</p>
        {state.boardOrder.length === 0 ? (
          <div className="border border-dashed border-zinc-700 rounded-lg p-4 text-center text-zinc-600 text-sm">
            {isMyTurn ? 'ここに最初のカードを置く' : 'まだカードが置かれていません'}
          </div>
        ) : null}
        <div className="flex items-center gap-1 flex-wrap">
          {isMyTurn && !alreadyPlaced && (
            <PlaceButton onClick={() => handlePlace(0)} label="↓" />
          )}
          {state.boardOrder.map((pid, i) => {
            const p = playerMap.get(pid);
            return (
              <div key={pid} className="flex items-center gap-1">
                <div className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p?.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-zinc-700 flex items-center justify-center text-xs text-zinc-400">
                      {p?.name?.[0]}
                    </div>
                  )}
                  <p className="text-xs text-zinc-400 mt-1 w-16 truncate">{p?.name}</p>
                </div>
                {isMyTurn && !alreadyPlaced && (
                  <PlaceButton onClick={() => handlePlace(i + 1)} label="↓" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* My card info */}
      <div className="bg-zinc-800/50 rounded-lg px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-700 flex items-center justify-center font-bold text-lg">
          {state.myCardNumber ?? '?'}
        </div>
        <div>
          <p className="text-xs text-zinc-500">あなたのカード</p>
          <p className="text-sm text-white font-medium">
            {state.myTheme} の {state.myCardNumber} 番
          </p>
        </div>
        {alreadyPlaced && <span className="ml-auto text-xs text-green-400">配置済み</span>}
      </div>

      {/* All players grid */}
      <div>
        <p className="text-xs text-zinc-600 mb-2">全プレイヤー</p>
        <div className="grid grid-cols-3 gap-2">
          {state.players.map(p => (
            <div
              key={p.id}
              className={`text-center rounded-lg p-2 ${
                p.id === myId
                  ? 'bg-indigo-900/30 ring-1 ring-indigo-600'
                  : p.id === state.currentTurnPlayerId
                  ? 'bg-zinc-700 ring-1 ring-zinc-500'
                  : 'bg-zinc-800/60'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-full aspect-square rounded object-cover mb-1" />
              ) : (
                <div className="w-full aspect-square rounded bg-zinc-700 flex items-center justify-center text-zinc-500 text-xl mb-1">
                  ?
                </div>
              )}
              <p className="text-xs truncate text-zinc-300">{p.name}</p>
              {p.id === myId && (
                <p className="text-xs text-indigo-400">#{state.myCardNumber}</p>
              )}
              {state.boardOrder.includes(p.id) && (
                <p className="text-xs text-green-500">配置済</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlaceButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-16 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-600/50 text-indigo-300 hover:text-white text-lg transition-colors flex items-center justify-center"
    >
      {label}
    </button>
  );
}

'use client';

import { useState } from 'react';
import type { PhaseProps } from '@/lib/ito/types';

const DropIndicator = () => (
  <div className="w-1.5 h-16 bg-indigo-500 rounded-full animate-pulse mx-1 shadow-lg shadow-indigo-500/50 flex-shrink-0" />
);

export function Speaking({ state, myId, emit }: PhaseProps) {
  const isMyTurn = state.currentTurnPlayerId === myId;
  const alreadyPlaced = state.boardOrder.includes(myId);
  const playerMap = new Map(state.players.map(p => [p.id, p]));
  const currentPlayer = playerMap.get(state.currentTurnPlayerId ?? '');
  const myPlayer = state.players.find(p => p.id === myId);

  // Drag and drop states
  const [isDraggingMyCard, setIsDraggingMyCard] = useState(false);
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);

  const handlePlace = (position: number) => {
    emit('ito:placeCard', { position });
  };

  // Drag and drop handlers
  const handleDragOverCard = (e: React.DragEvent, index: number) => {
    if (!isMyTurn || alreadyPlaced) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the card element
    const width = rect.width;
    const isRightHalf = x > width / 2;
    const targetPos = isRightHalf ? index + 1 : index;
    if (dragOverPosition !== targetPos) {
      setDragOverPosition(targetPos);
    }
  };

  const handleDropCard = (e: React.DragEvent, index: number) => {
    if (!isMyTurn || alreadyPlaced) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const isRightHalf = x > width / 2;
    const targetPos = isRightHalf ? index + 1 : index;

    handlePlace(targetPos);
    setDragOverPosition(null);
  };

  const handleDragOverBoard = (e: React.DragEvent) => {
    if (!isMyTurn || alreadyPlaced) return;
    e.preventDefault();
    if (dragOverPosition === null) {
      setDragOverPosition(state.boardOrder.length);
    }
  };

  const handleBoardDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX >= rect.right ||
      e.clientY < rect.top ||
      e.clientY >= rect.bottom
    ) {
      setDragOverPosition(null);
    }
  };

  const handleDropBoard = (e: React.DragEvent) => {
    if (!isMyTurn || alreadyPlaced) return;
    e.preventDefault();
    if (dragOverPosition !== null) {
      handlePlace(dragOverPosition);
    } else {
      handlePlace(state.boardOrder.length);
    }
    setDragOverPosition(null);
  };

  return (
    <div className="min-h-screen flex flex-col gap-6 p-6 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="text-center pt-4">
        <p className="text-zinc-500 text-sm">お題: <span className="text-white font-semibold">{state.myTheme}</span></p>
        <div className="mt-2">
          {isMyTurn ? (
            <p className="text-indigo-400 font-semibold">
              あなたのターンです！カードをドラッグして場に置いてください
            </p>
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
          <div
            onDragOver={e => {
              if (isMyTurn && !alreadyPlaced) {
                e.preventDefault();
                setDragOverPosition(0);
              }
            }}
            onDragLeave={() => setDragOverPosition(null)}
            onDrop={e => {
              if (isMyTurn && !alreadyPlaced) {
                e.preventDefault();
                handlePlace(0);
                setDragOverPosition(null);
              }
            }}
            onClick={() => {
              if (isMyTurn && !alreadyPlaced) {
                handlePlace(0);
              }
            }}
            className={`border rounded-lg p-6 text-center text-sm transition-all duration-200
              ${isMyTurn && !alreadyPlaced ? 'cursor-pointer hover:bg-zinc-800/40' : ''}
              ${dragOverPosition === 0
                ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300 scale-[1.02] shadow-lg shadow-indigo-500/10'
                : 'border-dashed border-zinc-700 text-zinc-600'
              }
            `}
          >
            {isMyTurn ? 'ここにカードをドラッグ＆ドロップまたはクリックで置く' : 'まだカードが置かれていません'}
          </div>
        ) : (
          <div
            onDragOver={handleDragOverBoard}
            onDragLeave={handleBoardDragLeave}
            onDrop={handleDropBoard}
            className="flex items-center justify-center gap-1.5 flex-wrap py-4 bg-zinc-800/20 rounded-xl px-4 min-h-[104px] border border-zinc-800/40 relative"
          >
            {state.boardOrder.map((pid, i) => {
              const p = playerMap.get(pid);
              return (
                <div key={pid} className="flex items-center gap-1.5">
                  {/* Render drop indicator if dragOverPosition matches this index */}
                  {dragOverPosition === i && <DropIndicator />}

                  {/* Plus button for click-placement before each card */}
                  {isMyTurn && !alreadyPlaced && (
                    <button
                      onClick={() => handlePlace(i)}
                      className="w-6 h-6 rounded-full bg-indigo-600/70 hover:bg-indigo-500 text-white flex items-center justify-center text-xs shadow-md transition-all hover:scale-110 cursor-pointer"
                      title="ここに置く"
                    >
                      +
                    </button>
                  )}

                  {/* Card Container */}
                  <div
                    onDragOver={e => handleDragOverCard(e, i)}
                    onDrop={e => handleDropCard(e, i)}
                    className={`text-center bg-zinc-800 p-2.5 rounded-xl border transition-all duration-200 select-none w-20
                      ${dragOverPosition === i ? 'border-indigo-500/50 bg-indigo-950/10' : 'border-zinc-700/50'}
                    `}
                  >
                    {p?.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-14 h-14 rounded-lg object-cover mx-auto"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-zinc-700 flex items-center justify-center text-xs text-zinc-400 mx-auto">
                        {p?.name?.[0]}
                      </div>
                    )}
                    <p className="text-[10px] text-zinc-400 mt-1.5 truncate w-full">{p?.name}</p>
                  </div>

                  {/* If this is the last card and dragOverPosition is at the end, render DropIndicator at the very end */}
                  {i === state.boardOrder.length - 1 && dragOverPosition === i + 1 && (
                    <DropIndicator />
                  )}

                  {/* Plus button for click-placement after the last card */}
                  {i === state.boardOrder.length - 1 && isMyTurn && !alreadyPlaced && (
                    <button
                      onClick={() => handlePlace(i + 1)}
                      className="w-6 h-6 rounded-full bg-indigo-600/70 hover:bg-indigo-500 text-white flex items-center justify-center text-xs shadow-md transition-all hover:scale-110 cursor-pointer"
                      title="ここに置く"
                    >
                      +
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Large Draggable Hand Card (Only visible on your turn & not placed) */}
      {isMyTurn && !alreadyPlaced && (
        <div className="flex flex-col items-center justify-center py-4 my-2 animate-fade-in">
          <p className="text-xs text-zinc-400 mb-3 flex items-center gap-1.5 animate-pulse">
            <span>✨</span> このカードをドラッグして場の上にドロップしてください
          </p>
          <div
            draggable={true}
            onDragStart={e => {
              setIsDraggingMyCard(true);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', 'my-card');
            }}
            onDragEnd={() => {
              setIsDraggingMyCard(false);
              setDragOverPosition(null);
            }}
            className={`flex flex-col items-center bg-zinc-800 rounded-2xl p-4 border select-none w-48 shadow-2xl transition-all duration-300 cursor-grab active:cursor-grabbing hover:scale-[1.02]
              ${isDraggingMyCard ? 'opacity-20 scale-95 border-dashed border-indigo-500' : 'border-indigo-500/80 ring-2 ring-indigo-500/30'}
            `}
          >
            {/* Theme & Card Number Header */}
            <div className="flex items-center justify-between w-full mb-3 px-1">
              <span className="text-[10px] bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded-full truncate max-w-[100px]">
                {state.myTheme}
              </span>
              <span className="text-xs text-zinc-400 font-medium">No.</span>
            </div>

            {/* Large Image */}
            {myPlayer?.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={myPlayer.imageUrl}
                alt="Your generated card"
                className="w-36 h-36 rounded-xl object-cover shadow-lg border border-zinc-700/50"
                draggable={false}
              />
            ) : (
              <div className="w-36 h-36 rounded-xl bg-zinc-700 flex flex-col items-center justify-center text-zinc-500 gap-1.5 text-xs border border-zinc-700/50">
                <span className="text-xl">🎨</span>
                <span>画像なし</span>
              </div>
            )}

            {/* Large Number */}
            <div className="text-center mt-4">
              <p className="font-mono text-5xl font-extrabold text-white tracking-tight leading-none drop-shadow-md">
                {state.myCardNumber ?? '?'}
              </p>
              <p className="text-[10px] text-zinc-500 mt-2 font-medium">ドラッグして移動</p>
            </div>
          </div>
        </div>
      )}

      {/* My card info (Minimized view - Hidden when placing, extremely compact when shown) */}
      {(!isMyTurn || alreadyPlaced) && (
        <div className="rounded-full px-3 py-1.5 flex items-center gap-2 bg-zinc-800/60 border border-zinc-800/80 text-xs select-none justify-center w-fit mx-auto shadow-sm">
          <span className="text-zinc-500 font-medium">あなたの手札:</span>
          <span className="font-bold text-white font-mono bg-indigo-700 px-2 py-0.5 rounded-full text-[10px]">
            #{state.myCardNumber ?? '?'}
          </span>
          <span className="text-zinc-400 font-medium truncate max-w-[120px]">{state.myTheme}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mx-1" />
          {alreadyPlaced ? (
            <span className="text-green-400 font-bold text-[10px]">配置済み</span>
          ) : (
            <span className="text-zinc-500 font-bold text-[10px]">待機中</span>
          )}
        </div>
      )}

      {/* All players list (Extremely compact horizontal pills to prevent scrolling) */}
      <div className="mt-2">
        <p className="text-[10px] text-zinc-600 mb-2 text-center select-none uppercase tracking-wider font-semibold">プレイヤー</p>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {state.players.map(p => (
            <div
              key={p.id}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-all select-none border
                ${p.id === myId
                  ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300 font-semibold shadow-inner'
                  : p.id === state.currentTurnPlayerId
                  ? 'bg-zinc-700/80 border-zinc-500/30 text-white font-medium ring-1 ring-zinc-500/20 animate-pulse'
                  : 'bg-zinc-800/40 border-zinc-800/60 text-zinc-400'
                }
              `}
            >
              {/* Tiny Avatar */}
              {p.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-4 h-4 rounded-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] text-zinc-300 font-bold">
                  {p.name?.[0]}
                </div>
              )}
              
              <span className="truncate max-w-[70px]">{p.name}</span>
              
              {p.id === myId && (
                <span className="opacity-80 font-mono text-[10px]">#{state.myCardNumber}</span>
              )}
              
              {state.boardOrder.includes(p.id) ? (
                <span className="text-[10px] text-green-400 font-bold">✓</span>
              ) : p.id === state.currentTurnPlayerId ? (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

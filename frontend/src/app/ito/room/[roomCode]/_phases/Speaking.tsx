'use client';

import { useState } from 'react';
import type { PhaseProps } from '@/lib/ito/types';

const DropIndicator = () => (
  <div className="w-1.5 h-28 bg-indigo-500 rounded-full animate-pulse mx-1 shadow-lg shadow-indigo-500/50 flex-shrink-0" />
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
    <div className="min-h-screen flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
      
      {/* Main Split Columns (Responsive side-by-side) */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch w-full">
        
        {/* Left Pane: Theme, Board, and Drag Instructions */}
        <div className="flex-1 bg-zinc-800/10 border border-zinc-800/40 rounded-2xl p-5 flex flex-col gap-4">
          {/* Header (Theme) */}
          <div className="text-center md:text-left border-b border-zinc-800 pb-3 select-none">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">お題</p>
            <h1 className="text-xl font-bold text-white mt-0.5">{state.myTheme}</h1>
            {/* Other player's turn info */}
            {!isMyTurn && (
              <div className="mt-2 text-xs text-zinc-400 font-medium">
                {alreadyPlaced ? (
                  <span><span className="text-white font-semibold">{currentPlayer?.name}</span> のターンを見守りましょう</span>
                ) : (
                  <span><span className="text-white font-semibold">{currentPlayer?.name}</span> のターン</span>
                )}
              </div>
            )}
          </div>

          {/* Board Card Area */}
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xs text-zinc-600 mb-2 font-semibold select-none">場 ({state.boardOrder.length} / {state.players.length}人)</p>
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
                className={`border rounded-xl p-8 text-center text-sm transition-all duration-200 flex items-center justify-center min-h-[140px] select-none
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
                className="flex items-center justify-center gap-1.5 flex-wrap py-4 bg-zinc-800/20 rounded-xl px-4 min-h-[140px] border border-zinc-800/40 relative"
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
                        className={`text-center bg-zinc-800 p-1.5 rounded-xl border transition-all duration-200 select-none w-28 h-28 flex items-center justify-center overflow-hidden
                          ${dragOverPosition === i ? 'border-indigo-500 bg-indigo-950/20 scale-[1.02] shadow-lg' : 'border-zinc-700/30'}
                        `}
                      >
                        {p?.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full rounded-lg object-cover"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-full rounded-lg bg-zinc-700 flex flex-col items-center justify-center text-zinc-400 font-bold select-none text-sm">
                            <span>{p?.name?.[0]}</span>
                            <span className="text-[8px] text-zinc-500 font-normal mt-1 truncate max-w-[80px]">{p?.name}</span>
                          </div>
                        )}
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
        </div>

        {/* Right Pane: Hand Card, Number, and Status */}
        <div className="w-full md:w-80 bg-zinc-800/10 border border-zinc-800/40 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[220px] md:min-h-0">
          {isMyTurn && !alreadyPlaced ? (
            <div className="flex flex-col items-center justify-center w-full select-none">
              <div className="text-center mb-4">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  あなたの数字
                </span>
                <h2 className="text-6xl font-mono font-extrabold text-indigo-400 tracking-tight leading-none py-2 animate-pulse">
                  #{state.myCardNumber}
                </h2>
                <p className="text-[10px] text-zinc-500 mt-2 font-medium">
                  ✨ カードを場にドラッグ＆ドロップしてください
                </p>
              </div>
              
              {/* Draggable Card (Pure Image) */}
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
                className={`w-36 h-36 bg-zinc-800 rounded-2xl border shadow-2xl transition-all duration-300 cursor-grab active:cursor-grabbing hover:scale-[1.02] flex items-center justify-center overflow-hidden
                  ${isDraggingMyCard ? 'opacity-20 scale-95 border-dashed border-indigo-500' : 'border-indigo-500/80 ring-2 ring-indigo-500/30'}
                `}
              >
                {myPlayer?.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={myPlayer.imageUrl}
                    alt="Your generated card"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-700 flex flex-col items-center justify-center text-zinc-400 gap-1.5 text-xs">
                    <span className="text-xl">🎨</span>
                    <span>画像なし</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Status when not placing (waiting or already placed)
            <div className="text-center w-full select-none">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">手札ステータス</span>
              <div className="bg-zinc-800/40 border border-zinc-800/80 rounded-xl p-4 w-full flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-indigo-700/80 border border-indigo-500/30 flex items-center justify-center font-mono font-extrabold text-xl text-white shadow-lg shadow-indigo-500/10">
                  #{state.myCardNumber ?? '?'}
                </div>
                <div className="w-full text-center">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wide">お題</p>
                  <p className="text-xs font-semibold text-white truncate max-w-[160px] mt-0.5">{state.myTheme}</p>
                </div>
                <div className="w-full h-px bg-zinc-800/80" />
                {alreadyPlaced ? (
                  <span className="px-3 py-1 rounded-full bg-green-950/40 border border-green-600/30 text-green-400 text-xs font-bold shadow-sm">
                    ✓ 配置済み
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold shadow-sm animate-pulse">
                    待機中
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Area: All players list (Extremely compact horizontal pills to prevent scrolling) */}
      <div className="border-t border-zinc-800/30 pt-4 w-full">
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

'use client';

import { useState } from 'react';
import type { PhaseProps } from '@/lib/ito/types';

const DropIndicator = () => (
  <div className="w-1.5 h-36 bg-indigo-500 rounded-full animate-pulse mx-1 shadow-lg shadow-indigo-500/50 flex-shrink-0" />
);

export function Speaking({ state, myId, emit }: PhaseProps) {
  const isMyTurn = state.currentTurnPlayerId === myId;
  const alreadyPlaced = state.boardOrder.includes(myId);
  const playerMap = new Map(state.players.map(p => [p.id, p]));
  const currentPlayer = playerMap.get(state.currentTurnPlayerId ?? '');
  const myPlayer = state.players.find(p => p.id === myId);
  // 除外済みは数えない。ただし既に場にカードが出ている人は場の枚数に含まれ続ける
  const boardTotal = state.players.filter(
    p => p.status !== 'EXCLUDED' || state.boardOrder.includes(p.id)
  ).length;

  // Toggling between image and number card
  const [showNumber, setShowNumber] = useState(false);
  const [inspectPlayerId, setInspectPlayerId] = useState<string | null>(null);

  const toggleShowNumber = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNumber(prev => !prev);
  };

  const cardNumber = state.myCardNumber ?? 0;
  const nodeCount = Math.max(4, Math.min(12, Math.floor(cardNumber / 10) + 3));
  const nodes = Array.from({ length: nodeCount }, (_, i) => {
    const angle = (i * 2 * Math.PI) / nodeCount;
    const rSeed = Math.sin(cardNumber * (i + 1) * 43758.5453) * 0.5 + 0.5;
    const r = 35 + rSeed * 25;
    return {
      x: 90 + Math.cos(angle) * r,
      y: 120 + Math.sin(angle) * r,
      size: ((i + cardNumber) % 3) + 2,
    };
  });

  const renderCardContent = (pid: string, isLarge: boolean) => {
    const p = playerMap.get(pid);
    const isMe = pid === myId;
    
    if (isMe && showNumber) {
      return (
        <div 
          onClick={toggleShowNumber}
          className="w-full h-full bg-gradient-to-br from-[#0b132b] to-[#1c2541] border border-cyan-500 rounded-lg overflow-hidden relative flex flex-col items-center justify-center cursor-pointer select-none"
        >
          <svg width="100%" height="100%" viewBox="0 0 180 240" className="absolute top-0 left-0" preserveAspectRatio="xMidYMid slice">
            {nodes.map((node, i) => {
              const nextNode = nodes[(i + 1) % nodes.length];
              return (
                <line
                  key={`line-${i}`}
                  x1={node.x}
                  y1={node.y}
                  x2={nextNode.x}
                  y2={nextNode.y}
                  stroke="rgba(0, 240, 255, 0.25)"
                  strokeWidth="1.5"
                />
              );
            })}
            {nodes.map((node, i) => (
              <circle
                key={`node-${i}`}
                cx={node.x}
                cy={node.y}
                r={node.size * 1.2}
                fill="#00f0ff"
                opacity="0.8"
              />
            ))}
          </svg>
          <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
            <span 
              className={`font-extrabold tracking-tight text-white font-cyber ${isLarge ? 'text-6xl' : 'text-4xl'}`}
              style={{ textShadow: '0 0 8px rgba(0, 240, 255, 0.5)' }}
            >
              {state.myCardNumber ?? '?'}
            </span>
          </div>
        </div>
      );
    }
    
    return (
      <div 
        onClick={isMe ? toggleShowNumber : () => setInspectPlayerId(pid)}
        className={`w-full h-full rounded-lg border border-cyan-500/30 bg-gradient-to-br from-[#0c1020] to-[#151c3c] flex flex-col items-center justify-between p-3 select-none relative shadow-md shadow-black/40 ${isMe ? 'cursor-pointer' : 'cursor-zoom-in'}`}
      >
        <div className="text-xs text-cyan-400 font-cyber font-bold tracking-wider uppercase truncate w-full">
          {p?.name}
        </div>
        <div className="flex-1 w-full flex items-center justify-center text-center px-1 overflow-y-auto min-h-0 text-base font-semibold text-white break-words scrollbar-thin">
          {p?.prompt || '未入力'}
        </div>
      </div>
    );
  };

  // Drag and drop states
  const [isDraggingMyCard, setIsDraggingMyCard] = useState(false);
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
  // Unconfirmed placement: index into `boardWithDraft` where my card is provisionally sitting.
  // Nothing is sent to the server until the player presses 確定.
  const [draftPosition, setDraftPosition] = useState<number | null>(null);

  const canInteract = isMyTurn && !alreadyPlaced;

  // The board including my own not-yet-confirmed card, for rendering/positioning purposes.
  const boardWithDraft =
    draftPosition === null
      ? state.boardOrder
      : [
          ...state.boardOrder.slice(0, draftPosition),
          myId,
          ...state.boardOrder.slice(draftPosition),
        ];

  // rawTargetPos is an index into boardWithDraft ("insert before this index").
  // When a draft already exists, dropping elsewhere just moves it (no server call yet).
  const handleDraftPlace = (rawTargetPos: number) => {
    if (draftPosition === null) {
      setDraftPosition(rawTargetPos);
      return;
    }
    const finalPos = rawTargetPos > draftPosition ? rawTargetPos - 1 : rawTargetPos;
    setDraftPosition(finalPos);
  };

  const handleConfirm = () => {
    if (draftPosition === null) return;
    emit('ito:placeCard', { position: draftPosition });
    setDraftPosition(null);
  };

  const handleCancelDraft = () => {
    setDraftPosition(null);
  };

  // Drag and drop handlers
  const handleDragOverCard = (e: React.DragEvent, index: number) => {
    if (!canInteract) return;
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
    if (!canInteract) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const isRightHalf = x > width / 2;
    const targetPos = isRightHalf ? index + 1 : index;

    handleDraftPlace(targetPos);
    setDragOverPosition(null);
  };

  const handleDragOverBoard = (e: React.DragEvent) => {
    if (!canInteract) return;
    e.preventDefault();
    if (dragOverPosition === null) {
      setDragOverPosition(boardWithDraft.length);
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
    if (!canInteract) return;
    e.preventDefault();
    if (dragOverPosition !== null) {
      handleDraftPlace(dragOverPosition);
    } else {
      handleDraftPlace(boardWithDraft.length);
    }
    setDragOverPosition(null);
  };

  const handleHandClick = () => {
    if (canInteract && draftPosition === null) {
      setDraftPosition(state.boardOrder.length);
    }
  };

  return (
    <div className="h-full w-full flex flex-col justify-start items-center gap-4 md:gap-8 p-3 sm:p-4 md:p-6 max-w-5xl mx-auto overflow-y-auto">

      {/* Main Split Columns (Responsive side-by-side) */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center w-full min-h-0 flex-shrink-0">

        {/* Left Pane: Theme, Board, and Drag Instructions */}
        <div className="w-full md:flex-1 bg-zinc-800/10 border border-zinc-800/40 rounded-2xl p-4 md:p-5 flex flex-col gap-4 flex-shrink-0">
          {/* Header (Theme) */}
          <div className="text-center md:text-left border-b border-zinc-800 pb-3 select-none">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">お題</p>
            <h1 className="text-xl font-bold text-white font-pixel mt-0.5 break-all">{state.myTheme}</h1>
            {/* Other player's turn info */}
            {!isMyTurn && (
              <div className="mt-2 text-xs text-zinc-400 font-medium">
                {alreadyPlaced ? (
                  <span><span className="text-white font-semibold">{currentPlayer?.name}</span> のターン</span>
                ) : (
                  <span><span className="text-white font-semibold">{currentPlayer?.name}</span> のターン</span>
                )}
              </div>
            )}
          </div>

          {/* Board Card Area */}
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xs text-zinc-600 mb-2 font-semibold select-none">フィールド ({state.boardOrder.length} / {boardTotal}人)</p>
            {boardWithDraft.length === 0 ? (
              <div
                onDragOver={e => {
                  if (canInteract) {
                    e.preventDefault();
                    setDragOverPosition(0);
                  }
                }}
                onDragLeave={() => setDragOverPosition(null)}
                onDrop={e => {
                  if (canInteract) {
                    e.preventDefault();
                    handleDraftPlace(0);
                    setDragOverPosition(null);
                  }
                }}
                onClick={() => {
                  if (canInteract) {
                    handleDraftPlace(0);
                  }
                }}
                className={`border rounded-xl p-8 text-center text-sm transition-all duration-200 flex items-center justify-center min-h-[180px] select-none
                  ${canInteract ? 'cursor-pointer hover:bg-zinc-800/40' : ''}
                  ${dragOverPosition === 0
                    ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300 scale-[1.02] shadow-lg shadow-indigo-500/10'
                    : 'border-dashed border-zinc-700 text-zinc-600'
                  }
                `}
              >
                {isMyTurn ? 'カードをドラッグ＆ドロップまたはクリックで置く' : 'まだカードが置かれていません'}
              </div>
            ) : (
              <div
                onDragOver={handleDragOverBoard}
                onDragLeave={handleBoardDragLeave}
                onDrop={handleDropBoard}
                className="flex items-center justify-center gap-1.5 flex-wrap py-4 bg-zinc-800/20 rounded-xl px-4 min-h-[180px] border border-zinc-800/40 relative"
              >
                {boardWithDraft.map((pid, i) => {
                  const p = playerMap.get(pid);
                  const isDraftCard = draftPosition !== null && pid === myId;
                  return (
                    <div key={`${pid}-${i}`} className="flex items-center gap-1.5">
                      {/* Render drop indicator if dragOverPosition matches this index */}
                      {dragOverPosition === i && <DropIndicator />}

                      {/* Card Container */}
                      <div
                        draggable={isDraftCard}
                        onDragStart={e => {
                          if (!isDraftCard) return;
                          setIsDraggingMyCard(true);
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('text/plain', 'my-card');
                        }}
                        onDragEnd={() => {
                          setIsDraggingMyCard(false);
                          setDragOverPosition(null);
                        }}
                        onDragOver={e => handleDragOverCard(e, i)}
                        onDrop={e => handleDropCard(e, i)}
                        className={`text-center bg-zinc-800 p-1.5 rounded-xl border transition-all duration-200 select-none w-44 h-56 flex items-center justify-center overflow-hidden relative
                          ${isDraftCard ? 'cursor-grab active:cursor-grabbing' : ''}
                          ${dragOverPosition === i ? 'border-indigo-500 bg-indigo-950/20 scale-[1.02] shadow-lg' : isDraftCard ? 'border-dashed border-indigo-500/80 ring-2 ring-indigo-500/20' : 'border-zinc-700/30'}
                        `}
                      >
                        {isDraftCard && (
                          <span className="absolute top-1 left-1 text-[8px] font-bold text-indigo-300 bg-indigo-950/80 rounded-full px-1.5 py-0.5 select-none z-20 pointer-events-none">
                            未確定
                          </span>
                        )}
                        {renderCardContent(pid, false)}
                      </div>

                      {/* If this is the last card and dragOverPosition is at the end, render DropIndicator at the very end */}
                      {i === boardWithDraft.length - 1 && dragOverPosition === i + 1 && (
                        <DropIndicator />
                      )}

                    </div>
                  );
                })}
              </div>
            )}
            
          </div>

          {/* Slide Arrows under the board */}
          {canInteract && draftPosition !== null && (
            <div className="flex justify-center gap-4 mt-4 select-none">
              <button
                onClick={() => {
                  if (draftPosition > 0) {
                    setDraftPosition(draftPosition - 1);
                  }
                }}
                disabled={draftPosition === 0}
                className="w-12 h-9 rounded-lg bg-zinc-800 border border-zinc-700/80 text-lg font-bold text-zinc-300 hover:bg-zinc-700 disabled:opacity-20 transition-all cursor-pointer flex items-center justify-center shadow-md shadow-black/30"
                title="左に移動"
              >
                ←
              </button>
              <button
                onClick={() => {
                  if (draftPosition < boardWithDraft.length - 1) {
                    setDraftPosition(draftPosition + 1);
                  }
                }}
                disabled={draftPosition === boardWithDraft.length - 1}
                className="w-12 h-9 rounded-lg bg-zinc-800 border border-zinc-700/80 text-lg font-bold text-zinc-300 hover:bg-zinc-700 disabled:opacity-20 transition-all cursor-pointer flex items-center justify-center shadow-md shadow-black/30"
                title="右に移動"
              >
                →
              </button>
            </div>
          )}
        </div>

        {/* Right Pane: Hand Card, Number, and Status */}
        <div
          className={`w-full md:w-80 bg-zinc-800/10 border border-zinc-800/40 rounded-2xl p-4 md:p-5 flex flex-col items-center justify-center flex-shrink-0 ${
            draftPosition !== null ? 'min-h-0' : 'min-h-[220px] md:min-h-0'
          }`}
        >
          {canInteract && draftPosition !== null ? (
            <div className="flex flex-col items-center justify-center w-full select-none gap-3">
              <button
                onClick={handleConfirm}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-500 transition-colors mt-2 cursor-pointer"
              >
                確定する
              </button>
              <button
                onClick={handleCancelDraft}
                className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                取り消す
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full select-none gap-3">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                あなたのカード
              </span>
              <p className="text-[10px] text-zinc-500 text-center font-medium">
                カードをタップして、数字と回答を変換
              </p>

              {/* Hand Card (Draggable only if it's my turn to place and I haven't placed yet) */}
              <div
                draggable={canInteract}
                onDragStart={e => {
                  if (!canInteract) return;
                  setIsDraggingMyCard(true);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', 'my-card');
                }}
                onDragEnd={() => {
                  setIsDraggingMyCard(false);
                  setDragOverPosition(null);
                }}
                className={`w-44 h-56 bg-zinc-800 rounded-2xl border shadow-2xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center overflow-hidden
                  ${isDraggingMyCard ? 'opacity-20 scale-95 border-dashed border-indigo-500' : 'border-indigo-500/80 ring-2 ring-indigo-500/30'}
                `}
              >
                {renderCardContent(myId, true)}
              </div>

              {/* Status information under the card */}
              <div className="w-full mt-2 text-center">
                {alreadyPlaced ? (
                  <span className="inline-block px-3 py-1 rounded-full bg-green-950/40 border border-green-500/30 text-green-400 text-xs font-semibold font-pixel animate-pulse">
                    配置完了
                  </span>
                ) : !isMyTurn ? (
                  <div className="text-zinc-500 text-xs mt-1 font-pixel">
                    <span className="text-indigo-400 font-semibold">{currentPlayer?.name ?? 'ホスト'}</span> が配置中です
                  </div>
                ) : (
                  <p className="text-[10px] text-indigo-400 mt-1 font-pixel animate-pulse">
                    カードをボードへ配置してください
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Area: All players list (Extremely compact horizontal pills to prevent scrolling) */}
      <div className="border-t border-zinc-800/30 pt-3 md:pt-4 w-full flex-shrink-0 mt-auto md:mt-0">
        <p className="text-[10px] text-zinc-600 mb-2 text-center select-none uppercase tracking-wider font-semibold">プレイヤー</p>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {state.players.map(p => (
            <div
              key={p.id}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-all select-none border
                ${p.status === 'EXCLUDED'
                  ? 'bg-zinc-900/40 border-zinc-800/40 text-zinc-600 line-through opacity-50'
                  : p.id === myId
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
                <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider">OK</span>
              ) : p.id === state.currentTurnPlayerId ? (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Card Inspector Modal */}
      {inspectPlayerId && (() => {
        const p = playerMap.get(inspectPlayerId);
        if (!p) return null;
        return (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-pointer"
            onClick={() => setInspectPlayerId(null)}
          >
            <div 
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center gap-4 max-w-sm w-full relative shadow-2xl cursor-default"
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setInspectPlayerId(null)}
                className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
              
              {/* Title */}
              <div className="text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-cyber">Card Inspector</span>
                <h3 className="text-lg font-bold text-indigo-400 font-pixel mt-0.5">{p.name}</h3>
              </div>

              {/* Large Card Content */}
              <div className="w-72 h-72 rounded-xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-[#0c1020] to-[#18224b] shadow-lg flex flex-col p-6 items-center justify-center text-center">
                <span className="text-xs text-cyan-400 font-cyber font-bold tracking-widest uppercase mb-4">
                  {p.name}の宣言
                </span>
                <div className="flex-1 w-full flex items-center justify-center text-base font-medium text-white break-words overflow-y-auto px-2">
                  {p.prompt || '未入力'}
                </div>
              </div>
              
              <p className="text-[10px] text-zinc-500 font-pixel text-center">
                枠外をクリックして閉じる
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

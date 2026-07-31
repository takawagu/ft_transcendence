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
  // 除外済みは数えない。ただし既に場にカードが出ている人は場の枚数に含まれ続ける
  const boardTotal = state.players.filter(
    p => p.status !== 'EXCLUDED' || state.boardOrder.includes(p.id)
  ).length;

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
            {isMyTurn && draftPosition !== null && (
              <div className="mt-2 text-xs text-indigo-300 font-medium">
                位置を確認して「確定する」を押してください（それまで何度でも置き直せます）
              </div>
            )}
          </div>

          {/* Board Card Area */}
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xs text-zinc-600 mb-2 font-semibold select-none">場 ({state.boardOrder.length} / {boardTotal}人)</p>
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
                className={`border rounded-xl p-8 text-center text-sm transition-all duration-200 flex items-center justify-center min-h-[140px] select-none
                  ${canInteract ? 'cursor-pointer hover:bg-zinc-800/40' : ''}
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
                {boardWithDraft.map((pid, i) => {
                  const p = playerMap.get(pid);
                  const isDraftCard = draftPosition !== null && pid === myId;
                  return (
                    <div key={`${pid}-${i}`} className="flex items-center gap-1.5">
                      {/* Render drop indicator if dragOverPosition matches this index */}
                      {dragOverPosition === i && <DropIndicator />}

                      {/* Plus button for click-placement before each card */}
                      {canInteract && (
                        <button
                          onClick={() => handleDraftPlace(i)}
                          className="w-6 h-6 rounded-full bg-indigo-600/70 hover:bg-indigo-500 text-white flex items-center justify-center text-xs shadow-md transition-all hover:scale-110 cursor-pointer"
                          title="ここに置く"
                        >
                          +
                        </button>
                      )}

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
                        className={`text-center bg-zinc-800 p-1.5 rounded-xl border transition-all duration-200 select-none w-28 h-28 flex items-center justify-center overflow-hidden relative
                          ${isDraftCard ? 'cursor-grab active:cursor-grabbing' : ''}
                          ${dragOverPosition === i ? 'border-indigo-500 bg-indigo-950/20 scale-[1.02] shadow-lg' : isDraftCard ? 'border-dashed border-indigo-500/80 ring-2 ring-indigo-500/20' : 'border-zinc-700/30'}
                        `}
                      >
                        {isDraftCard && (
                          <span className="absolute top-1 left-1 text-[8px] font-bold text-indigo-300 bg-indigo-950/80 rounded-full px-1.5 py-0.5 select-none">
                            未確定
                          </span>
                        )}
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
                      {i === boardWithDraft.length - 1 && dragOverPosition === i + 1 && (
                        <DropIndicator />
                      )}

                      {/* Plus button for click-placement after the last card */}
                      {i === boardWithDraft.length - 1 && canInteract && (
                        <button
                          onClick={() => handleDraftPlace(i + 1)}
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
          {canInteract && draftPosition === null ? (
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
          ) : canInteract && draftPosition !== null ? (
            <div className="flex flex-col items-center justify-center w-full select-none gap-3">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                配置プレビュー中（未確定）
              </span>
              <p className="text-xs text-zinc-400 text-center">
                場のカードをドラッグすると置き直せます。
                <br />
                問題なければ確定してください。
              </p>
              <button
                onClick={handleConfirm}
                className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                確定する
              </button>
              <button
                onClick={handleCancelDraft}
                className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                取り消す
              </button>
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

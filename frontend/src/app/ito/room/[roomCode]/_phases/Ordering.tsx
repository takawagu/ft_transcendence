'use client';

import { useEffect, useRef, useState } from 'react';
import type { PhaseProps } from '@/lib/ito/types';

const DragHandleIcon = () => (
  <svg
    className="w-4 h-4 text-zinc-500 cursor-grab active:cursor-grabbing hover:text-zinc-300 transition-colors"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M8.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-10 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-10 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

export function Ordering({ state, myId, emit }: PhaseProps) {
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isHost = state.roundHostId === myId;
  const hostPlayer = state.players.find(p => p.id === state.roundHostId);
  const playerMap = new Map(state.players.map(p => [p.id, p]));

  // Drag and drop states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatMessages]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...state.boardOrder];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    emit('ito:reorderCards', { orderedPlayerIds: next });
  };

  const moveDown = (index: number) => {
    if (index === state.boardOrder.length - 1) return;
    const next = [...state.boardOrder];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    emit('ito:reorderCards', { orderedPlayerIds: next });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isHost) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isHost) return;
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    if (!isHost) return;
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    const sourceIndex = parseInt(sourceIndexStr, 10);

    if (isNaN(sourceIndex) || sourceIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const next = [...state.boardOrder];
    const [draggedItem] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, draggedItem);
    emit('ito:reorderCards', { orderedPlayerIds: next });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    emit('ito:sendChat', { message: chatInput.trim() });
    setChatInput('');
  };

  return (
    <div className="min-h-screen flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Main Split Layout */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch w-full flex-1">
        
        {/* Left Side (70%): Header, Cards, Ordering list, and Confirm button */}
        <div className="w-full md:w-[70%] bg-zinc-800/10 border border-zinc-800/40 rounded-2xl p-5 flex flex-col justify-between gap-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center md:text-left border-b border-zinc-800 pb-3">
              <h2 className="text-xl font-bold text-white">並び順を確認しましょう</h2>
              <p className="text-zinc-500 text-xs mt-1">お題: <span className="text-white font-semibold">{state.myTheme}</span></p>
              {isHost ? (
                <p className="text-indigo-400 text-xs mt-1.5 font-medium">
                  あなたがホストです。ドラッグ＆ドロップまたは←→で順番を変更できます
                </p>
              ) : (
                <p className="text-zinc-500 text-xs mt-1.5 font-medium">
                  <span className="text-white font-semibold">{hostPlayer?.name ?? '?'}</span> が並び順を調整しています
                </p>
              )}
            </div>

            {/* Board order list (Horizontal cards) */}
            <div className="flex flex-wrap items-center justify-center gap-3 py-2">
              {state.boardOrder.map((pid, i) => {
                const p = playerMap.get(pid);
                return (
                  <div
                    key={pid}
                    draggable={isHost}
                    onDragStart={e => handleDragStart(e, i)}
                    onDragOver={e => handleDragOver(e, i)}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, i)}
                    onDragEnd={handleDragEnd}
                    className={`flex flex-col items-center bg-zinc-800 rounded-xl p-2.5 border select-none w-32 text-center transition-all duration-200 
                      ${isHost ? 'cursor-grab active:cursor-grabbing hover:bg-zinc-700/60' : ''}
                      ${draggedIndex === i ? 'opacity-30 border-dashed border-indigo-500 scale-[0.98]' : 'border-transparent'}
                      ${dragOverIndex === i && draggedIndex !== i ? 'border-indigo-500 bg-indigo-900/20 scale-[1.03] shadow-lg shadow-indigo-500/15' : ''}
                    `}
                  >
                    {/* Player Image Wrapper */}
                    <div className="relative w-28 h-28 rounded-lg overflow-hidden shadow-inner">
                      {p?.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-700 flex flex-col items-center justify-center text-zinc-400 font-bold text-xl select-none">
                          <span>{p?.name?.[0]}</span>
                          <span className="text-[8px] text-zinc-500 font-normal mt-1 truncate max-w-[80px]">{p?.name}</span>
                        </div>
                      )}
                      {/* Overlay drag handle on card for host */}
                      {isHost && (
                        <div className="absolute top-1.5 right-1.5 p-1 rounded bg-black/60 text-zinc-400 backdrop-blur-xs select-none">
                          <DragHandleIcon />
                        </div>
                      )}
                    </div>

                    {/* Fallback Left/Right Buttons */}
                    {isHost && (
                      <div className="flex gap-1.5 w-full justify-center mt-1">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            moveUp(i);
                          }}
                          onDragStart={e => e.stopPropagation()}
                          disabled={i === 0}
                          className="w-7 h-6 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-25 text-xs transition-colors cursor-pointer flex items-center justify-center"
                          title="左に移動"
                        >
                          ←
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            moveDown(i);
                          }}
                          onDragStart={e => e.stopPropagation()}
                          disabled={i === state.boardOrder.length - 1}
                          className="w-7 h-6 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-25 text-xs transition-colors cursor-pointer flex items-center justify-center"
                          title="右に移動"
                        >
                          →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Current order list (Extremely compact horizontal pills to prevent scrolling) */}
            <div className="mt-1">
              <p className="text-[10px] text-zinc-600 mb-2 text-center select-none uppercase tracking-wider font-semibold">現在の並び順</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {state.boardOrder.map((pid, i) => {
                  const p = playerMap.get(pid);
                  if (!p) return null;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs border select-none transition-all
                        ${p.id === myId
                          ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300 font-semibold'
                          : 'bg-zinc-800/40 border-zinc-800 text-zinc-400'
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
                      
                      <span className="font-mono text-zinc-500 font-bold">{i + 1}.</span>
                      <span className="truncate max-w-[70px]">{p.name}</span>
                      
                      {p.id === myId && (
                        <span className="opacity-80 font-mono text-[10px]">#{state.myCardNumber}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          {isHost && (
            <button
              onClick={() => emit('ito:confirmOrder')}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 transition-colors mt-4 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              この順番で確定する
            </button>
          )}
        </div>

        {/* Right Side (30%): Chat */}
        <div className="w-full md:w-[30%] flex flex-col">
          <div className="flex flex-col border border-zinc-800 bg-zinc-800/30 rounded-2xl overflow-hidden shadow-inner h-full flex-1 justify-between">
            <div className="px-3 py-3 bg-zinc-800/60 border-b border-zinc-800/80 flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider select-none">
                チャット（みんなで相談しよう）
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            </div>

            {/* Message History */}
            <div className="h-[280px] md:h-0 md:flex-1 overflow-y-auto p-3 space-y-1.5">
              {state.chatMessages.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4 select-none">まだメッセージはありません</p>
              ) : (
                state.chatMessages.map((msg, i) => (
                  <div key={i} className="text-xs break-all">
                    <span className={`font-semibold ${msg.playerId === myId ? 'text-indigo-400' : 'text-zinc-300'}`}>
                      {msg.playerName}:&nbsp;
                    </span>
                    <span className="text-zinc-100">{msg.message}</span>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-zinc-800/40 border-t border-zinc-800/80 flex gap-2">
              <input
                className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700/50 px-3 py-1.5 text-white text-xs placeholder-zinc-500 outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                placeholder="メッセージを入力..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
              />
              <button
                onClick={sendChat}
                disabled={!chatInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                送信
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

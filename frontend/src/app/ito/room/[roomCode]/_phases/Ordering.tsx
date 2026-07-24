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
    <div className="min-h-screen flex flex-col gap-4 p-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="text-center pt-4">
        <h2 className="text-xl font-semibold">並び順を確認しましょう</h2>
        <p className="text-zinc-500 text-sm mt-1">お題: <span className="text-white">{state.myTheme}</span></p>
        {isHost ? (
          <p className="text-indigo-400 text-sm mt-1">
            あなたがホストです。ドラッグ＆ドロップまたは←→で順番を変更できます
          </p>
        ) : (
          <p className="text-zinc-500 text-sm mt-1">
            <span className="text-white">{hostPlayer?.name ?? '?'}</span> が並び順を調整しています
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
              className={`flex flex-col items-center gap-2 bg-zinc-800 rounded-xl p-3 border select-none w-32 text-center transition-all duration-200 
                ${isHost ? 'cursor-grab active:cursor-grabbing hover:bg-zinc-700/60' : ''}
                ${draggedIndex === i ? 'opacity-30 border-dashed border-indigo-500 scale-[0.98]' : 'border-transparent'}
                ${dragOverIndex === i && draggedIndex !== i ? 'border-indigo-500 bg-indigo-900/20 scale-[1.03] shadow-lg shadow-indigo-500/15' : ''}
              `}
            >
              {/* Badge/Order number */}
              <div className="flex items-center justify-between w-full">
                <span className="bg-zinc-700 text-zinc-300 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center font-mono select-none">
                  {i + 1}
                </span>
                {isHost && (
                  <div className="text-zinc-500">
                    <DragHandleIcon />
                  </div>
                )}
              </div>

              {/* Player Image */}
              {p?.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-24 h-24 rounded-lg object-cover shadow-inner"
                  draggable={false}
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-zinc-700 flex items-center justify-center text-zinc-400 font-bold text-xl select-none">
                  {p?.name?.[0]}
                </div>
              )}

              {/* Player Name */}
              <div className="w-full">
                <p className="text-sm font-medium text-white truncate select-none">{p?.name}</p>
                {pid === myId && (
                  <p className="text-[10px] text-indigo-400 font-semibold mt-0.5 truncate select-none">
                    あなた (#{state.myCardNumber})
                  </p>
                )}
              </div>

              {/* Fallback Left/Right Buttons */}
              {isHost && (
                <div className="flex gap-1.5 mt-1 w-full justify-center">
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

      {isHost && (
        <button
          onClick={() => emit('ito:confirmOrder')}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          この順番で確定する
        </button>
      )}

      {/* Chat */}
      <div className="flex flex-col gap-2 mt-2">
        <p className="text-xs text-zinc-600">チャット（みんなで相談しよう）</p>
        <div className="h-24 overflow-y-auto bg-zinc-800/60 rounded-lg p-3 space-y-1">
          {state.chatMessages.length === 0 ? (
            <p className="text-xs text-zinc-600">まだメッセージはありません</p>
          ) : (
            state.chatMessages.map((msg, i) => (
              <div key={i} className="text-sm">
                <span className={`font-medium ${msg.playerId === myId ? 'text-indigo-400' : 'text-zinc-300'}`}>
                  {msg.playerName}:&nbsp;
                </span>
                <span className="text-white">{msg.message}</span>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-white text-sm placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="メッセージを入力..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendChat()}
          />
          <button
            onClick={sendChat}
            disabled={!chatInput.trim()}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-sm font-medium transition-colors"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}

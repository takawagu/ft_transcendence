'use client';

import { useEffect, useRef, useState } from 'react';
import type { PhaseProps } from '@/lib/ito/types';

export function Ordering({ state, myId, emit }: PhaseProps) {
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isHost = state.roundHostId === myId;
  const hostPlayer = state.players.find(p => p.id === state.roundHostId);
  const playerMap = new Map(state.players.map(p => [p.id, p]));

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

  const sendChat = () => {
    if (!chatInput.trim()) return;
    emit('ito:sendChat', { message: chatInput.trim() });
    setChatInput('');
  };

  return (
    <div className="min-h-screen flex flex-col gap-4 p-6 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="text-center pt-4">
        <h2 className="text-xl font-semibold">並び順を確認しましょう</h2>
        <p className="text-zinc-500 text-sm mt-1">お題: <span className="text-white">{state.myTheme}</span></p>
        {isHost ? (
          <p className="text-indigo-400 text-sm mt-1">あなたがホストです。↑↓で順番を変更できます</p>
        ) : (
          <p className="text-zinc-500 text-sm mt-1">
            <span className="text-white">{hostPlayer?.name ?? '?'}</span> が並び順を調整しています
          </p>
        )}
      </div>

      {/* Board order list */}
      <div className="space-y-2">
        {state.boardOrder.map((pid, i) => {
          const p = playerMap.get(pid);
          return (
            <div key={pid} className="flex items-center gap-3 bg-zinc-800 rounded-lg px-4 py-2">
              <span className="text-zinc-500 w-5 text-sm font-mono">{i + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p?.imageUrl && (
                <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded object-cover" />
              )}
              <span className="flex-1 text-sm">{p?.name}</span>
              {pid === myId && (
                <span className="text-xs text-indigo-400">あなた (#{state.myCardNumber})</span>
              )}
              {isHost && (
                <div className="flex gap-1">
                  <button
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="w-7 h-7 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-25 text-sm transition-colors"
                  >↑</button>
                  <button
                    onClick={() => moveDown(i)}
                    disabled={i === state.boardOrder.length - 1}
                    className="w-7 h-7 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-25 text-sm transition-colors"
                  >↓</button>
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
        <div className="h-36 overflow-y-auto bg-zinc-800/60 rounded-lg p-3 space-y-1">
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

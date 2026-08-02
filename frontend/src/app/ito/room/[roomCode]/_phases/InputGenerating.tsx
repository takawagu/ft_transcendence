'use client';

import { useState } from 'react';
import type { PhaseProps } from '@/lib/ito/types';

export function InputGenerating({ state, myId, emit }: PhaseProps) {
  const [prompt, setPrompt] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const me = state.players.find(p => p.id === myId);
  const myPhase = me?.playerPhase ?? 'INPUT';

  // サーバ値が無いときのフォールバックも除外者抜きで数える（分子・分母を必ず揃える）
  const active = state.players.filter(p => p.status !== 'EXCLUDED');
  const submittedCount =
    state.promptSubmittedCount ?? active.filter(p => p.hasSubmittedPrompt).length;
  const totalCount = state.promptTotalCount ?? active.length;
  const generatedCount =
    state.imageGeneratedCount ?? active.filter(p => p.playerPhase === 'DONE').length;

  const handleSubmit = () => {
    if (!prompt.trim() || submitted) return;
    emit('ito:submitPrompt', { prompt: prompt.trim() });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      {/* Card */}
      <div className="text-center">
        <p className="text-zinc-500 text-sm mb-2">あなたのカード番号</p>
        <div className="w-32 h-32 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-900/50">
          <span className="text-6xl font-bold">{state.myCardNumber ?? '?'}</span>
        </div>
        <p className="text-zinc-400 mt-3 text-sm">
          お題: <span className="text-white font-semibold">{state.myTheme ?? ''}</span>
        </p>
      </div>

      {/* Progress */}
      <div className="text-center text-sm text-zinc-500 space-y-1">
        <p>プロンプト送信 {submittedCount} / {totalCount} 人</p>
        <p>画像生成完了 {generatedCount} / {totalCount} 人</p>
      </div>

      {/* Input area */}
      <div className="w-full max-w-sm">
        {!submitted && myPhase === 'INPUT' ? (
          <div className="space-y-3">
            <p className="text-sm text-zinc-300">
              あなたのカード番号を表すプロンプトを入力してください
            </p>
            <textarea
              className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
              placeholder={`「${state.myTheme ?? 'お題'}」として、あなたの数字のイメージを入力...`}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
            <button
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
            >
              送信する
            </button>
          </div>
        ) : myPhase === 'GENERATING' ? (
          <div className="text-center text-zinc-400 space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>画像を生成中...</p>
          </div>
        ) : (
          <div className="text-center text-green-400 space-y-2">
            <p className="text-2xl">✓</p>
            <p>完了！他のプレイヤーを待っています...</p>
          </div>
        )}
      </div>

      {/* Player status grid */}
      <div className="w-full max-w-sm">
        <p className="text-xs text-zinc-600 mb-2">プレイヤー状況</p>
        <div className="flex gap-2 flex-wrap">
          {state.players.map(p => (
            <div
              key={p.id}
              className={`flex items-center gap-1.5 text-xs bg-zinc-800 rounded-full px-3 py-1 ${
                p.status === 'EXCLUDED' ? 'opacity-40 line-through' : ''
              }`}
            >
              <span className={
                p.status === 'EXCLUDED' ? 'text-zinc-600' :
                p.playerPhase === 'DONE' ? 'text-green-400' :
                p.playerPhase === 'GENERATING' ? 'text-yellow-400' :
                'text-zinc-500'
              }>●</span>
              <span className="text-zinc-300">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

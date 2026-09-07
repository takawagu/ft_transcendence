'use client';

import { useState, useEffect } from 'react';
import type { PhaseProps } from '@/lib/ito/types';

function splitThemeByLength(str: string, chunkSize = 15): string[] {
  if (!str) return [];
  const lines: string[] = [];
  const rawLines = str.split('\n');
  for (const rawLine of rawLines) {
    if (rawLine === '') {
      lines.push('');
      continue;
    }
    const chars = Array.from(rawLine);
    for (let i = 0; i < chars.length; i += chunkSize) {
      lines.push(chars.slice(i, i + chunkSize).join(''));
    }
  }
  return lines;
}

export function InputGenerating({ state, myId, emit }: PhaseProps) {
  const [prompt, setPrompt] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDealing, setIsDealing] = useState(true);

  useEffect(() => {
    // Start dealing animation immediately on mount
    const dealTimer = setTimeout(() => {
      setIsDealing(false);
      // After deal animation finishes, start flip
      const flipTimer = setTimeout(() => {
        setIsFlipped(true);
      }, 200); // slight pause before flip
      return () => clearTimeout(flipTimer);
    }, 800); // 800ms deal animation duration
    return () => clearTimeout(dealTimer);
  }, []);

  const me = state.players.find(p => p.id === myId);
  const myPhase = me?.playerPhase ?? 'INPUT';

  const handleSubmit = () => {
    const trimmed = prompt.trim();
    if (!trimmed || trimmed.length > 100 || submitted) return;
    emit('ito:submitPrompt', { prompt: trimmed });
    setSubmitted(true);
  };

  const cardNumber = state.myCardNumber ?? 50;
  const nodeCount = Math.floor(5 + (cardNumber / 100) * 20); // 5 to 25 nodes
  const nodes = Array.from({ length: nodeCount }, (_, i) => {
    const angle = (i / nodeCount) * Math.PI * 2 + (cardNumber * 0.15); // rotated based on number
    const radius = 30 + ((i + cardNumber) % 3) * 15; // deterministic radius between 30 and 60
    return {
      x: 90 + Math.cos(angle) * radius,
      y: 120 + Math.sin(angle) * radius,
      size: ((i + cardNumber) % 3) + 2, // dot size 2 to 4
    };
  });

  return (
    <div className="h-full w-full flex flex-col md:flex-row items-center justify-center gap-12 p-8 max-w-4xl mx-auto overflow-y-auto">
      {/* Styles for card animations */}
      <style>{`
        .card-container {
          perspective: 1000px;
          width: 240px;
          height: 320px;
        }
        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-style: preserve-3d;
        }
        .card-inner.dealing {
          animation: deal-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .card-inner.flipped {
          transform: rotateY(180deg);
        }
        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
        }
        .card-back {
          background: linear-gradient(135deg, #0b132b 0%, #1c2541 100%);
          border: 3px solid #1e293b;
          color: #818cf8;
        }
        .card-front {
          background: linear-gradient(135deg, #0b132b 0%, #1c2541 100%);
          border: 3px solid #00f0ff;
          color: white;
          transform: rotateY(180deg);
        }
        
        @keyframes deal-in {
          0% {
            transform: translateY(-500px) rotate(-35deg) scale(0.3);
            opacity: 0;
          }
          100% {
            transform: translateY(0) rotate(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>

      {/* Left Column: Card */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center">
        <div className="card-container">
          <div className={`card-inner ${isDealing ? 'dealing' : ''} ${isFlipped ? 'flipped' : ''}`}>
            {/* Card Back */}
            <div className="card-back">
              <div className="text-base uppercase tracking-widest text-indigo-400 font-extrabold mb-3 font-cyber">AITO</div>
              <div className="w-16 h-16 rounded-full border border-indigo-500/50 flex items-center justify-center text-3xl font-bold text-indigo-300 bg-indigo-950/50 font-cyber">
                ?
              </div>
            </div>
            {/* Card Front */}
            <div className="card-front overflow-hidden relative">
              {/* Dynamic SVG background pattern */}
              <svg width="100%" height="100%" viewBox="0 0 180 240" className="absolute top-0 left-0">
                {/* Lines (Mesh) */}
                {nodes.map((node, i) => {
                  const nextNode = nodes[(i + 1) % nodes.length];
                  const skipNode = nodes[(i + 3) % nodes.length];
                  return (
                    <g key={`group-${i}`}>
                      <line
                        x1={node.x}
                        y1={node.y}
                        x2={nextNode.x}
                        y2={nextNode.y}
                        stroke="rgba(0, 240, 255, 0.25)"
                        strokeWidth="1"
                      />
                      {nodeCount > 6 && (
                        <line
                          x1={node.x}
                          y1={node.y}
                          x2={skipNode.x}
                          y2={skipNode.y}
                          stroke="rgba(0, 240, 255, 0.12)"
                          strokeWidth="0.8"
                        />
                      )}
                    </g>
                  );
                })}
                {/* Nodes */}
                {nodes.map((node, i) => (
                  <circle
                    key={`node-${i}`}
                    cx={node.x}
                    cy={node.y}
                    r={node.size}
                    fill="#00f0ff"
                    opacity="0.8"
                  />
                ))}
              </svg>
              
              {/* Number Overlay */}
              <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-8xl font-extrabold tracking-tight text-white animate-fade-in font-cyber" style={{ textShadow: '0 0 10px rgba(0, 240, 255, 0.4)' }}>
                  {state.myCardNumber ?? '?'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Theme, Input, and Status */}
      <div className="flex flex-col gap-6 w-full max-w-sm">
        {/* Theme Panel */}
        <div className="cyber-panel-flat rounded-xl p-4 flex flex-col items-center text-center">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1 font-cyber">お題</p>
          <div className="text-white font-bold text-xl font-pixel break-all">
            {splitThemeByLength(state.myTheme ?? '', 15).map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="w-full">
          {!submitted && myPhase === 'INPUT' ? (
            <div className="cyber-panel-flat rounded-xl p-4 space-y-4">
              <textarea
                className="w-full rounded-lg bg-zinc-950/80 border border-zinc-800/80 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-indigo-500 resize-none text-sm font-pixel"
                rows={3}
                placeholder={`「${state.myTheme ?? 'お題'}」として、あなたの数字のイメージを入力...`}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
              <div className="flex justify-between items-center text-xs font-pixel">
                <span className={prompt.length > 100 ? 'text-red-400 font-bold' : 'text-zinc-500'}>
                  {prompt.length} / 100 文字
                </span>
                {prompt.length > 100 ? (
                  <span className="text-red-400 font-bold">100文字を超えています</span>
                ) : prompt.length === 100 ? (
                  <span className="text-yellow-500">上限文字数に達しました</span>
                ) : null}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!prompt.trim() || prompt.length > 100}
                className="w-full rounded-lg px-4 py-3 font-bold text-sm transition-all cyber-btn-cyan cursor-pointer disabled:opacity-30"
              >
                送信
              </button>
            </div>
          ) : (
            <div className="cyber-panel-flat rounded-xl p-6 text-center text-green-400 space-y-2">
              <p className="text-2xl">✓</p>
              <p className="text-sm">完了！他のプレイヤーを待っています...</p>
            </div>
          )}
        </div>

        {/* Player status grid */}
        <div className="w-full">
          <p className="text-xs text-zinc-500 mb-2 font-pixel">プレイヤー状況</p>
          <div className="flex gap-2 flex-wrap">
            {state.players.map(p => (
              <div
                key={p.id}
                className={`flex items-center gap-1.5 text-xs bg-zinc-800/30 border border-zinc-800/50 rounded-full px-3 py-1 ${
                  p.status === 'EXCLUDED' ? 'opacity-40 line-through' : ''
                }`}
              >
                <span className={
                  p.status === 'EXCLUDED' ? 'text-zinc-600' :
                  p.playerPhase === 'DONE' ? 'text-green-400' :
                  'text-zinc-500'
                }>●</span>
                <span className="text-zinc-300 font-pixel">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

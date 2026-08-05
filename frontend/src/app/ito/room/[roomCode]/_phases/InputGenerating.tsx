'use client';

import { useState, useEffect } from 'react';
import type { PhaseProps } from '@/lib/ito/types';

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
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      {/* Styles for card animations */}
      <style>{`
        .card-container {
          perspective: 1000px;
          width: 180px;
          height: 240px;
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

      {/* Card */}
      <div className="text-center flex flex-col items-center">
        <p className="text-zinc-500 text-sm mb-3">あなたのカード番号</p>
        
        <div className="card-container">
          <div className={`card-inner ${isDealing ? 'dealing' : ''} ${isFlipped ? 'flipped' : ''}`}>
            {/* Card Back */}
            <div className="card-back">
              <div className="text-sm uppercase tracking-widest text-indigo-400 font-bold mb-2">AITO</div>
              <div className="w-12 h-12 rounded-full border border-indigo-500/50 flex items-center justify-center text-xl font-bold text-indigo-300 bg-indigo-950/50">
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
                <span className="text-7xl font-extrabold tracking-tight text-white animate-fade-in" style={{ textShadow: '0 0 8px rgba(0, 240, 255, 0.4)' }}>
                  {state.myCardNumber ?? '?'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-zinc-400 mt-4 text-sm">
          お題: <span className="text-white font-semibold">{state.myTheme ?? ''}</span>
        </p>
      </div>

      {/* Input area */}
      <div className="w-full max-w-sm">
        {!submitted && myPhase === 'INPUT' ? (
          <div className="space-y-3">
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

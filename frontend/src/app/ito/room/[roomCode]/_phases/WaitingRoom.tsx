'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PhaseProps } from '@/lib/ito/types';
import { InvitePanel } from './InvitePanel';

/** 参加人数の上限。backend の room.service.ts の joinRoom と揃える */
const MAX_PLAYERS = 6;

export function WaitingRoom({ state, myId, emit }: PhaseProps) {
  const router = useRouter();
  const me = state.players.find(p => p.id === myId);
  const isOwner = me?.isRoomOwner ?? false;

  const [inviteOpen, setInviteOpen] = useState(false);
  /*
   * 招待を送った相手。パネル側ではなくここに持つ。
   * パネル内に置くと閉じて開き直すたびに「招待済み」が消えて未招待に見えてしまう
   * （サーバーは冪等なので実害は無いが、表示が退行する）。
   */
  const [invitedIds, setInvitedIds] = useState<Set<number>>(new Set());
  const isFull = state.players.length >= MAX_PLAYERS;

  const handleConfirmMembers = () => {
    emit('ito:confirmMembers');
  };

  const handleLeave = () => {
    emit('ito:leaveRoom');
    router.push('/');
  };

  const handleDissolve = () => {
    emit('ito:dissolveRoom');
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <p className="text-zinc-500 text-sm mb-1">ルームコード</p>
        <p className="text-5xl font-mono font-bold tracking-widest text-indigo-400">
          {state.roomCode || '------'}
        </p>
        <p className="text-zinc-600 text-xs mt-2">このコードを他のプレイヤーに共有してください</p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        <p className="text-zinc-400 text-sm">参加者 ({state.players.length} / 6)</p>
        <ul className="space-y-2">
          {state.players.map(p => (
            <li key={p.id} className="flex items-center gap-2 bg-zinc-800 rounded-lg px-4 py-2">
              {p.isRoomOwner && <span className="text-yellow-400 text-xs">★</span>}
              <span className="flex-1">{p.name}</span>
              {p.id === myId && (
                <span className="text-xs text-zinc-500">あなた</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {isOwner ? (
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={handleConfirmMembers}
            disabled={state.players.length < 2}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
          >
            メンバーを確定する
          </button>
          {state.players.length < 2 && (
            <p className="text-xs text-zinc-600 text-center">2人以上必要です</p>
          )}
          <button
            onClick={() => setInviteOpen(true)}
            disabled={isFull}
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 font-semibold text-indigo-300 hover:bg-zinc-700 border border-indigo-900 disabled:opacity-40 transition-colors"
          >
            フレンドを招待
          </button>
          {isFull && (
            <p className="text-xs text-zinc-600 text-center">
              満員のため招待できません
            </p>
          )}
          <button
            onClick={handleDissolve}
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 font-semibold text-red-400 hover:bg-zinc-700 border border-red-900 transition-colors"
          >
            部屋を解散する
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-3">
          <p className="text-zinc-500 text-sm text-center">オーナーがゲームを開始するまでお待ちください...</p>
          <button
            onClick={handleLeave}
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            退室する
          </button>
        </div>
      )}

      {inviteOpen && (
        <InvitePanel
          roomCode={state.roomCode}
          players={state.players}
          invitedIds={invitedIds}
          onInvited={userId =>
            setInvitedIds(prev => new Set(prev).add(userId))
          }
          onClose={() => setInviteOpen(false)}
        />
      )}
    </div>
  );
}

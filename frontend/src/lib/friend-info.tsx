'use client';

import { useState } from 'react';
import { renderAvatar } from './avatar';
import type { User } from './session';

interface FriendInfoWindowProps {
  friend: User;
  online: boolean;
  onClose: () => void;
  /** 「メッセージ」ボタン。/messages では既にその会話を開いているので渡さない */
  onMessage?: () => void;
  /** 実行後の後片付け（一覧の再取得・会話を閉じるなど）は呼び出し側の責任 */
  onRemoveFriend: (friendId: number) => void;
  onBlock: (userId: number) => void;
}

/**
 * フレンドのプロフィールウィンドウ。
 * ホーム画面のフレンド一覧と /messages の会話ヘッダーの両方から開く
 * （subject の Advanced chat features「Access to user profiles from chat interface」）。
 *
 * 別の相手を開いた時に前の相手の確認画面を引き継がないよう、
 * 呼び出し側は必ず `key={friend.id}` を付けること。
 * key が変わればこのコンポーネントの state は React が作り直す。
 */
export function FriendInfoWindow({
  friend,
  online,
  onClose,
  onMessage,
  onRemoveFriend,
  onBlock,
}: FriendInfoWindowProps) {
  /** ブロックの確認ステップ。ウィンドウの中だけで完結するので呼び出し側には見せない */
  const [confirmBlock, setConfirmBlock] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-6 flex flex-col items-center text-center">
          {renderAvatar(friend.profileImage, 'w-20 h-20 text-4xl')}
          <h3 className="mt-3 text-lg font-bold text-zinc-100">{friend.username}</h3>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`block h-2 w-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-zinc-600'
                }`}
            ></span>
            <span className="text-[11px] text-zinc-400">
              {online ? 'オンライン' : 'オフライン'}
            </span>
          </div>
          {friend.bio ? (
            <p className="mt-4 text-xs text-zinc-300 whitespace-pre-wrap break-words leading-relaxed w-full">
              {friend.bio}
            </p>
          ) : (
            <p className="mt-4 text-xs text-zinc-600">自己紹介は設定されていません</p>
          )}
        </div>

        <div className="px-6 pb-6">
          {confirmBlock ? (
            <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl">
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                <span className="font-bold text-red-300">{friend.username}</span> をブロックします。
                フレンド関係が解除され、相手からの申請も届かなくなります。
                <span className="block mt-1 text-zinc-400">解除してもフレンド関係は元に戻りません。</span>
              </p>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setConfirmBlock(false)}
                  className="px-3 py-1.5 text-[11px] font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all cursor-pointer"
                >
                  やめる
                </button>
                <button
                  onClick={() => onBlock(friend.id)}
                  className="px-3 py-1.5 text-[11px] font-bold text-white bg-red-700 hover:bg-red-600 rounded-lg transition-all cursor-pointer"
                >
                  ブロックする
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {onMessage && (
                <button
                  onClick={onMessage}
                  className="w-full px-3 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  メッセージ
                </button>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => onRemoveFriend(friend.id)}
                  className="flex-1 px-3 py-2 text-xs font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all cursor-pointer"
                >
                  フレンド削除
                </button>
                <button
                  onClick={() => setConfirmBlock(true)}
                  className="flex-1 px-3 py-2 text-xs font-bold text-red-300 bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 rounded-lg transition-all cursor-pointer"
                >
                  ブロック
                </button>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full mt-2 px-3 py-2 text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

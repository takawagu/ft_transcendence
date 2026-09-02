'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import type { GameState } from '@/lib/ito/types';
import { WaitingRoom } from './_phases/WaitingRoom';
import { ThemeSetting } from './_phases/ThemeSetting';
import { InputGenerating } from './_phases/InputGenerating';
import { Speaking } from './_phases/Speaking';
import { Ordering } from './_phases/Ordering';
import { RevealResult } from './_phases/RevealResult';
import { PauseOverlay } from './_phases/PauseOverlay';

// nginx がリバースプロキシで同一オリジンに統合するため、
// 未設定（空文字）の場合は相対パスで接続する（= 今アクセスしているホストと同じ宛先）。
// nginx を経由しないローカル開発時のみ .env.local で明示的にURLを指定する。
const BACKEND_URL = process.env.NEXT_PUBLIC_WS_URL ?? '';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const routeRoomCode = params.roomCode as string;
  const isCreating = routeRoomCode === 'new';
  const urlUpdated = useRef(false);
  const joinedRoomCodeRef = useRef<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const [myId, setMyId] = useState('');
  const [dissolved, setDissolved] = useState(false);
  const [abortedReason, setAbortedReason] = useState<string | null>(null);
  /** 入室そのものに失敗した理由。トーストと違い、画面を先に進めさせない */
  const [entryError, setEntryError] = useState<string | null>(null);
  const [state, setState] = useState<GameState>({
    roomCode: '',
    roomPhase: 'WAITING',
    players: [],
    boardOrder: [],
    chatMessages: [],
    paused: false,
  });

  const emit = (event: string, payload?: unknown) => {
    socketRef.current?.emit(event, payload);
  };

  const [scale, setScale] = useState(1);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const portrait = windowWidth < windowHeight;

      // Dynamic virtual size based on orientation
      const virtualWidth = portrait ? 480 : 1024;
      const virtualHeight = portrait ? 800 : 720;
      
      const scaleX = windowWidth / virtualWidth;
      const scaleY = windowHeight / virtualHeight;
      
      // Fit exactly to the viewport for both orientations (no vertical scrolling)
      const newScale = Math.min(scaleX, scaleY);
      
      // Limits to keep layout looking premium and highly readable
      const minScale = portrait ? 0.65 : 0.85;
      const maxScale = portrait ? 1.5 : 2.0;
      const finalScale = Math.max(Math.min(newScale, maxScale), minScale);
      
      setScale(finalScale);
      setIsPortrait(portrait);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    const storedToken = localStorage.getItem('ft_token');
    const storedUser = localStorage.getItem('ft_user');

    if (!storedToken || !storedUser) {
      router.push('/');
      return;
    }

    const userObj = JSON.parse(storedUser);
    const playerName = userObj.username;
    const playerId = String(userObj.id);
    setMyId(playerId);

    const socket = io(`${BACKEND_URL}/ito`);
    socketRef.current = socket;

    socket.on('connect', () => {
      // まだ部屋が無い(=/new)ときだけ作成。作成後の自動再接続はjoinedRoomCodeRefで拾う
      if (isCreating && !joinedRoomCodeRef.current) {
        const totalRounds = parseInt(sessionStorage.getItem('ito_total_rounds') || '3', 10);
        socket.emit('ito:createRoom', { playerName, playerId, totalRounds });
        return;
      }
      /*
       * 部屋コードが分かっているなら、初回参加・リロード・自動再接続を区別せず常にrejoinを送る。
       * 「復帰すべきか新規参加か」を判断できるのは席を持っているサーバだけで、
       * クライアント側の状態(sessionStorage)で当てにいくと必ずどちらかに倒し損ねる:
       *   - 記録が残りすぎる(退室後の同コード再入室) → 復帰扱いで弾かれる
       *   - 記録が足りない(別タブ・招待経由)         → 新規参加扱いで「開始済み」に弾かれる
       * サーバはWAITINGで席が無ければjoinRoomへ倒すので、この1本で両方賄える。
       */
      socket.emit('ito:rejoin', {
        roomCode: joinedRoomCodeRef.current ?? routeRoomCode,
        playerId,
        playerName,
      });
    });

    socket.on('ito:roomState', (data: any) => {
      setState(prev => ({
        ...prev,
        roomCode: data.roomCode,
        roomPhase: data.roomPhase,
        players: data.players,
        roundHostId: data.roundHostId,
        currentTurnPlayerId: data.currentTurnPlayerId,
        boardOrder: data.boardOrder ?? [],
        paused: data.paused ?? false,
        currentRound: data.currentRound,
        totalRounds: data.totalRounds,
      }));
      if (isCreating && !urlUpdated.current && data.roomCode) {
        urlUpdated.current = true;
        window.history.replaceState(null, '', `/ito/room/${data.roomCode}`);
      }
      joinedRoomCodeRef.current = data.roomCode;
    });

    socket.on('ito:resyncState', (data: any) => {
      setState(prev => ({
        ...prev,
        roomCode: data.roomCode,
        roomPhase: data.roomPhase,
        players: data.players,
        roundHostId: data.roundHostId,
        currentTurnPlayerId: data.currentTurnPlayerId,
        boardOrder: data.boardOrder ?? [],
        paused: data.paused ?? false,
        myCardNumber: data.myCardNumber,
        myTheme: data.theme,
        chatMessages: data.messages ?? [],
        // ROUND_RESULT/GAME_OVER中の復帰。cardsRevealedは公開の瞬間にしか飛ばないため、
        // ここで受け取らないと結果画面が空のままになる
        revealResult: data.lastReveal ?? prev.revealResult,
        currentRound: data.currentRound,
        totalRounds: data.totalRounds,
      }));
      joinedRoomCodeRef.current = data.roomCode;
    });

    socket.on('ito:phaseChange', (data: any) => {
      setState(prev => ({
        ...prev,
        roomPhase: data.roomPhase,
        roundHostId: data.roundHostId ?? prev.roundHostId,
      }));
    });

    socket.on('ito:dealtCard', (data: any) => {
      setState(prev => ({ ...prev, myCardNumber: data.cardNumber, myTheme: data.theme }));
    });

    socket.on('ito:promptSubmitted', (data: any) => {
      setState(prev => ({
        ...prev,
        promptSubmittedCount: data.submittedCount,
        promptTotalCount: data.totalCount,
      }));
    });

    socket.on('ito:playerPhaseChange', (data: any) => {
      setState(prev => ({
        ...prev,
        players: prev.players.map(p =>
          p.id === data.playerId ? { ...p, playerPhase: data.playerPhase } : p
        ),
      }));
    });

    socket.on('ito:imageGenerated', (data: any) => {
      setState(prev => ({
        ...prev,
        players: prev.players.map(p =>
          p.id === data.playerId ? { ...p, imageUrl: data.imageUrl } : p
        ),
        imageGeneratedCount: data.generatedCount,
        imageTotalCount: data.totalCount,
      }));
    });

    socket.on('ito:cardPlaced', (data: any) => {
      setState(prev => ({ ...prev, boardOrder: data.boardOrder }));
    });

    socket.on('ito:turnChanged', (data: any) => {
      setState(prev => ({ ...prev, currentTurnPlayerId: data.currentTurnPlayerId }));
    });

    socket.on('ito:orderChanged', (data: any) => {
      setState(prev => ({ ...prev, boardOrder: data.orderedPlayerIds }));
    });

    socket.on('ito:chatMessage', (data: any) => {
      setState(prev => ({ ...prev, chatMessages: [...prev.chatMessages, data] }));
    });

    socket.on('ito:cardsRevealed', (data: any) => {
      setState(prev => ({ ...prev, revealResult: data }));
    });

    socket.on('ito:error', (data: any) => {
      // 一度も入室できていない状態でのエラーは復帰不能。トーストで流すと
      // 画面が「接続中...」のまま固まり、ユーザーには操作不能にしか見えない
      if (!joinedRoomCodeRef.current) {
        setEntryError(data.message ?? 'ルームに参加できませんでした');
        setTimeout(() => router.push('/'), 3000);
        return;
      }
      setState(prev => ({ ...prev, error: data.message }));
      setTimeout(() => setState(prev => ({ ...prev, error: undefined })), 3000);
    });

    socket.on('ito:roomDissolved', () => {
      setDissolved(true);
      setTimeout(() => router.push('/'), 3000);
    });

    socket.on('ito:gamePaused', () => {
      // 誰が切断中かはroomStateのplayers[].statusが持つ
      setState(prev => ({ ...prev, paused: true }));
    });

    socket.on('ito:gameResumed', () => {
      setState(prev => ({ ...prev, paused: false }));
    });

    socket.on('ito:gameAborted', (data: any) => {
      setAbortedReason(data.reason ?? 'ゲームが中断されました');
      setTimeout(() => router.push('/'), 3000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const phaseProps = { state, myId, emit };

  const renderPhase = () => {
    if (!state.roomCode) return <Centered>接続中...</Centered>;
    switch (state.roomPhase) {
      case 'WAITING':
        return <WaitingRoom {...phaseProps} />;
      case 'THEME_SETTING':
        return <ThemeSetting {...phaseProps} />;
      case 'DEALING':
        return <Centered>カードを配布中...</Centered>;
      case 'INPUT_GENERATING':
        return <InputGenerating {...phaseProps} />;
      case 'SPEAKING':
        return <Speaking {...phaseProps} />;
      case 'ORDERING':
        return <Ordering {...phaseProps} />;
      case 'REVEAL':
      case 'ROUND_RESULT':
      case 'GAME_OVER':
        return <RevealResult {...phaseProps} />;
      default:
        return <Centered>読み込み中...</Centered>;
    }
  };

  return (
    <div className="h-screen overflow-hidden text-white flex flex-col relative items-center justify-center">
      {state.error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm">
          {state.error}
        </div>
      )}
      {dissolved && (
        <ExitDialog message="部屋が解散されました" onBack={() => router.push('/')} />
      )}
      {abortedReason && (
        <ExitDialog message={abortedReason} onBack={() => router.push('/')} />
      )}
      {entryError && (
        <ExitDialog message={entryError} onBack={() => router.push('/')} />
      )}
      {state.paused && !abortedReason && !entryError && (
        <PauseOverlay state={state} myId={myId} emit={emit} />
      )}

      {/* Game Scaled Container (Dynamic Virtual Resolution) */}
      <div
        className="flex-shrink-0 flex flex-col relative overflow-hidden"
        style={{
          width: isPortrait ? '480px' : '1024px',
          height: isPortrait ? '800px' : '720px',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          pointerEvents: state.paused ? 'none' : 'auto',
        }}
      >
        {renderPhase()}
      </div>
    </div>
  );
}

/** 部屋から出る以外にやることが無い状態（解散・中断・入室失敗）の全画面表示 */
function ExitDialog({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-2xl p-10 flex flex-col items-center gap-6 shadow-2xl max-w-md">
        <p className="text-xl font-bold text-white text-center">{message}</p>
        <p className="text-zinc-400 text-sm">まもなくトップへ戻ります...</p>
        <button
          onClick={onBack}
          className="rounded-lg bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          今すぐ戻る
        </button>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex items-center justify-center text-zinc-400 text-lg">
      {children}
    </div>
  );
}

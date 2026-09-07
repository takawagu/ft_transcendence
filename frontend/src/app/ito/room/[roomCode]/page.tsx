'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useSession, type User } from '@/lib/session';
import type {
  CardPlacedPayload,
  CardsRevealedPayload,
  ChatMessagePayload,
  DealtCardPayload,
  ErrorPayload,
  GameAbortedPayload,
  GameState,
  ImageGeneratedPayload,
  OrderChangedPayload,
  PhaseChangePayload,
  PlayerPhaseChangePayload,
  PlayerReconnectedPayload,
  PromptSubmittedPayload,
  ResyncStatePayload,
  RoomStatePayload,
  TurnChangedPayload,
} from '@/lib/ito/types';
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

/**
 * 同一ブラウザの他タブに「同じアカウントでゲームを開いているか」を尋ねるチャネル。
 * 応答があれば接続せず、1アカウントが同時に持てるゲームタブを1つに保つ。
 *
 * 部屋コードでは絞らない。別々の部屋なら許すと、同じユーザーが2つのゲームを
 * 並行して終えられてしまい、戦績の集計(recordRoundResults)が同一ユーザー行へ
 * 同時に走りうるため。
 *
 * 接続する前に止めるのが要点。サーバは「後から来た接続が正」として席を付け替える
 * （切断検知までの間の再接続を通すために必要で、変えられない）ので、
 * 繋いでしまってからでは先のタブを弾き出した後になる。
 *
 * BroadcastChannelは自分の投稿を自分には配信しないので、単純なping/pongで足りる。
 * リロードでは旧タブが既に消えていて応答が返らないため、復帰の邪魔はしない。
 */
const TAB_CHANNEL = 'ito_room_tab';

/** 他タブの応答を待つ時間。同一ブラウザ内の配送なので数ms、余裕を見てこの値 */
const TAB_PROBE_MS = 200;

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const routeRoomCode = params.roomCode as string;
  const isCreating = routeRoomCode === 'new';
  const urlUpdated = useRef(false);
  const joinedRoomCodeRef = useRef<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  /**
   * 自分のプレイヤーID。SessionProvider が localStorage から読んだユーザーから導く。
   * 下の接続 effect でも同じ localStorage を読んでいるが、あちらは
   * 「他タブの確認より前に一度だけ」という順序が要るため独立している。
   * 表示に使うのはこちらだけなので state には持たない（セッション確定前は空文字）。
   */
  const { user } = useSession();
  const myId = user ? String(user.id) : '';
  /**
   * 部屋から出る以外にやることが無くなった理由（解散・中断・入室失敗・席の移動）。
   * トーストと違い、画面を先に進めさせない。
   */
  const [exitMessage, setExitMessage] = useState<string | null>(null);
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

  /** 部屋から出る以外にやることが無い状態にして、しばらく後にトップへ戻す */
  const leaveWith = (message: string) => {
    setExitMessage(message);
    setTimeout(() => router.push('/'), 3000);
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

    const userObj = JSON.parse(storedUser) as User;
    const playerName = userObj.username;
    // 表示用の myId は useSession から導出済み。ここでは他タブ判定と
    // 自分の再接続通知を弾くのに使うだけなのでローカル変数で足りる
    const playerId = String(userObj.id);

    // playerIdはサーバがこのトークンから導出する。以降クライアントは名乗らない。
    // 接続は他タブの確認が済んでから（このeffectの末尾）。繋いでしまってからでは席を奪った後になる
    const socket = io(`${BACKEND_URL}/ito`, {
      auth: { token: storedToken },
      autoConnect: false,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      // まだ部屋が無い(=/new)ときだけ作成。作成後の自動再接続はjoinedRoomCodeRefで拾う
      if (isCreating && !joinedRoomCodeRef.current) {
        const totalRounds = parseInt(sessionStorage.getItem('ito_total_rounds') || '3', 10);
        socket.emit('ito:createRoom', { playerName, totalRounds });
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
        playerName,
      });
    });

    socket.on('disconnect', reason => {
      // サーバが明示的に切るのは認証に失敗したときだけ（席を奪われた場合は切らない）。
      // 拾わないと画面が「接続中...」のまま固まる
      if (reason === 'io server disconnect') {
        leaveWith('認証に失敗しました。ログインし直してください');
      }
    });

    socket.on('ito:roomState', (data: RoomStatePayload) => {
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

    socket.on('ito:resyncState', (data: ResyncStatePayload) => {
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

    socket.on('ito:phaseChange', (data: PhaseChangePayload) => {
      setState(prev => ({
        ...prev,
        roomPhase: data.roomPhase,
        roundHostId: data.roundHostId ?? prev.roundHostId,
      }));
    });

    socket.on('ito:dealtCard', (data: DealtCardPayload) => {
      setState(prev => ({ ...prev, myCardNumber: data.cardNumber, myTheme: data.theme }));
    });

    socket.on('ito:promptSubmitted', (data: PromptSubmittedPayload) => {
      setState(prev => ({
        ...prev,
        promptSubmittedCount: data.submittedCount,
        promptTotalCount: data.totalCount,
      }));
    });

    socket.on('ito:playerPhaseChange', (data: PlayerPhaseChangePayload) => {
      setState(prev => ({
        ...prev,
        players: prev.players.map(p =>
          p.id === data.playerId ? { ...p, playerPhase: data.playerPhase } : p
        ),
      }));
    });

    socket.on('ito:imageGenerated', (data: ImageGeneratedPayload) => {
      setState(prev => ({
        ...prev,
        players: prev.players.map(p =>
          p.id === data.playerId ? { ...p, imageUrl: data.imageUrl } : p
        ),
        imageGeneratedCount: data.generatedCount,
        imageTotalCount: data.totalCount,
      }));
    });

    socket.on('ito:cardPlaced', (data: CardPlacedPayload) => {
      setState(prev => ({ ...prev, boardOrder: data.boardOrder }));
    });

    socket.on('ito:turnChanged', (data: TurnChangedPayload) => {
      setState(prev => ({ ...prev, currentTurnPlayerId: data.currentTurnPlayerId }));
    });

    socket.on('ito:orderChanged', (data: OrderChangedPayload) => {
      setState(prev => ({ ...prev, boardOrder: data.orderedPlayerIds }));
    });

    socket.on('ito:chatMessage', (data: ChatMessagePayload) => {
      setState(prev => ({ ...prev, chatMessages: [...prev.chatMessages, data] }));
    });

    socket.on('ito:cardsRevealed', (data: CardsRevealedPayload) => {
      setState(prev => ({ ...prev, revealResult: data }));
    });

    socket.on('ito:error', (data: ErrorPayload) => {
      // 一度も入室できていない状態でのエラーは復帰不能。トーストで流すと
      // 画面が「接続中...」のまま固まり、ユーザーには操作不能にしか見えない
      if (!joinedRoomCodeRef.current) {
        leaveWith(data.message ?? 'ルームに参加できませんでした');
        return;
      }
      setState(prev => ({ ...prev, error: data.message }));
      setTimeout(() => setState(prev => ({ ...prev, error: undefined })), 3000);
    });

    socket.on('ito:roomDissolved', () => {
      leaveWith('部屋が解散されました');
    });

    socket.on('ito:sessionTakenOver', () => {
      // 同じ席に別のタブ/端末が入った。この接続はもう部屋のブロードキャストを受け取らず、
      // 送った操作も全て無視されるので、自分から切って離脱画面を出す。
      // 明示的なdisconnectなのでsocket.ioは自動再接続せず、席を奪い返しには行かない。
      socket.disconnect();
      // もうこの部屋の席を持っていないので、他タブの問い合わせに在席を返さない
      joinedRoomCodeRef.current = null;
      leaveWith('別の場所でこの部屋に接続したため、この画面は切断されました');
    });

    socket.on('ito:playerReconnected', (data: PlayerReconnectedPayload) => {
      // 自分の復帰を自分に知らせても仕方がない。myIdはこの時点ではまだ空なのでplayerIdで比べる
      if (data.playerId === playerId) return;

      const notice = `${data.playerName} が再接続しました`;
      setState(prev => ({ ...prev, notice }));
      // 続けて別の人が戻ってきた場合に、古いタイマーが新しい通知を消さないようにする
      setTimeout(
        () => setState(prev => (prev.notice === notice ? { ...prev, notice: undefined } : prev)),
        3000,
      );
    });

    socket.on('ito:gamePaused', () => {
      // 誰が切断中かはroomStateのplayers[].statusが持つ
      setState(prev => ({ ...prev, paused: true }));
    });

    socket.on('ito:gameResumed', () => {
      setState(prev => ({ ...prev, paused: false }));
    });

    socket.on('ito:gameAborted', (data: GameAbortedPayload) => {
      leaveWith(data.reason ?? 'ゲームが中断されました');
    });

    const channel =
      typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(TAB_CHANNEL);

    // 他タブからの問い合わせに答える側。
    // 部屋コードは見ない。同じアカウントが別々の部屋で同時に遊べてしまうと、
    // 戦績の集計(recordRoundResults)が同一ユーザー行へ同時に走りうるため。
    channel?.addEventListener('message', (ev: MessageEvent) => {
      const msg = ev.data;
      if (msg?.type === 'probe' && msg.playerId === playerId && joinedRoomCodeRef.current) {
        channel.postMessage({ type: 'here', playerId });
      }
    });

    let probeTimer: ReturnType<typeof setTimeout> | undefined;

    // BroadcastChannel非対応の環境では従来どおり繋ぐ（重複はサーバ側の席の付け替えに委ねる）
    if (!channel) {
      socket.connect();
    } else {
      let occupied = false;
      const onReply = (ev: MessageEvent) => {
        if (ev.data?.type === 'here' && ev.data.playerId === playerId) occupied = true;
      };
      channel.addEventListener('message', onReply);
      channel.postMessage({ type: 'probe', playerId });

      probeTimer = setTimeout(() => {
        channel.removeEventListener('message', onReply);
        if (occupied) {
          leaveWith('別のタブでゲームを開いています。同時に複数のゲームには参加できません');
          return;
        }
        socket.connect();
      }, TAB_PROBE_MS);
    }

    return () => {
      clearTimeout(probeTimer);
      channel?.close();
      socket.disconnect();
    };
    /*
     * 依存配列を空にしているのは意図的で、この画面の生存期間に接続はちょうど1本。
     * 再実行すると socket を張り直すことになり、サーバは「後から来た接続が正」として
     * 席を付け替えるため、自分で自分の席を奪って前の接続を落とす
     * （上の ito:sessionTakenOver のコメントを参照）。
     * routeRoomCode / isCreating は部屋作成後に history.replaceState でURLだけ
     * 書き換えており Next のルーターを経由しないので、ここでは変化しない。
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {/* ポーズ中でも読めるよう、オーバーレイ(z-50)より上に出す */}
      {(state.error || state.notice) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2">
          {state.error && (
            <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg text-sm">
              {state.error}
            </div>
          )}
          {state.notice && (
            <div className="bg-zinc-800 border border-emerald-700/70 text-emerald-200 px-6 py-3 rounded-lg shadow-lg text-sm">
              {state.notice}
            </div>
          )}
        </div>
      )}
      {exitMessage && (
        <ExitDialog message={exitMessage} onBack={() => router.push('/')} />
      )}
      {state.paused && !exitMessage && (
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

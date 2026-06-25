'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import type { GameState } from '@/lib/ito/types';
import { WaitingRoom } from './_phases/WaitingRoom';
import { InputGenerating } from './_phases/InputGenerating';
import { Speaking } from './_phases/Speaking';
import { Ordering } from './_phases/Ordering';
import { RevealResult } from './_phases/RevealResult';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

export default function RoomPage() {
  const params = useParams();
  const routeRoomCode = params.roomCode as string;
  const isCreating = routeRoomCode === 'new';
  const urlUpdated = useRef(false);

  const socketRef = useRef<Socket | null>(null);
  const [myId, setMyId] = useState('');
  const [state, setState] = useState<GameState>({
    roomCode: '',
    roomPhase: 'WAITING',
    players: [],
    boardOrder: [],
    chatMessages: [],
  });

  const emit = (event: string, payload?: unknown) => {
    socketRef.current?.emit(event, payload);
  };

  useEffect(() => {
    const playerName = sessionStorage.getItem('ito_player_name') ?? 'プレイヤー';
    const socket = io(`${BACKEND_URL}/ito`);
    socketRef.current = socket;

    socket.on('connect', () => {
      setMyId(socket.id!);
      if (isCreating) {
        socket.emit('ito:createRoom', { playerName });
      } else {
        socket.emit('ito:joinRoom', { roomCode: routeRoomCode, playerName });
      }
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
      }));
      if (isCreating && !urlUpdated.current && data.roomCode) {
        urlUpdated.current = true;
        window.history.replaceState(null, '', `/ito/room/${data.roomCode}`);
      }
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
      setState(prev => ({ ...prev, error: data.message }));
      setTimeout(() => setState(prev => ({ ...prev, error: undefined })), 3000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const phaseProps = { state, myId, emit };

  const renderPhase = () => {
    if (!myId) return <Centered>接続中...</Centered>;
    switch (state.roomPhase) {
      case 'WAITING':
        return <WaitingRoom {...phaseProps} />;
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
    <div className="min-h-screen bg-zinc-900 text-white">
      {state.error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm">
          {state.error}
        </div>
      )}
      {renderPhase()}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-zinc-400 text-lg">
      {children}
    </div>
  );
}

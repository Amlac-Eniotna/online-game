"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState } from '@/lib/game/game-types';

export type MatchmakingStatus = 'idle' | 'searching' | 'found' | 'in-game';

export interface SocketState {
  connected: boolean;
  matchmakingStatus: MatchmakingStatus;
  gameState: GameState | null;
  currentGameId: string | null;
  opponentName: string | null;
  error: string | null;
}

export interface UseSocketReturn extends SocketState {
  joinQueue: (userId: string, username: string, heroId: string, deck: any[]) => void;
  leaveQueue: () => void;
  playCard: (cardId: string, position?: number, targetId?: string) => void;
  attack: (attackerId: string, targetId: string) => void;
  useHeroPower: (targetId?: string, position?: number) => void;
  endTurn: () => void;
  disconnect: () => void;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

/**
 * Custom hook for managing Socket.io connection and game state
 */
export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<SocketState>({
    connected: false,
    matchmakingStatus: 'idle',
    gameState: null,
    currentGameId: null,
    opponentName: null,
    error: null,
  });

  useEffect(() => {
    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      console.log('[Socket] Connected to server');
      setState((prev) => ({
        ...prev,
        connected: true,
        error: null,
      }));
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
      setState((prev) => ({
        ...prev,
        connected: false,
        matchmakingStatus: 'idle',
      }));
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      setState((prev) => ({
        ...prev,
        connected: false,
        error: 'Failed to connect to game server',
      }));
    });

    // Matchmaking handlers
    socket.on('queue-joined', () => {
      console.log('[Socket] Joined matchmaking queue');
      setState((prev) => ({
        ...prev,
        matchmakingStatus: 'searching',
        error: null,
      }));
    });

    socket.on('match-found', ({ gameId, opponent }: { gameId: string; opponent: string }) => {
      console.log('[Socket] Match found!', { gameId, opponent });
      setState((prev) => ({
        ...prev,
        matchmakingStatus: 'found',
        currentGameId: gameId,
        opponentName: opponent,
      }));
    });

    socket.on('game-start', ({ gameState }: { gameState: GameState }) => {
      console.log('[Socket] Game started');
      setState((prev) => ({
        ...prev,
        matchmakingStatus: 'in-game',
        gameState,
      }));
    });

    // Game state handlers
    socket.on('game-update', (gameState: GameState) => {
      console.log('[Socket] Game state updated');
      setState((prev) => ({
        ...prev,
        gameState,
      }));
    });

    socket.on('game-over', ({ winner, reason }: { winner: string; reason: string }) => {
      console.log('[Socket] Game over', { winner, reason });
      setState((prev) => ({
        ...prev,
        matchmakingStatus: 'idle',
        currentGameId: null,
        opponentName: null,
      }));
    });

    // Error handlers
    socket.on('error', ({ message }: { message: string }) => {
      console.error('[Socket] Error:', message);
      setState((prev) => ({
        ...prev,
        error: message,
      }));
    });

    socket.on('invalid-action', ({ message }: { message: string }) => {
      console.warn('[Socket] Invalid action:', message);
      setState((prev) => ({
        ...prev,
        error: message,
      }));
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  // Action methods
  const joinQueue = useCallback((userId: string, username: string, heroId: string, deck: any[]) => {
    if (!socketRef.current?.connected) {
      setState((prev) => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    console.log('[Socket] Joining queue...', { userId, username, heroId });
    socketRef.current.emit('join-queue', { userId, username, heroId, deck });
  }, []);

  const leaveQueue = useCallback(() => {
    if (!socketRef.current?.connected) return;

    console.log('[Socket] Leaving queue...');
    socketRef.current.emit('leave-queue');
    setState((prev) => ({
      ...prev,
      matchmakingStatus: 'idle',
    }));
  }, []);

  const playCard = useCallback((cardId: string, position?: number, targetId?: string) => {
    if (!socketRef.current?.connected || !state.currentGameId) {
      setState((prev) => ({ ...prev, error: 'Not in a game' }));
      return;
    }

    console.log('[Socket] Playing card...', { cardId, position, targetId });
    socketRef.current.emit('play-card', { cardId, position, targetId });
  }, [state.currentGameId]);

  const attack = useCallback((attackerId: string, targetId: string) => {
    if (!socketRef.current?.connected || !state.currentGameId) {
      setState((prev) => ({ ...prev, error: 'Not in a game' }));
      return;
    }

    console.log('[Socket] Attacking...', { attackerId, targetId });
    socketRef.current.emit('attack', { attackerId, targetId });
  }, [state.currentGameId]);

  const useHeroPower = useCallback((targetId?: string, position?: number) => {
    if (!socketRef.current?.connected || !state.currentGameId) {
      setState((prev) => ({ ...prev, error: 'Not in a game' }));
      return;
    }

    console.log('[Socket] Using hero power...', { targetId, position });
    socketRef.current.emit('use-power', { targetId, position });
  }, [state.currentGameId]);

  const endTurn = useCallback(() => {
    if (!socketRef.current?.connected || !state.currentGameId) {
      setState((prev) => ({ ...prev, error: 'Not in a game' }));
      return;
    }

    console.log('[Socket] Ending turn...');
    socketRef.current.emit('end-turn');
  }, [state.currentGameId]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('[Socket] Manually disconnecting...');
      socketRef.current.disconnect();
    }
  }, []);

  return {
    ...state,
    joinQueue,
    leaveQueue,
    playCard,
    attack,
    useHeroPower,
    endTurn,
    disconnect,
  };
}

"use client";

import Spinner from '@/components/ui/spinner';
import type { MatchmakingStatus } from '@/hooks/useSocket';
import { useEffect, useState } from 'react';

interface MatchmakingModalProps {
  status: MatchmakingStatus;
  opponentName: string | null;
  error: string | null;
  onCancel: () => void;
  onAccept?: () => void;
}

export default function MatchmakingModal({
  status,
  opponentName,
  error,
  onCancel,
  onAccept,
}: MatchmakingModalProps) {
  const [dots, setDots] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);

  // 15 minutes in seconds
  const TIMEOUT_SECONDS = 15 * 60;

  // Reset state when status changes to 'searching'
  useEffect(() => {
    if (status === 'searching') {
      setElapsedTime(0);
      setIsTimedOut(false);
      setDots('');
    }
  }, [status]);

  // Timer and Checkout Logic
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    let dotsInterval: NodeJS.Timeout;

    if (status === 'searching' && !isTimedOut) {
      // Timer for elapsed time
      timerInterval = setInterval(() => {
        setElapsedTime((prev) => {
          if (prev >= TIMEOUT_SECONDS) {
            setIsTimedOut(true);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      // Animated dots
      dotsInterval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
    }

    return () => {
      clearInterval(timerInterval);
      clearInterval(dotsInterval);
    };
  }, [status, isTimedOut]);

  // Countdown for match found
  useEffect(() => {
    if (status === 'found' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'found' && countdown === 0 && onAccept) {
      onAccept();
    }
  }, [status, countdown, onAccept]);

  // Reset countdown when status changes
  useEffect(() => {
    if (status === 'found') {
      setCountdown(3);
    }
  }, [status]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'idle' || status === 'in-game') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-space-dark to-space-purple/20 border-2 border-space-purple/50 rounded-lg p-8 max-w-md w-full">
        {/* Searching State */}
        {status === 'searching' && (
          <div className="text-center">
            {!isTimedOut ? (
              <>
                <div className="mb-6">
                  <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                    <Spinner className="w-24 h-24" />
                  </div>
                </div>

                <h2 className="text-3xl font-bold mb-2">Recherche d'un adversaire{dots}</h2>
                <div className="text-2xl font-mono text-space-cyan mb-4">
                  {formatTime(elapsedTime)}
                </div>
                
                <p className="text-gray-400 mb-6">
                  Searching for a worthy adversary across the galaxy
                </p>

                {error && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={onCancel}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
                >
                  Cancel Search
                </button>
              </>
            ) : (
              // Timeout State
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="mb-6 text-6xl">⚠️</div>
                <h2 className="text-2xl font-bold mb-4 text-red-400">Délai d'attente dépassé</h2>
                <p className="text-gray-300 mb-6">
                  Aucun adversaire trouvé après 15 minutes. Veuillez réessayer plus tard.
                </p>
                <button
                  onClick={onCancel}
                  className="px-6 py-3 bg-space-cyan hover:bg-space-cyan/80 text-space-dark rounded-lg font-bold transition-colors w-full"
                >
                  Retour au menu
                </button>
              </div>
            )}
          </div>
        )}

        {/* Match Found State */}
        {status === 'found' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4 animate-bounce">⚔️</div>
            </div>

            <h2 className="text-3xl font-bold mb-2 text-space-cyan animate-pulse">
              Match Found!
            </h2>
            <p className="text-xl text-gray-300 mb-2">
              vs <span className="font-bold text-white">{opponentName || 'Unknown Pilot'}</span>
            </p>

            <div className="my-6 p-4 bg-space-dark/50 rounded-lg">
              <div className="text-4xl font-bold text-space-cyan mb-2">{countdown}</div>
              <p className="text-gray-400 text-sm">Starting in...</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={countdown === 0}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg font-bold transition-colors"
              >
                Decline
              </button>
              <button
                onClick={onAccept}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-space-cyan to-space-purple hover:from-space-purple hover:to-space-cyan text-white rounded-lg font-bold transition-all shadow-lg shadow-space-cyan/50"
              >
                Ready!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


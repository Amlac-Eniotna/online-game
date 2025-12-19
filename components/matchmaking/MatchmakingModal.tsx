"use client";

import { useEffect, useState } from 'react';
import type { MatchmakingStatus } from '@/hooks/useSocket';

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

  // Animated dots for searching state
  useEffect(() => {
    if (status === 'searching') {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [status]);

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

  if (status === 'idle' || status === 'in-game') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-space-dark to-space-purple/20 border-2 border-space-purple/50 rounded-lg p-8 max-w-md w-full">
        {/* Searching State */}
        {status === 'searching' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="relative w-24 h-24 mx-auto">
                {/* Animated ring */}
                <div className="absolute inset-0 rounded-full border-4 border-space-cyan/30 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-space-cyan border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  🎮
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-2">Finding Opponent{dots}</h2>
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

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import MatchmakingModal from '@/components/matchmaking/MatchmakingModal';

interface Deck {
  id: string;
  name: string;
  heroId: string;
  hero: {
    id: string;
    name: string;
    class: string;
  };
  totalCards: number;
}

export default function PlayPage() {
  const router = useRouter();
  const socket = useSocket();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeckSelect, setShowDeckSelect] = useState(false);
  const [gameMode, setGameMode] = useState<'quick' | 'ranked'>('quick');

  useEffect(() => {
    fetchDecks();
  }, []);

  // Navigate to game when match starts
  useEffect(() => {
    if (socket.matchmakingStatus === 'in-game' && socket.currentGameId) {
      router.push(`/game/${socket.currentGameId}`);
    }
  }, [socket.matchmakingStatus, socket.currentGameId, router]);

  const fetchDecks = async () => {
    try {
      const response = await fetch('/api/decks');
      if (response.ok) {
        const data = await response.json();
        setDecks(data.decks);
        if (data.decks.length > 0) {
          setSelectedDeck(data.decks[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayClick = (mode: 'quick' | 'ranked') => {
    setGameMode(mode);
    if (decks.length === 0) {
      alert('You need to create a deck first! Go to Deck Builder.');
      router.push('/decks');
      return;
    }
    setShowDeckSelect(true);
  };

  const handleStartMatchmaking = () => {
    if (!selectedDeck) {
      alert('Please select a deck');
      return;
    }

    // TODO: Get actual user ID and username from auth
    const userId = 'user-123'; // Replace with actual user ID
    const username = 'Player'; // Replace with actual username

    socket.joinQueue(userId, username, selectedDeck.heroId, []);
    setShowDeckSelect(false);
  };

  const handleCancelMatchmaking = () => {
    socket.leaveQueue();
  };

  const handleAcceptMatch = () => {
    // Match will auto-start, just close modal
    console.log('Match accepted');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-space-cyan mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Play</h1>

      {/* Connection Status */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${socket.connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          <span className="text-sm text-gray-400">
            {socket.connected ? 'Connected to game server' : 'Disconnected from game server'}
          </span>
        </div>
      </div>

      {/* Game Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <GameModeCard
          title="Quick Match"
          description="Jump into a casual game"
          icon="⚡"
          onClick={() => handlePlayClick('quick')}
          disabled={!socket.connected}
        />
        <GameModeCard
          title="Ranked"
          description="Climb the ladder"
          icon="🏆"
          onClick={() => handlePlayClick('ranked')}
          disabled={!socket.connected}
        />
      </div>

      {/* Deck Selection Modal */}
      {showDeckSelect && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-space-dark to-space-purple/20 border-2 border-space-purple/50 rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-3xl font-bold mb-6">Select Your Deck</h2>

            {decks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">You don't have any decks yet!</p>
                <button
                  onClick={() => router.push('/decks')}
                  className="px-6 py-3 bg-space-cyan hover:bg-space-cyan/80 text-space-dark rounded-lg font-bold transition-colors"
                >
                  Create a Deck
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {decks.map((deck) => (
                    <button
                      key={deck.id}
                      onClick={() => setSelectedDeck(deck)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedDeck?.id === deck.id
                          ? 'border-space-cyan bg-space-cyan/10'
                          : 'border-space-purple/30 bg-space-dark/30 hover:border-space-purple'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold">{deck.name}</h3>
                          <p className="text-sm text-gray-400">
                            {deck.hero.name} - {deck.hero.class}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">{deck.totalCards} cards</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeckSelect(false)}
                    className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartMatchmaking}
                    disabled={!selectedDeck}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-space-cyan to-space-purple hover:from-space-purple hover:to-space-cyan disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all shadow-lg shadow-space-cyan/50"
                  >
                    Find Match
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Matchmaking Modal */}
      <MatchmakingModal
        status={socket.matchmakingStatus}
        opponentName={socket.opponentName}
        error={socket.error}
        onCancel={handleCancelMatchmaking}
        onAccept={handleAcceptMatch}
      />
    </div>
  );
}

function GameModeCard({
  title,
  description,
  icon,
  onClick,
  disabled,
}: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-8 bg-gradient-to-br from-space-purple/20 to-space-blue/20 border-2 border-space-purple/50 rounded-lg transition-all ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-space-cyan hover:scale-105'
      }`}
    >
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-gray-400">{description}</p>
    </button>
  );
}

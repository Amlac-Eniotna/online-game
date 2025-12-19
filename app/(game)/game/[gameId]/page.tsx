"use client";

import { EventBus } from '@/components/game/EventBus';
import { IRefPhaserGame, PhaserGame } from '@/components/game/PhaserGame';
import { useSocket } from '@/hooks/useSocket';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { gameState, playCard, attack, activateHeroPower, endTurn, disconnect } = useSocket();
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const [currentScene, setCurrentScene] = useState<Phaser.Scene | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const gameId = params.gameId as string;

  // Handle game over
  useEffect(() => {
    if (gameState?.winner) {
      setWinner(gameState.winner);
      setShowVictory(true);
    }
  }, [gameState]);

  // Update Phaser scene when game state changes
  useEffect(() => {
    if (currentScene && gameState) {
      EventBus.emit('game-state-update', gameState);
    }
  }, [currentScene, gameState]);

  // Set up EventBus listeners
  useEffect(() => {
    // Listen for game actions from Phaser
    const handlePlayCard = (data: { cardId: string; position?: number; targetId?: string }) => {
      playCard(data.cardId, data.position, data.targetId);
    };

    const handleAttack = (data: { attackerId: string; targetId: string }) => {
      attack(data.attackerId, data.targetId);
    };

    const handleUsePower = (data: { targetId?: string; position?: number }) => {
      activateHeroPower(data.targetId, data.position);
    };

    const handleEndTurn = () => {
      endTurn();
    };

    EventBus.on('play-card', handlePlayCard);
    EventBus.on('attack', handleAttack);
    EventBus.on('use-power', handleUsePower);
    EventBus.on('end-turn', handleEndTurn);

    return () => {
      EventBus.removeListener('play-card', handlePlayCard);
      EventBus.removeListener('attack', handleAttack);
      EventBus.removeListener('use-power', handleUsePower);
      EventBus.removeListener('end-turn', handleEndTurn);
    };
  }, [playCard, attack, activateHeroPower, endTurn]);

  const handleCurrentActiveScene = (scene: Phaser.Scene) => {
    setCurrentScene(scene);
  };

  const handleExitGame = () => {
    disconnect();
    router.push('/play');
  };

  const handlePlayAgain = () => {
    setShowVictory(false);
    router.push('/play');
  };

  return (
    <div className="relative w-full h-screen bg-space-dark overflow-hidden">
      {/* Phaser Game Canvas */}
      <div className="absolute inset-0">
        <PhaserGame ref={phaserRef} currentActiveScene={handleCurrentActiveScene} />
      </div>

      {/* Game UI Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={handleExitGame}
          className="px-4 py-2 bg-red-600/80 hover:bg-red-700 backdrop-blur-sm text-white rounded-lg font-bold transition-colors"
        >
          Leave Game
        </button>
      </div>

      {/* Game Info Overlay */}
      {gameState && (
        <div className="absolute top-4 right-4 z-10 space-y-2">
          <div className="bg-space-dark/80 backdrop-blur-sm border border-space-purple/50 rounded-lg p-3">
            <div className="text-sm text-gray-400">Turn {gameState.currentTurn}</div>
            <div className="text-lg font-bold text-space-cyan">
              {gameState.phase}
            </div>
            <div className="text-sm text-gray-300 mt-1">
              {gameState.currentPlayer === 'player1' ? "Your Turn" : "Opponent's Turn"}
            </div>
          </div>
        </div>
      )}

      {/* Victory/Defeat Screen */}
      {showVictory && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-gradient-to-br from-space-dark to-space-purple/20 border-2 border-space-purple/50 rounded-lg p-12 max-w-2xl w-full text-center">
            {/* Victory/Defeat Animation */}
            <div className="text-8xl mb-6 animate-bounce">
              {winner === 'player1' ? '🏆' : '💀'}
            </div>

            <h1 className={`text-6xl font-bold mb-4 ${
              winner === 'player1' ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {winner === 'player1' ? 'VICTORY!' : 'DEFEAT'}
            </h1>

            <p className="text-2xl text-gray-300 mb-8">
              {winner === 'player1'
                ? 'You have conquered the galaxy!'
                : 'Better luck next time, pilot.'}
            </p>

            {/* Game Stats */}
            {gameState && (
              <div className="bg-space-dark/50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">Battle Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Turns Played</div>
                    <div className="text-2xl font-bold text-space-cyan">{gameState.currentTurn}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Actions Taken</div>
                    <div className="text-2xl font-bold text-space-cyan">
                      {gameState.turnHistory.length}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleExitGame}
                className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-lg transition-colors"
              >
                Exit to Menu
              </button>
              <button
                onClick={handlePlayAgain}
                className="px-8 py-4 bg-gradient-to-r from-space-cyan to-space-purple hover:from-space-purple hover:to-space-cyan text-white rounded-lg font-bold text-lg transition-all shadow-lg shadow-space-cyan/50"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {!gameState && !showVictory && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-40 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-space-cyan mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Initializing battle...</p>
            <p className="text-gray-500 text-sm mt-2">Game ID: {gameId}</p>
          </div>
        </div>
      )}
    </div>
  );
}

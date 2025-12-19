/**
 * Socket.io Server for Real-time Multiplayer
 * Handles matchmaking, game rooms, and state synchronization
 */

import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import { GameEngine } from '../lib/game/game-engine';
import { createGameState, createStarterDeck } from '../lib/game/game-utils';
import type { GameState } from '../lib/game/game-types';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Matchmaking queue
const matchmakingQueue: Array<{
  socketId: string;
  userId: string;
  username: string;
  heroId: string;
  deck: any[];
}> = [];

// Active games
const activeGames = new Map<string, {
  gameId: string;
  engine: GameEngine;
  player1Socket: string;
  player2Socket: string;
}>();

// Socket to game mapping
const socketToGame = new Map<string, string>();

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Join matchmaking queue
  socket.on('join-queue', ({ userId, username, heroId, deck }) => {
    console.log(`🎮 ${username} joined matchmaking queue`);

    // Add to queue
    matchmakingQueue.push({
      socketId: socket.id,
      userId,
      username,
      heroId,
      deck: deck || [],
    });

    // Try to match
    tryMatchmaking();
  });

  // Leave queue
  socket.on('leave-queue', () => {
    const index = matchmakingQueue.findIndex(p => p.socketId === socket.id);
    if (index !== -1) {
      const player = matchmakingQueue[index];
      matchmakingQueue.splice(index, 1);
      console.log(`❌ ${player.username} left queue`);
    }
  });

  // Play card
  socket.on('play-card', ({ cardId, position, targetId }) => {
    const gameId = socketToGame.get(socket.id);
    if (!gameId) return;

    const game = activeGames.get(gameId);
    if (!game) return;

    const result = game.engine.playCard({ cardId, position, targetId });

    if (result.success) {
      // Broadcast to both players
      io.to(game.player1Socket).emit('game-update', game.engine.getState());
      io.to(game.player2Socket).emit('game-update', game.engine.getState());

      io.to(socket.id).emit('action-result', { success: true, message: result.message });
    } else {
      io.to(socket.id).emit('action-result', { success: false, message: result.message });
    }
  });

  // Attack
  socket.on('attack', ({ attackerId, targetId }) => {
    const gameId = socketToGame.get(socket.id);
    if (!gameId) return;

    const game = activeGames.get(gameId);
    if (!game) return;

    const result = game.engine.attack({ attackerId, targetId, damage: 0 });

    if (result.success) {
      io.to(game.player1Socket).emit('game-update', game.engine.getState());
      io.to(game.player2Socket).emit('game-update', game.engine.getState());

      io.to(socket.id).emit('action-result', { success: true, message: result.message });
    } else {
      io.to(socket.id).emit('action-result', { success: false, message: result.message });
    }
  });

  // Use hero power
  socket.on('use-power', ({ targetId }) => {
    const gameId = socketToGame.get(socket.id);
    if (!gameId) return;

    const game = activeGames.get(gameId);
    if (!game) return;

    const result = game.engine.useHeroPower(targetId);

    if (result.success) {
      io.to(game.player1Socket).emit('game-update', game.engine.getState());
      io.to(game.player2Socket).emit('game-update', game.engine.getState());

      io.to(socket.id).emit('action-result', { success: true, message: result.message });
    } else {
      io.to(socket.id).emit('action-result', { success: false, message: result.message });
    }
  });

  // End turn
  socket.on('end-turn', () => {
    const gameId = socketToGame.get(socket.id);
    if (!gameId) return;

    const game = activeGames.get(gameId);
    if (!game) return;

    const result = game.engine.endTurn();

    io.to(game.player1Socket).emit('game-update', game.engine.getState());
    io.to(game.player2Socket).emit('game-update', game.engine.getState());

    io.to(socket.id).emit('action-result', { success: true, message: result.message });
  });

  // Draw card
  socket.on('draw-card', () => {
    const gameId = socketToGame.get(socket.id);
    if (!gameId) return;

    const game = activeGames.get(gameId);
    if (!game) return;

    const result = game.engine.drawCard();

    if (result.success) {
      io.to(game.player1Socket).emit('game-update', game.engine.getState());
      io.to(game.player2Socket).emit('game-update', game.engine.getState());
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);

    // Remove from queue
    const queueIndex = matchmakingQueue.findIndex(p => p.socketId === socket.id);
    if (queueIndex !== -1) {
      matchmakingQueue.splice(queueIndex, 1);
    }

    // Handle game disconnect
    const gameId = socketToGame.get(socket.id);
    if (gameId) {
      const game = activeGames.get(gameId);
      if (game) {
        // Notify opponent
        const opponentSocket = game.player1Socket === socket.id ? game.player2Socket : game.player1Socket;
        io.to(opponentSocket).emit('opponent-disconnected');

        // Clean up
        socketToGame.delete(game.player1Socket);
        socketToGame.delete(game.player2Socket);
        activeGames.delete(gameId);
      }
    }
  });
});

/**
 * Try to match players in queue
 */
function tryMatchmaking() {
  if (matchmakingQueue.length < 2) return;

  // Match first two players
  const player1 = matchmakingQueue.shift()!;
  const player2 = matchmakingQueue.shift()!;

  console.log(`🎮 Matching ${player1.username} vs ${player2.username}`);

  // Create game
  const deck1 = player1.deck.length > 0 ? player1.deck : createStarterDeck();
  const deck2 = player2.deck.length > 0 ? player2.deck : createStarterDeck();

  const gameState = createGameState(
    player1.userId,
    player1.username,
    player1.heroId,
    deck1,
    player2.userId,
    player2.username,
    player2.heroId,
    deck2
  );

  const engine = new GameEngine(gameState);
  engine.startTurn();

  // Store game
  const gameId = gameState.gameId;
  activeGames.set(gameId, {
    gameId,
    engine,
    player1Socket: player1.socketId,
    player2Socket: player2.socketId,
  });

  socketToGame.set(player1.socketId, gameId);
  socketToGame.set(player2.socketId, gameId);

  // Notify both players
  io.to(player1.socketId).emit('match-found', {
    gameId,
    opponent: player2.username,
    youAre: 'player1',
    gameState: engine.getState(),
  });

  io.to(player2.socketId).emit('match-found', {
    gameId,
    opponent: player1.username,
    youAre: 'player2',
    gameState: engine.getState(),
  });

  console.log(`✅ Game started: ${gameId}`);
}

// Start server
const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
});

export { io, httpServer };

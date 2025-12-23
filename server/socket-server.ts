/**
 * Socket.io Server for Real-time Multiplayer
 * Handles matchmaking, game rooms, and state synchronization
 */

import 'dotenv/config'; // Load env vars
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { AIController } from '../lib/game/ai-controller';
import { getAIDeck } from '../lib/game/ai-decks';
import { GameEngine } from '../lib/game/game-engine';
import { createGameState, createStarterDeck } from '../lib/game/game-utils';
import { processGameRewards } from '../lib/game/rewards';
import { GameStorage } from './game-persistence';

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
  player2Socket?: string; // Optional for AI games
  aiController?: AIController; // Added for AI handling
}>();

// Socket to game mapping
const socketToGame = new Map<string, string>();

// Load persisted games on startup
const persistedGames = GameStorage.load();
persistedGames.forEach(pg => {
  const engine = new GameEngine(pg.gameState);
  let aiController: AIController | undefined;
  
  if (pg.aiDifficulty) {
    aiController = new AIController(engine, 'player2', pg.aiDifficulty);
  }

  activeGames.set(pg.gameId, {
    gameId: pg.gameId,
    engine,
    player1Socket: pg.player1Socket,
    player2Socket: pg.player2Socket,
    aiController
  });
  
  // Note: We can't restore socketToGame mapping perfectly because socket IDs change on restart.
  // The client will re-establish this mapping via 'rejoin-game'.
  console.log(`♻️  Restored game ${pg.gameId}`);
});

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



  // Join AI Game
  socket.on('join-ai-game', ({ userId, username, heroId, deck, difficulty }) => {
    console.log(`🤖 ${username} starting AI game (${difficulty})`);
    
    // Create AI Deck
    const aiDeckObj = getAIDeck(difficulty);
    
    // Player Deck
    const playerDeck = deck && deck.length > 0 ? deck : createStarterDeck();

    const gameState = createGameState(
      userId,
      username,
      heroId,
      playerDeck,
      'ai-opponent',
      aiDeckObj.name,
      aiDeckObj.heroId,
      aiDeckObj.cards // Already shuffled in createGameState if needed, but we pass raw list
    );

    const engine = new GameEngine(gameState);
    
    // Player 1 is always human in this context, AI is player2
    // Force player 1 to start for better UX in single player? 
    // Or keep random. Let's keep random but handle AI start.

    const aiController = new AIController(engine, 'player2', difficulty);

    const gameId = gameState.gameId;
    activeGames.set(gameId, {
      gameId,
      engine,
      player1Socket: socket.id,
      aiController
    });

    socketToGame.set(socket.id, gameId);

    // Notify player
    socket.emit('match-found', {
      gameId,
      opponent: aiDeckObj.name,
      youAre: 'player1',
      gameState: engine.getState(),
      isAiGame: true
    });

    console.log(`✅ AI Game started: ${gameId}`);

    // Delay game start to allow "Match Found" animation
    setTimeout(() => {
        socket.emit('game-start', { gameState: engine.getState() });
        GameStorage.save(activeGames); // Save state
        
        // If AI starts, trigger AI turn
        if (gameState.currentPlayer === 'player2') {
           handleAITurn(gameId, engine, aiController, socket.id);
        }
    }, 4000); // 4 seconds (3s countdown + buffer)
  });

  // Rejoin Game
  socket.on('rejoin-game', ({ gameId, userId }) => {
    console.log(`🔄 User ${userId} attempting to rejoin game ${gameId}`);
    
    const game = activeGames.get(gameId);
    if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
    }

    // Determine if player 1, 2, or spectator (for now just players)
    const engine = game.engine;
    const state = engine.getState();
    
    let isPlayer1 = false;
    let isPlayer2 = false;

    if (state.player1.id === userId) {
        isPlayer1 = true;
        game.player1Socket = socket.id; // Update socket ID
    } else if (state.player2.id === userId) {
        isPlayer2 = true;
        game.player2Socket = socket.id; // Update socket ID
    } else {
        socket.emit('error', { message: 'You are not in this game' });
        return;
    }

    socketToGame.set(socket.id, gameId);

    // Send current state
    socket.emit('game-update', state);
    
    console.log(`✅ User ${userId} rejoined game ${gameId}`);
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
      if (game.player2Socket) io.to(game.player2Socket).emit('game-update', game.engine.getState());

      io.to(socket.id).emit('action-result', { success: true, message: result.message });
      GameStorage.save(activeGames); // Save state
      
      checkGameOver(gameId, game);
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
      if (game.player2Socket) io.to(game.player2Socket).emit('game-update', game.engine.getState());

      io.to(socket.id).emit('action-result', { success: true, message: result.message });
      GameStorage.save(activeGames); // Save state
      
      checkGameOver(gameId, game);
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
      if (game.player2Socket) io.to(game.player2Socket).emit('game-update', game.engine.getState());

      io.to(socket.id).emit('action-result', { success: true, message: result.message });
      GameStorage.save(activeGames); // Save state

      checkGameOver(gameId, game);
    } else {
      io.to(socket.id).emit('action-result', { success: false, message: result.message });
    }
  });

  // End turn
  socket.on('end-turn', async () => {
    const gameId = socketToGame.get(socket.id);
    if (!gameId) return;

    const game = activeGames.get(gameId);
    if (!game) return;

    const result = game.engine.endTurn();

    io.to(game.player1Socket).emit('game-update', game.engine.getState());
    if (game.player2Socket) io.to(game.player2Socket).emit('game-update', game.engine.getState());

    io.to(socket.id).emit('action-result', { success: true, message: result.message });
    GameStorage.save(activeGames); // Save state

    // If vs AI, trigger AI turn after player ends turn
    if (game.aiController && game.engine.getState().currentPlayer === 'player2') {
        const aiResult = await handleAITurn(gameId, game.engine, game.aiController, game.player1Socket);
        if (aiResult) checkGameOver(gameId, game);
    }
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
      if (game.player2Socket) io.to(game.player2Socket).emit('game-update', game.engine.getState());
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
        // Notify opponent
        const opponentSocket = game.player1Socket === socket.id ? game.player2Socket : game.player1Socket;
        if (opponentSocket) io.to(opponentSocket).emit('opponent-disconnected');

        // Clean up
        socketToGame.delete(game.player1Socket);
        if (game.player2Socket) socketToGame.delete(game.player2Socket);
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

  // Delay game start to allow "Match Found" animation
  setTimeout(() => {
    io.to(player1.socketId).emit('game-start', { gameState: engine.getState() });
    io.to(player2.socketId).emit('game-start', { gameState: engine.getState() });
    GameStorage.save(activeGames); // Save state
  }, 4000);
}

async function handleAITurn(gameId: string, engine: GameEngine, ai: AIController, playerSocket: string) {
    console.log(`🤖 AI playing turn for game ${gameId}`);
    
    // Start AI turn logic
    await ai.playTurn();
    
    // Broadcast final state after AI finishes
    io.to(playerSocket).emit('game-update', engine.getState());
    return true; // Turn finished
}

function checkGameOver(gameId: string, game: any) {
    const state = game.engine.getState();
    if (state.winner) {
        // Game Over!
        console.log(`🏆 Game Over: ${gameId} - Winner: ${state.winner}`);
        
        const winnerId = state.winner === 'player1' ? state.player1.id : state.player2.id;
        const loserId = state.winner === 'player1' ? state.player2.id : state.player1.id;
        
        // Process rewards
        processGameRewards({
            gameId,
            winnerId,
            loserId,
            isAiGame: !!game.aiController,
            aiDifficulty: game.aiController ? (game.aiController as any).difficulty : undefined,
            turns: state.currentTurn
        });

        // Notify players
        const gameOverData = {
            winner: state.winner,
            reason: 'Health depleted' // Simplify for now
        };

        io.to(game.player1Socket).emit('game-over', gameOverData);
        if (game.player2Socket) io.to(game.player2Socket).emit('game-over', gameOverData);

        // Remove from active games
        socketToGame.delete(game.player1Socket);
        if (game.player2Socket) socketToGame.delete(game.player2Socket);
        activeGames.delete(gameId);
    }
}

// Start server
const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
});

export { httpServer, io };


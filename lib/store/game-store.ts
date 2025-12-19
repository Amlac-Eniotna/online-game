import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Game state types
export interface Card {
  id: string;
  name: string;
  type: 'CREATURE' | 'SPELL' | 'EQUIPMENT' | 'TRAP';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  cost: number;
  attack?: number;
  health?: number;
  effect?: string;
  imageUrl?: string;
}

export interface Creature extends Card {
  type: 'CREATURE';
  currentHealth: number;
  equipments: Equipment[];
  position: number; // 0-4 board position
}

export interface Equipment extends Card {
  type: 'EQUIPMENT';
  attachedTo?: string; // creature ID
}

export interface Player {
  id: string;
  username: string;
  heroId: string;
  health: number;
  maxHealth: number;
  hand: Card[];
  deck: Card[];
  board: (Creature | null)[]; // 5 slots
  graveyard: Card[];
  cardsPlayedThisTurn: number;
  hasDrawn: boolean;
}

export interface GameState {
  gameId: string | null;
  currentTurn: number;
  currentPlayer: 'player1' | 'player2';
  player1: Player | null;
  player2: Player | null;
  gamePhase: 'WAITING' | 'MULLIGAN' | 'PLAYING' | 'ENDED';
  winner: string | null;

  // Actions
  setGameState: (state: Partial<GameState>) => void;
  playCard: (cardId: string, targetPosition?: number) => void;
  attackWithCreature: (creaturePosition: number, target: 'hero' | number) => void;
  endTurn: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  devtools(
    (set) => ({
      gameId: null,
      currentTurn: 1,
      currentPlayer: 'player1',
      player1: null,
      player2: null,
      gamePhase: 'WAITING',
      winner: null,

      setGameState: (state) => set(state),

      playCard: (cardId, targetPosition) => {
        // Game logic will be implemented here
        console.log('Playing card:', cardId, targetPosition);
      },

      attackWithCreature: (creaturePosition, target) => {
        console.log('Attacking with creature at:', creaturePosition, 'target:', target);
      },

      endTurn: () => set((state) => ({
        currentTurn: state.currentTurn + 1,
        currentPlayer: state.currentPlayer === 'player1' ? 'player2' : 'player1',
      })),

      resetGame: () => set({
        gameId: null,
        currentTurn: 1,
        currentPlayer: 'player1',
        player1: null,
        player2: null,
        gamePhase: 'WAITING',
        winner: null,
      }),
    }),
    { name: 'GameStore' }
  )
);

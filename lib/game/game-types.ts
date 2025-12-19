/**
 * Core game types for Madness Rumble Space
 */

export interface Card {
  id: string;
  name: string;
  type: 'CREATURE' | 'SPELL' | 'EQUIPMENT' | 'TRAP';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC' | 'SEASONAL';
  cost: number;
  attack?: number;
  health?: number;
  effect?: string;
  effectCode: string;
  heroEffects?: Record<string, string>;
  imageUrl?: string;
  flavorText?: string;
}

export interface Creature extends Card {
  type: 'CREATURE';
  attack: number;
  health: number;
  currentHealth: number;
  equipments: Equipment[];
  position: number; // 0-4
  canAttack: boolean;
  stunned?: boolean;
  tempBuffs?: Array<{ type: string; value: number }>;
}

export interface Equipment extends Card {
  type: 'EQUIPMENT';
  attachedTo?: string; // creature ID
}

export interface Spell extends Card {
  type: 'SPELL';
}

export interface Trap extends Card {
  type: 'TRAP';
  isRevealed: boolean;
  triggerCondition: string;
}

export interface Hero {
  id: string;
  name: string;
  class: string;
  powerName: string;
  powerEffect: string;
  powerCost: number;
  powerCode: string;
  baseHealth: number;
}

export interface Player {
  id: string;
  username: string;
  heroId: string;
  hero: Hero;
  health: number;
  maxHealth: number;
  hand: Card[];
  deck: Card[];
  board: (Creature | null)[]; // 5 slots
  graveyard: Card[];
  traps: Trap[];
  cardsPlayedThisTurn: number;
  hasDrawn: boolean;
  powerUsedThisTurn: boolean;
}

export type GamePhase =
  | 'WAITING'
  | 'MULLIGAN'
  | 'DRAW'
  | 'MAIN'
  | 'COMBAT'
  | 'END'
  | 'ENDED';

export interface GameState {
  gameId: string;
  currentTurn: number;
  currentPlayer: 'player1' | 'player2';
  phase: GamePhase;
  player1: Player;
  player2: Player;
  winner: string | null;
  turnHistory: TurnAction[];
}

export interface TurnAction {
  turn: number;
  player: string;
  action: 'DRAW' | 'PLAY_CARD' | 'ATTACK' | 'USE_POWER' | 'END_TURN';
  cardId?: string;
  targetId?: string;
  details?: any;
  timestamp: number;
}

export interface AttackAction {
  attackerId: string; // creature ID
  targetId: string; // creature ID or 'hero'
  damage: number;
  isFirstStrike?: boolean;
}

export interface PlayCardAction {
  cardId: string;
  position?: number; // For creatures
  targetId?: string; // For spells/equipments
}

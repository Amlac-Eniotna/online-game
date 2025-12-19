/**
 * Utility functions for game initialization and helpers
 */

import { GameState, Player, Card, Creature, Hero } from './game-types';
import { CARDS } from './cards-data';
import { HEROES } from './heroes-data';

/**
 * Create a new game state
 */
export function createGameState(
  player1Id: string,
  player1Username: string,
  player1HeroId: string,
  player1Deck: Card[],
  player2Id: string,
  player2Username: string,
  player2HeroId: string,
  player2Deck: Card[]
): GameState {
  const player1Hero = HEROES.find(h => h.id === player1HeroId);
  const player2Hero = HEROES.find(h => h.id === player2HeroId);

  if (!player1Hero || !player2Hero) {
    throw new Error('Invalid hero selection');
  }

  const player1: Player = {
    id: player1Id,
    username: player1Username,
    heroId: player1HeroId,
    hero: player1Hero as any,
    health: 20,
    maxHealth: 20,
    hand: [],
    deck: shuffleDeck([...player1Deck]),
    board: [null, null, null, null, null],
    graveyard: [],
    traps: [],
    cardsPlayedThisTurn: 0,
    hasDrawn: false,
    powerUsedThisTurn: false,
  };

  const player2: Player = {
    id: player2Id,
    username: player2Username,
    heroId: player2HeroId,
    hero: player2Hero as any,
    health: 20,
    maxHealth: 20,
    hand: [],
    deck: shuffleDeck([...player2Deck]),
    board: [null, null, null, null, null],
    graveyard: [],
    traps: [],
    cardsPlayedThisTurn: 0,
    hasDrawn: false,
    powerUsedThisTurn: false,
  };

  // Draw initial hands (3 cards each)
  for (let i = 0; i < 3; i++) {
    if (player1.deck.length > 0) {
      player1.hand.push(player1.deck.shift()!);
    }
    if (player2.deck.length > 0) {
      player2.hand.push(player2.deck.shift()!);
    }
  }

  return {
    gameId: `game-${Date.now()}`,
    currentTurn: 1,
    currentPlayer: Math.random() < 0.5 ? 'player1' : 'player2', // Random first player
    phase: 'DRAW',
    player1,
    player2,
    winner: null,
    turnHistory: [],
  };
}

/**
 * Shuffle a deck
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create a starter deck (10 random common cards)
 */
export function createStarterDeck(): Card[] {
  const commonCards = CARDS.filter(c => c.rarity === 'COMMON');
  const deck: Card[] = [];

  for (let i = 0; i < 10; i++) {
    const randomCard = commonCards[Math.floor(Math.random() * commonCards.length)];
    deck.push({
      ...randomCard,
      id: `${randomCard.name}-${Date.now()}-${i}`,
    } as Card);
  }

  return deck;
}

/**
 * Clone card data (for creating instances)
 */
export function cloneCard(card: Card): Card {
  return {
    ...card,
    id: `${card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}

/**
 * Get card by name from the card pool
 */
export function getCardByName(name: string): Card | undefined {
  return CARDS.find(c => c.name === name);
}

/**
 * Get hero by ID
 */
export function getHeroById(id: string): Hero | undefined {
  return HEROES.find(h => h.id === id) as any;
}

/**
 * Calculate damage with modifiers
 */
export function calculateDamage(
  baseAttack: number,
  attacker: Creature,
  defender?: Creature
): number {
  let damage = baseAttack;

  // Execute mechanic (double damage to damaged creatures)
  if (attacker.effectCode === 'EXECUTE' && defender && defender.currentHealth < defender.health) {
    damage *= 2;
  }

  // Equipment bonuses
  attacker.equipments.forEach(eq => {
    if (eq.effectCode.includes('ATTACK_2_EXECUTE') && defender && defender.currentHealth < defender.health) {
      damage *= 2;
    }
  });

  return damage;
}

/**
 * Check if creature has keyword
 */
export function hasKeyword(creature: Creature, keyword: string): boolean {
  if (creature.effectCode.includes(keyword)) {
    return true;
  }

  return creature.equipments.some(eq => eq.effectCode.includes(keyword));
}

/**
 * Format game state for display (debug)
 */
export function formatGameState(state: GameState): string {
  return `
=== MERC DECK MADNESS - GAME STATE ===
Turn: ${state.currentTurn} | Phase: ${state.phase} | Current Player: ${state.currentPlayer}

PLAYER 1: ${state.player1.username} (${state.player1.hero.name})
  HP: ${state.player1.health}/${state.player1.maxHealth}
  Hand: ${state.player1.hand.length} cards
  Deck: ${state.player1.deck.length} cards
  Board: ${state.player1.board.filter(c => c !== null).length}/5 creatures

PLAYER 2: ${state.player2.username} (${state.player2.hero.name})
  HP: ${state.player2.health}/${state.player2.maxHealth}
  Hand: ${state.player2.hand.length} cards
  Deck: ${state.player2.deck.length} cards
  Board: ${state.player2.board.filter(c => c !== null).length}/5 creatures

${state.winner ? `WINNER: ${state.winner}` : ''}
====================================
  `.trim();
}

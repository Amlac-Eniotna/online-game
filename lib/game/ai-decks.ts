import { CARDS } from './cards-data';
import { Card } from './game-types';
import { createStarterDeck } from './game-utils';

export interface AIDeck {
  id: string;
  name: string;
  heroId: string;
  cards: Card[];
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Get AI deck by difficulty
 */
export function getAIDeck(difficulty: 'easy' | 'medium' | 'hard'): AIDeck {
  switch (difficulty) {
    case 'hard':
      return createHardDeck();
    case 'medium':
      return createMediumDeck();
    case 'easy':
    default:
      return createEasyDeck();
  }
}

/**
 * Easy Deck - Basic Starter Deck
 * Hero: Tank Brute (Simple, forgiving)
 */
function createEasyDeck(): AIDeck {
  return {
    id: 'ai-deck-easy',
    name: 'Training Dummy',
    heroId: 'tank-brute',
    cards: createStarterDeck(),
    difficulty: 'easy',
  };
}

/**
 * Medium Deck - Balanced Aggro
 * Hero: Jetpack Junkie (Fast, aggressive)
 */
function createMediumDeck(): AIDeck {
  // Filter for lower cost cards for better curve
  const aggroCards = CARDS.filter(c => c.cost <= 3);
  const deck: Card[] = [];
  
  for (let i = 0; i < 10; i++) {
    const randomCard = aggroCards[Math.floor(Math.random() * aggroCards.length)];
    deck.push({
      ...randomCard,
      id: `${randomCard.name}-${Date.now()}-${i}`,
    } as Card);
  }

  return {
    id: 'ai-deck-medium',
    name: 'Aggro Bot',
    heroId: 'jetpack-junkie',
    cards: deck,
    difficulty: 'medium',
  };
}

/**
 * Hard Deck - Control/Value
 * Hero: Drone Master (Token generation)
 */
function createHardDeck(): AIDeck {
  // Mix of removal and high value cards
  const controlCards = CARDS.filter(c => c.type === 'SPELL' || c.cost >= 4 || c.rarity === 'LEGENDARY');
  
  // Fallback if not enough specific cards
  const pool = controlCards.length > 5 ? controlCards : CARDS;
  
  const deck: Card[] = [];
  
  for (let i = 0; i < 10; i++) {
    const randomCard = pool[Math.floor(Math.random() * pool.length)];
    deck.push({
      ...randomCard,
      id: `${randomCard.name}-${Date.now()}-${i}`,
    } as Card);
  }

  return {
    id: 'ai-deck-hard',
    name: 'Skynet Prototype',
    heroId: 'drone-master',
    cards: deck,
    difficulty: 'hard',
  };
}

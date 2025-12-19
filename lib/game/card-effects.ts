/**
 * Card Effect System
 * Handles all card effects and their execution
 */

import { GameState, Card, Creature } from './game-types';

export interface EffectContext {
  game: GameState;
  source: Card;
  target?: Card | 'hero';
  targetPlayerId?: string;
  heroId?: string; // For hero-specific effects
}

export interface EffectResult {
  success: boolean;
  message?: string;
  gameState: GameState;
}

/**
 * Card Effect Registry
 * Maps effectCode to effect function
 */
export const CARD_EFFECTS: Record<string, (ctx: EffectContext) => EffectResult> = {
  // ==========================================
  // NO EFFECT
  // ==========================================
  NONE: (ctx) => ({
    success: true,
    gameState: ctx.game,
  }),

  // ==========================================
  // CREATURE KEYWORDS
  // ==========================================
  FIRST_STRIKE: (ctx) => ({
    success: true,
    message: 'This creature has First Strike',
    gameState: ctx.game,
  }),

  TAUNT: (ctx) => ({
    success: true,
    message: 'Enemy creatures must attack this creature first',
    gameState: ctx.game,
  }),

  SPELL_IMMUNE: (ctx) => ({
    success: true,
    message: 'Cannot be targeted by spells',
    gameState: ctx.game,
  }),

  EVASION: (ctx) => ({
    success: true,
    message: 'Cannot be blocked by creatures with 2 or less attack',
    gameState: ctx.game,
  }),

  // ==========================================
  // ON SUMMON EFFECTS
  // ==========================================
  DRAW_ON_SUMMON: (ctx) => {
    const newGame = { ...ctx.game };
    const currentPlayer = newGame[newGame.currentPlayer];

    // Draw 1 card
    if (currentPlayer.deck.length > 0) {
      const drawnCard = currentPlayer.deck.shift()!;
      currentPlayer.hand.push(drawnCard);

      return {
        success: true,
        message: 'Drew 1 card',
        gameState: newGame,
      };
    }

    return {
      success: false,
      message: 'No cards in deck',
      gameState: ctx.game,
    };
  },

  COPY_STATS: (ctx) => {
    // Copy stats of target creature
    if (!ctx.target || ctx.target === 'hero') {
      return { success: false, message: 'Invalid target', gameState: ctx.game };
    }

    const newGame = { ...ctx.game };
    const targetCreature = ctx.target as Creature;
    const sourceCreature = ctx.source as Creature;

    sourceCreature.attack = targetCreature.attack;
    sourceCreature.health = targetCreature.health;
    sourceCreature.currentHealth = targetCreature.health;

    return {
      success: true,
      message: `Copied stats: ${targetCreature.attack}/${targetCreature.health}`,
      gameState: newGame,
    };
  },

  BOARD_CLEAR_ON_SUMMON: (ctx) => {
    const newGame = { ...ctx.game };

    // Destroy all other creatures
    newGame.player1.board = newGame.player1.board.map((creature, idx) => {
      if (creature && creature.id !== ctx.source.id) {
        newGame.player1.graveyard.push(creature);
        return null;
      }
      return creature;
    });

    newGame.player2.board = newGame.player2.board.map((creature, idx) => {
      if (creature && creature.id !== ctx.source.id) {
        newGame.player2.graveyard.push(creature);
        return null;
      }
      return creature;
    });

    return {
      success: true,
      message: 'Destroyed all other creatures',
      gameState: newGame,
    };
  },

  // ==========================================
  // ON ATTACK EFFECTS
  // ==========================================
  AOE_ON_ATTACK: (ctx) => {
    const newGame = { ...ctx.game };

    // Deal 1 damage to all other creatures
    const dealDamageToBoard = (board: (Creature | null)[]) => {
      return board.map(creature => {
        if (creature && creature.id !== ctx.source.id) {
          creature.currentHealth -= 1;
          if (creature.currentHealth <= 0) {
            return null;
          }
        }
        return creature;
      });
    };

    newGame.player1.board = dealDamageToBoard(newGame.player1.board);
    newGame.player2.board = dealDamageToBoard(newGame.player2.board);

    return {
      success: true,
      message: 'Dealt 1 damage to all other creatures',
      gameState: newGame,
    };
  },

  LIFESTEAL: (ctx) => {
    const newGame = { ...ctx.game };
    const currentPlayer = newGame[newGame.currentPlayer];

    // Restore 2 health to hero
    currentPlayer.health = Math.min(currentPlayer.health + 2, currentPlayer.maxHealth);

    return {
      success: true,
      message: 'Restored 2 health',
      gameState: newGame,
    };
  },

  // ==========================================
  // TRIGGERED EFFECTS
  // ==========================================
  GROW_ON_DEATH: (ctx) => {
    const sourceCreature = ctx.source as Creature;
    sourceCreature.attack += 1;
    sourceCreature.health += 1;
    sourceCreature.currentHealth += 1;

    return {
      success: true,
      message: 'Gained +1/+1',
      gameState: ctx.game,
    };
  },

  // ==========================================
  // SPELL EFFECTS
  // ==========================================
  DAMAGE_3: (ctx) => {
    const newGame = { ...ctx.game };

    if (!ctx.target) {
      return { success: false, message: 'No target', gameState: ctx.game };
    }

    if (ctx.target === 'hero') {
      const targetPlayer = newGame[ctx.targetPlayerId as 'player1' | 'player2'];
      targetPlayer.health -= 3;

      return {
        success: true,
        message: 'Dealt 3 damage to hero',
        gameState: newGame,
      };
    } else {
      const targetCreature = ctx.target as Creature;
      targetCreature.currentHealth -= 3;

      return {
        success: true,
        message: 'Dealt 3 damage',
        gameState: newGame,
      };
    }
  },

  BUFF_HEALTH_4: (ctx) => {
    if (!ctx.target || ctx.target === 'hero') {
      return { success: false, message: 'Invalid target', gameState: ctx.game };
    }

    const targetCreature = ctx.target as Creature;
    targetCreature.health += 4;
    targetCreature.currentHealth += 4;

    return {
      success: true,
      message: 'Gained +0/+4',
      gameState: ctx.game,
    };
  },

  BUFF_2_2: (ctx) => {
    if (!ctx.target || ctx.target === 'hero') {
      return { success: false, message: 'Invalid target', gameState: ctx.game };
    }

    const targetCreature = ctx.target as Creature;
    targetCreature.attack += 2;
    targetCreature.health += 2;
    targetCreature.currentHealth += 2;

    return {
      success: true,
      message: 'Gained +2/+2',
      gameState: ctx.game,
    };
  },

  BUFF_ATTACK_3_TEMP: (ctx) => {
    if (!ctx.target || ctx.target === 'hero') {
      return { success: false, message: 'Invalid target', gameState: ctx.game };
    }

    const newGame = { ...ctx.game };
    const targetCreature = ctx.target as Creature;

    // Add temporary buff (will be removed at end of turn)
    targetCreature.attack += 3;

    // Track temporary buffs
    if (!targetCreature.tempBuffs) {
      (targetCreature as any).tempBuffs = [];
    }
    (targetCreature as any).tempBuffs.push({ type: 'attack', value: 3 });

    return {
      success: true,
      message: 'Gained +3/+0 this turn',
      gameState: newGame,
    };
  },

  DRAW_2: (ctx) => {
    const newGame = { ...ctx.game };
    const currentPlayer = newGame[newGame.currentPlayer];

    let drawn = 0;
    for (let i = 0; i < 2; i++) {
      if (currentPlayer.deck.length > 0) {
        const card = currentPlayer.deck.shift()!;
        currentPlayer.hand.push(card);
        drawn++;
      }
    }

    return {
      success: true,
      message: `Drew ${drawn} cards`,
      gameState: newGame,
    };
  },

  HEAL_5: (ctx) => {
    const newGame = { ...ctx.game };

    if (!ctx.target) {
      return { success: false, message: 'No target', gameState: ctx.game };
    }

    if (ctx.target === 'hero') {
      const targetPlayer = newGame[ctx.targetPlayerId as 'player1' | 'player2'];
      targetPlayer.health = Math.min(targetPlayer.health + 5, targetPlayer.maxHealth);

      return {
        success: true,
        message: 'Restored 5 health to hero',
        gameState: newGame,
      };
    } else {
      const targetCreature = ctx.target as Creature;
      targetCreature.currentHealth = Math.min(targetCreature.currentHealth + 5, targetCreature.health);

      return {
        success: true,
        message: 'Restored 5 health',
        gameState: newGame,
      };
    }
  },

  DESTROY_CREATURE: (ctx) => {
    if (!ctx.target || ctx.target === 'hero') {
      return { success: false, message: 'Invalid target', gameState: ctx.game };
    }

    const newGame = { ...ctx.game };
    const targetCreature = ctx.target as Creature;

    // Find and remove creature from board
    const removeFromBoard = (board: (Creature | null)[]) => {
      return board.map(c => c && c.id === targetCreature.id ? null : c);
    };

    newGame.player1.board = removeFromBoard(newGame.player1.board);
    newGame.player2.board = removeFromBoard(newGame.player2.board);

    // Add to graveyard
    const owner = newGame.player1.board.some(c => c?.id === targetCreature.id) ? newGame.player1 : newGame.player2;
    owner.graveyard.push(targetCreature);

    return {
      success: true,
      message: 'Destroyed creature',
      gameState: newGame,
    };
  },

  AOE_DAMAGE_5: (ctx) => {
    const newGame = { ...ctx.game };

    const dealDamageToBoard = (board: (Creature | null)[], graveyard: Card[]) => {
      return board.map(creature => {
        if (creature) {
          creature.currentHealth -= 5;
          if (creature.currentHealth <= 0) {
            graveyard.push(creature);
            return null;
          }
        }
        return creature;
      });
    };

    newGame.player1.board = dealDamageToBoard(newGame.player1.board, newGame.player1.graveyard);
    newGame.player2.board = dealDamageToBoard(newGame.player2.board, newGame.player2.graveyard);

    return {
      success: true,
      message: 'Dealt 5 damage to all creatures',
      gameState: newGame,
    };
  },

  STUN: (ctx) => {
    if (!ctx.target || ctx.target === 'hero') {
      return { success: false, message: 'Invalid target', gameState: ctx.game };
    }

    const targetCreature = ctx.target as Creature;
    (targetCreature as any).stunned = true;

    return {
      success: true,
      message: 'Creature stunned for 1 turn',
      gameState: ctx.game,
    };
  },

  BOUNCE_DRAW: (ctx) => {
    if (!ctx.target || ctx.target === 'hero') {
      return { success: false, message: 'Invalid target', gameState: ctx.game };
    }

    const newGame = { ...ctx.game };
    const targetCreature = ctx.target as Creature;
    const currentPlayer = newGame[newGame.currentPlayer];

    // Remove from board
    const removeFromBoard = (board: (Creature | null)[]) => {
      return board.map(c => c && c.id === targetCreature.id ? null : c);
    };

    newGame.player1.board = removeFromBoard(newGame.player1.board);
    newGame.player2.board = removeFromBoard(newGame.player2.board);

    // Add to hand
    currentPlayer.hand.push(targetCreature);

    // Draw 1 card
    if (currentPlayer.deck.length > 0) {
      const card = currentPlayer.deck.shift()!;
      currentPlayer.hand.push(card);
    }

    return {
      success: true,
      message: 'Returned to hand and drew 1 card',
      gameState: newGame,
    };
  },

  EXTRA_TURN: (ctx) => {
    const newGame = { ...ctx.game };
    (newGame as any).extraTurn = true;

    return {
      success: true,
      message: 'You get an extra turn!',
      gameState: newGame,
    };
  },

  BOUNCE_ALL: (ctx) => {
    const newGame = { ...ctx.game };

    // Return all creatures to hands
    newGame.player1.board.forEach(creature => {
      if (creature) newGame.player1.hand.push(creature);
    });
    newGame.player2.board.forEach(creature => {
      if (creature) newGame.player2.hand.push(creature);
    });

    newGame.player1.board = [null, null, null, null, null];
    newGame.player2.board = [null, null, null, null, null];

    return {
      success: true,
      message: 'All creatures returned to hands',
      gameState: newGame,
    };
  },

  // ==========================================
  // EQUIPMENT EFFECTS (handled separately)
  // ==========================================
  EQUIP_ATTACK_2_FIRST_STRIKE: (ctx) => ({
    success: true,
    message: '+2 Attack and First Strike',
    gameState: ctx.game,
  }),

  EQUIP_HEALTH_3_SPELL_IMMUNE: (ctx) => ({
    success: true,
    message: '+3 Health and Spell Immunity',
    gameState: ctx.game,
  }),

  EQUIP_ATTACK_3_STUN: (ctx) => ({
    success: true,
    message: '+3 Attack and Stun on attack',
    gameState: ctx.game,
  }),

  EQUIP_1_1_EVASION: (ctx) => ({
    success: true,
    message: '+1/+1 and Evasion',
    gameState: ctx.game,
  }),

  EQUIP_HEALTH_4_REGEN: (ctx) => ({
    success: true,
    message: '+4 Health and Regeneration',
    gameState: ctx.game,
  }),

  EQUIP_1_2: (ctx) => ({
    success: true,
    message: '+1/+2',
    gameState: ctx.game,
  }),

  EQUIP_ATTACK_2_EXECUTE: (ctx) => ({
    success: true,
    message: '+2 Attack and Execute',
    gameState: ctx.game,
  }),

  EQUIP_3_3_AOE: (ctx) => ({
    success: true,
    message: '+3/+3 and AoE on attack',
    gameState: ctx.game,
  }),

  // ==========================================
  // TRAP EFFECTS
  // ==========================================
  TRAP_DAMAGE_ON_SUMMON: (ctx) => ({
    success: true,
    message: 'Trap set: Deal 2 damage when opponent summons',
    gameState: ctx.game,
  }),

  TRAP_COUNTER_SPELL: (ctx) => ({
    success: true,
    message: 'Trap set: Counter next spell',
    gameState: ctx.game,
  }),

  TRAP_DESTROY_ATTACKER: (ctx) => ({
    success: true,
    message: 'Trap set: Destroy next attacker',
    gameState: ctx.game,
  }),

  TRAP_BOUNCE_CREATURE: (ctx) => ({
    success: true,
    message: 'Trap set: Bounce next creature',
    gameState: ctx.game,
  }),

  TRAP_DAMAGE_ON_HIT: (ctx) => ({
    success: true,
    message: 'Trap set: Deal 3 damage when hit',
    gameState: ctx.game,
  }),

  // ==========================================
  // HERO-SYNERGY EFFECTS
  // ==========================================
  ROCKET_FUEL: (ctx) => {
    if (!ctx.target || ctx.target === 'hero') {
      return { success: false, message: 'Invalid target', gameState: ctx.game };
    }

    const newGame = { ...ctx.game };
    const targetCreature = ctx.target as Creature;

    // Check hero-specific effects
    if (ctx.heroId === 'jetpack-junkie') {
      // Give all creatures +1/+0
      const currentPlayer = newGame[newGame.currentPlayer];
      currentPlayer.board.forEach(creature => {
        if (creature) creature.attack += 1;
      });

      return {
        success: true,
        message: 'All creatures gained +1/+0',
        gameState: newGame,
      };
    } else if (ctx.heroId === 'rocket-maniac') {
      // Deal 3 damage to target
      targetCreature.currentHealth -= 3;

      return {
        success: true,
        message: 'Dealt 3 damage',
        gameState: newGame,
      };
    } else {
      // Default: +2/+0 this turn
      targetCreature.attack += 2;

      return {
        success: true,
        message: 'Gained +2/+0 this turn',
        gameState: newGame,
      };
    }
  },

  // Add more hero-synergy effects...
  EXPLOSIVE_ROUND: (ctx) => ({ success: true, gameState: ctx.game }),
  NANO_SWARM: (ctx) => ({ success: true, gameState: ctx.game }),
  SABOTAGE: (ctx) => ({ success: true, gameState: ctx.game }),
  THERMAL_CHARGE: (ctx) => ({ success: true, gameState: ctx.game }),
  FORTIFY: (ctx) => ({ success: true, gameState: ctx.game }),
  STEALTH: (ctx) => ({ success: true, gameState: ctx.game }),
  ARTILLERY: (ctx) => ({ success: true, gameState: ctx.game }),
  COMBAT_STIMS: (ctx) => ({ success: true, gameState: ctx.game }),
  TECH_UPGRADE: (ctx) => ({ success: true, gameState: ctx.game }),
};

/**
 * Execute a card effect
 */
export function executeCardEffect(ctx: EffectContext): EffectResult {
  const effectFn = CARD_EFFECTS[ctx.source.effectCode];

  if (!effectFn) {
    console.warn(`Unknown effect code: ${ctx.source.effectCode}`);
    return {
      success: false,
      message: 'Unknown effect',
      gameState: ctx.game,
    };
  }

  return effectFn(ctx);
}

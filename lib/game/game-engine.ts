/**
 * Core Game Engine for Madness Rumble Space
 * Handles game state, turns, and action resolution
 */

import {
  GameState,
  Player,
  Card,
  Creature,
  Equipment,
  Spell,
  Trap,
  GamePhase,
  TurnAction,
  PlayCardAction,
  AttackAction,
} from './game-types';
import { executeCardEffect } from './card-effects';

export class GameEngine {
  private state: GameState;

  constructor(initialState: GameState) {
    this.state = initialState;
  }

  getState(): GameState {
    return this.state;
  }

  setState(newState: GameState) {
    this.state = newState;
  }

  // ==========================================
  // TURN PHASES
  // ==========================================

  /**
   * Start of turn
   */
  startTurn(): { success: boolean; message: string } {
    const player = this.getCurrentPlayer();

    // Reset turn-specific values
    player.cardsPlayedThisTurn = 0;
    player.hasDrawn = false;
    player.powerUsedThisTurn = false;

    // Reset creature attack availability
    player.board.forEach(creature => {
      if (creature) {
        creature.canAttack = true;
        creature.stunned = false;
      }
    });

    // Change phase to DRAW
    this.state.phase = 'DRAW';

    this.logAction({
      turn: this.state.currentTurn,
      player: player.id,
      action: 'DRAW',
      timestamp: Date.now(),
    });

    return {
      success: true,
      message: `Turn ${this.state.currentTurn} started`,
    };
  }

  /**
   * Draw phase
   */
  drawCard(): { success: boolean; message: string; card?: Card } {
    const player = this.getCurrentPlayer();

    if (player.hasDrawn) {
      return { success: false, message: 'Already drawn this turn' };
    }

    if (player.deck.length === 0) {
      // Deck out - player loses
      this.endGame(this.getOpponentPlayerId());
      return { success: false, message: 'Deck is empty - you lose!' };
    }

    const card = player.deck.shift()!;
    player.hand.push(card);
    player.hasDrawn = true;

    // Move to MAIN phase
    this.state.phase = 'MAIN';

    return {
      success: true,
      message: `Drew ${card.name}`,
      card,
    };
  }

  /**
   * Skip draw to play 3 cards instead of 2
   */
  skipDraw(): { success: boolean; message: string } {
    const player = this.getCurrentPlayer();

    if (player.hasDrawn) {
      return { success: false, message: 'Already drawn this turn' };
    }

    player.hasDrawn = true;
    // Player can now play 3 cards instead of 2 (handled in playCard)

    // Move to MAIN phase
    this.state.phase = 'MAIN';

    return {
      success: true,
      message: 'Skipped draw - you can play 3 cards this turn',
    };
  }

  /**
   * Play a card from hand
   */
  playCard(action: PlayCardAction): { success: boolean; message: string } {
    const player = this.getCurrentPlayer();

    // Check phase
    if (this.state.phase !== 'MAIN') {
      return { success: false, message: 'Can only play cards during Main phase' };
    }

    // Check card limit (2 normally, 3 if skipped draw)
    const maxCards = player.hasDrawn && player.cardsPlayedThisTurn === 0 ? 3 : 2;
    if (player.cardsPlayedThisTurn >= maxCards) {
      return { success: false, message: `Can only play ${maxCards} cards per turn` };
    }

    // Find card in hand
    const cardIndex = player.hand.findIndex(c => c.id === action.cardId);
    if (cardIndex === -1) {
      return { success: false, message: 'Card not in hand' };
    }

    const card = player.hand[cardIndex];

    // Play based on type
    let result: { success: boolean; message: string };

    switch (card.type) {
      case 'CREATURE':
        result = this.playCreature(card as Creature, action.position);
        break;
      case 'SPELL':
        result = this.playSpell(card as Spell, action.targetId);
        break;
      case 'EQUIPMENT':
        result = this.playEquipment(card as Equipment, action.targetId);
        break;
      case 'TRAP':
        result = this.playTrap(card as Trap);
        break;
      default:
        return { success: false, message: 'Unknown card type' };
    }

    if (result.success) {
      // Remove from hand
      player.hand.splice(cardIndex, 1);
      player.cardsPlayedThisTurn++;

      this.logAction({
        turn: this.state.currentTurn,
        player: player.id,
        action: 'PLAY_CARD',
        cardId: card.id,
        targetId: action.targetId,
        timestamp: Date.now(),
      });
    }

    return result;
  }

  /**
   * Play a creature
   */
  private playCreature(creature: Creature, position?: number): { success: boolean; message: string } {
    const player = this.getCurrentPlayer();

    // Find empty slot or use specified position
    let slot = position !== undefined ? position : player.board.findIndex(c => c === null);

    if (slot === -1 || slot >= 5) {
      return { success: false, message: 'Board is full (max 5 creatures)' };
    }

    if (player.board[slot] !== null) {
      return { success: false, message: 'Slot already occupied' };
    }

    // Initialize creature
    creature.currentHealth = creature.health;
    creature.position = slot;
    creature.canAttack = false; // Summoning sickness
    creature.equipments = [];

    // Place on board
    player.board[slot] = creature;

    // Trigger on-summon effects
    const effectResult = executeCardEffect({
      game: this.state,
      source: creature,
      heroId: player.heroId,
    });

    if (effectResult.success) {
      this.state = effectResult.gameState;
    }

    return {
      success: true,
      message: `Summoned ${creature.name}`,
    };
  }

  /**
   * Play a spell
   */
  private playSpell(spell: Spell, targetId?: string): { success: boolean; message: string } {
    const player = this.getCurrentPlayer();

    // Get target
    let target: Card | 'hero' | undefined;

    if (targetId === 'player1-hero' || targetId === 'player2-hero') {
      target = 'hero';
    } else if (targetId) {
      // Find creature on board
      target = this.findCreatureById(targetId);
    }

    // Execute spell effect
    const effectResult = executeCardEffect({
      game: this.state,
      source: spell,
      target,
      targetPlayerId: targetId?.includes('player1') ? 'player1' : 'player2',
      heroId: player.heroId,
    });

    if (!effectResult.success) {
      return { success: false, message: effectResult.message || 'Spell failed' };
    }

    this.state = effectResult.gameState;

    // Spell goes to graveyard
    player.graveyard.push(spell);

    return {
      success: true,
      message: `Cast ${spell.name}`,
    };
  }

  /**
   * Play an equipment
   */
  private playEquipment(equipment: Equipment, targetId?: string): { success: boolean; message: string } {
    if (!targetId) {
      return { success: false, message: 'Must target a creature' };
    }

    const targetCreature = this.findCreatureById(targetId) as Creature;
    if (!targetCreature) {
      return { success: false, message: 'Invalid target' };
    }

    // Check if already equipped
    if (targetCreature.equipments.length >= 1) {
      return { success: false, message: 'Creature already has equipment (max 1)' };
    }

    // Attach equipment
    equipment.attachedTo = targetCreature.id;
    targetCreature.equipments.push(equipment);

    // Apply equipment bonuses
    this.applyEquipmentBonuses(targetCreature, equipment);

    return {
      success: true,
      message: `Equipped ${equipment.name} to ${targetCreature.name}`,
    };
  }

  /**
   * Play a trap
   */
  private playTrap(trap: Trap): { success: boolean; message: string } {
    const player = this.getCurrentPlayer();

    // Add to trap zone (hidden)
    trap.isRevealed = false;
    player.traps.push(trap);

    return {
      success: true,
      message: 'Trap set',
    };
  }

  /**
   * Use hero power
   */
  useHeroPower(targetId?: string): { success: boolean; message: string } {
    const player = this.getCurrentPlayer();

    if (player.powerUsedThisTurn) {
      return { success: false, message: 'Hero power already used this turn' };
    }

    // Execute hero power based on powerCode
    const powerResult = this.executeHeroPower(player.hero.powerCode, targetId);

    if (powerResult.success) {
      player.powerUsedThisTurn = true;

      this.logAction({
        turn: this.state.currentTurn,
        player: player.id,
        action: 'USE_POWER',
        targetId,
        timestamp: Date.now(),
      });
    }

    return powerResult;
  }

  /**
   * Attack with a creature
   */
  attack(attackAction: AttackAction): { success: boolean; message: string } {
    const attacker = this.findCreatureById(attackAction.attackerId) as Creature;

    if (!attacker) {
      return { success: false, message: 'Attacker not found' };
    }

    if (!attacker.canAttack) {
      return { success: false, message: 'Creature cannot attack (summoning sickness or already attacked)' };
    }

    if (attacker.stunned) {
      return { success: false, message: 'Creature is stunned' };
    }

    // Attack hero or creature
    if (attackAction.targetId === 'hero') {
      return this.attackHero(attacker);
    } else {
      const defender = this.findCreatureById(attackAction.targetId) as Creature;
      if (!defender) {
        return { success: false, message: 'Target not found' };
      }
      return this.attackCreature(attacker, defender);
    }
  }

  /**
   * Attack enemy hero
   */
  private attackHero(attacker: Creature): { success: boolean; message: string } {
    const opponent = this.getOpponent();

    // Check for taunt creatures
    const hasTaunt = opponent.board.some(c => c && c.effectCode === 'TAUNT');
    if (hasTaunt) {
      return { success: false, message: 'Must attack Taunt creatures first' };
    }

    // Deal damage
    opponent.health -= attacker.attack;
    attacker.canAttack = false;

    // Trigger on-attack effects
    this.triggerOnAttackEffects(attacker);

    // Check win condition
    if (opponent.health <= 0) {
      this.endGame(this.getCurrentPlayerId());
      return {
        success: true,
        message: `${attacker.name} dealt ${attacker.attack} damage - YOU WIN!`,
      };
    }

    this.logAction({
      turn: this.state.currentTurn,
      player: this.getCurrentPlayerId(),
      action: 'ATTACK',
      cardId: attacker.id,
      targetId: 'hero',
      details: { damage: attacker.attack },
      timestamp: Date.now(),
    });

    return {
      success: true,
      message: `${attacker.name} dealt ${attacker.attack} damage to enemy hero`,
    };
  }

  /**
   * Attack enemy creature
   */
  private attackCreature(attacker: Creature, defender: Creature): { success: boolean; message: string } {
    const currentPlayer = this.getCurrentPlayer();
    const opponent = this.getOpponent();

    // Check first strike
    const attackerFirstStrike = attacker.effectCode === 'FIRST_STRIKE' ||
      attacker.equipments.some(e => e.effectCode.includes('FIRST_STRIKE'));
    const defenderFirstStrike = defender.effectCode === 'FIRST_STRIKE' ||
      defender.equipments.some(e => e.effectCode.includes('FIRST_STRIKE'));

    // First strike logic
    if (attackerFirstStrike && !defenderFirstStrike) {
      defender.currentHealth -= attacker.attack;
      if (defender.currentHealth <= 0) {
        this.destroyCreature(defender, opponent);
        attacker.canAttack = false;
        return {
          success: true,
          message: `${attacker.name} destroyed ${defender.name} (First Strike)`,
        };
      }
    } else if (defenderFirstStrike && !attackerFirstStrike) {
      attacker.currentHealth -= defender.attack;
      if (attacker.currentHealth <= 0) {
        this.destroyCreature(attacker, currentPlayer);
        return {
          success: true,
          message: `${defender.name} destroyed ${attacker.name} (First Strike)`,
        };
      }
    }

    // Normal combat
    defender.currentHealth -= attacker.attack;
    attacker.currentHealth -= defender.attack;

    // Check deaths
    const attackerDied = attacker.currentHealth <= 0;
    const defenderDied = defender.currentHealth <= 0;

    if (attackerDied) {
      this.destroyCreature(attacker, currentPlayer);
    }

    if (defenderDied) {
      this.destroyCreature(defender, opponent);
    }

    attacker.canAttack = false;

    // Trigger on-attack effects
    this.triggerOnAttackEffects(attacker);

    this.logAction({
      turn: this.state.currentTurn,
      player: currentPlayer.id,
      action: 'ATTACK',
      cardId: attacker.id,
      targetId: defender.id,
      details: {
        attackerDamage: attacker.attack,
        defenderDamage: defender.attack,
        attackerDied,
        defenderDied,
      },
      timestamp: Date.now(),
    });

    let message = `${attacker.name} attacked ${defender.name}`;
    if (attackerDied && defenderDied) {
      message += ' - Both destroyed!';
    } else if (attackerDied) {
      message += ` - ${attacker.name} destroyed!`;
    } else if (defenderDied) {
      message += ` - ${defender.name} destroyed!`;
    }

    return { success: true, message };
  }

  /**
   * End turn
   */
  endTurn(): { success: boolean; message: string } {
    const currentPlayer = this.getCurrentPlayer();

    // Remove temporary buffs
    currentPlayer.board.forEach(creature => {
      if (creature && (creature as any).tempBuffs) {
        (creature as any).tempBuffs.forEach((buff: any) => {
          if (buff.type === 'attack') {
            creature.attack -= buff.value;
          }
        });
        (creature as any).tempBuffs = [];
      }
    });

    // Trigger end-of-turn effects (burn, ramp, etc.)
    this.triggerEndOfTurnEffects();

    // Switch player
    this.state.currentPlayer = this.state.currentPlayer === 'player1' ? 'player2' : 'player1';
    this.state.currentTurn++;
    this.state.phase = 'DRAW';

    this.logAction({
      turn: this.state.currentTurn - 1,
      player: currentPlayer.id,
      action: 'END_TURN',
      timestamp: Date.now(),
    });

    // Auto-start next turn
    this.startTurn();

    return {
      success: true,
      message: 'Turn ended',
    };
  }

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  private getCurrentPlayer(): Player {
    return this.state[this.state.currentPlayer];
  }

  private getCurrentPlayerId(): string {
    return this.state.currentPlayer;
  }

  private getOpponent(): Player {
    return this.state[this.state.currentPlayer === 'player1' ? 'player2' : 'player1'];
  }

  private getOpponentPlayerId(): string {
    return this.state.currentPlayer === 'player1' ? 'player2' : 'player1';
  }

  private findCreatureById(id: string): Creature | null {
    const p1Creature = this.state.player1.board.find(c => c && c.id === id);
    if (p1Creature) return p1Creature;

    const p2Creature = this.state.player2.board.find(c => c && c.id === id);
    return p2Creature || null;
  }

  private destroyCreature(creature: Creature, owner: Player) {
    // Remove from board
    const index = owner.board.findIndex(c => c && c.id === creature.id);
    if (index !== -1) {
      owner.board[index] = null;
    }

    // Add to graveyard
    owner.graveyard.push(creature);

    // Trigger death effects
    this.triggerOnDeathEffects(creature);
  }

  private applyEquipmentBonuses(creature: Creature, equipment: Equipment) {
    // Parse equipment effect code
    const code = equipment.effectCode;

    if (code.includes('ATTACK')) {
      const match = code.match(/ATTACK_(\d+)/);
      if (match) {
        creature.attack += parseInt(match[1]);
      }
    }

    if (code.includes('HEALTH')) {
      const match = code.match(/HEALTH_(\d+)/);
      if (match) {
        const bonus = parseInt(match[1]);
        creature.health += bonus;
        creature.currentHealth += bonus;
      }
    }

    if (code.includes('_(\d+)_(\d+)')) {
      const match = code.match(/_(\d+)_(\d+)/);
      if (match) {
        creature.attack += parseInt(match[1]);
        creature.health += parseInt(match[2]);
        creature.currentHealth += parseInt(match[2]);
      }
    }
  }

  private executeHeroPower(powerCode: string, targetId?: string): { success: boolean; message: string } {
    const player = this.getCurrentPlayer();

    switch (powerCode) {
      case 'BOOST_THRUSTERS': {
        if (!targetId) return { success: false, message: 'Must target a creature' };
        const target = this.findCreatureById(targetId);
        if (!target) return { success: false, message: 'Invalid target' };
        target.attack += 2;
        return { success: true, message: `${target.name} gained +2 attack` };
      }

      case 'MISSILE_BARRAGE': {
        const opponent = this.getOpponent();
        opponent.board.forEach(creature => {
          if (creature) {
            creature.currentHealth -= 2;
            if (creature.currentHealth <= 0) {
              this.destroyCreature(creature, opponent);
            }
          }
        });
        return { success: true, message: 'Dealt 2 damage to all enemy creatures' };
      }

      case 'IGNITE': {
        if (!targetId) return { success: false, message: 'Must target a creature' };
        const target = this.findCreatureById(targetId);
        if (!target) return { success: false, message: 'Invalid target' };
        target.currentHealth -= 1;
        (target as any).burning = 1; // Will deal 1 damage per turn
        return { success: true, message: `${target.name} is burning` };
      }

      case 'DEPLOY_MINE': {
        player.traps.push({
          id: `mine-${Date.now()}`,
          name: 'Mine Trap',
          type: 'TRAP',
          rarity: 'COMMON',
          cost: 0,
          effectCode: 'TRAP_DAMAGE_ON_SUMMON',
          isRevealed: false,
          triggerCondition: 'ON_SUMMON',
        } as Trap);
        return { success: true, message: 'Mine deployed' };
      }

      case 'FORTIFY_POWER': {
        if (!targetId) return { success: false, message: 'Must target a creature' };
        const target = this.findCreatureById(targetId);
        if (!target) return { success: false, message: 'Invalid target' };
        target.health += 3;
        target.currentHealth += 3;
        return { success: true, message: `${target.name} gained +3 health` };
      }

      case 'DEPLOY_TURRET': {
        const emptySlot = player.board.findIndex(c => c === null);
        if (emptySlot === -1) {
          return { success: false, message: 'Board is full' };
        }

        const turret: Creature = {
          id: `turret-${Date.now()}`,
          name: 'Turret',
          type: 'CREATURE',
          rarity: 'COMMON',
          cost: 0,
          attack: 0,
          health: 3,
          currentHealth: 3,
          effectCode: 'TURRET',
          position: emptySlot,
          canAttack: false,
          equipments: [],
        };

        player.board[emptySlot] = turret;
        return { success: true, message: 'Turret deployed' };
      }

      case 'NANOBOTS': {
        if (!targetId) return { success: false, message: 'Must target hero or creature' };

        if (targetId.includes('hero')) {
          player.health = Math.min(player.health + 3, player.maxHealth);
          return { success: true, message: 'Restored 3 health to hero' };
        } else {
          const target = this.findCreatureById(targetId);
          if (!target) return { success: false, message: 'Invalid target' };
          target.currentHealth = Math.min(target.currentHealth + 3, target.health);
          return { success: true, message: `Restored 3 health to ${target.name}` };
        }
      }

      case 'HEADSHOT': {
        if (!targetId) return { success: false, message: 'Must target a creature' };
        const target = this.findCreatureById(targetId);
        if (!target) return { success: false, message: 'Invalid target' };
        if (target.currentHealth > 3) {
          return { success: false, message: 'Target has more than 3 health' };
        }
        this.destroyCreature(target, this.getOpponent());
        return { success: true, message: `Destroyed ${target.name}` };
      }

      case 'MIMIC': {
        const opponent = this.getOpponent();
        if (this.state.turnHistory.length === 0) {
          return { success: false, message: 'No cards played yet' };
        }
        const lastAction = this.state.turnHistory[this.state.turnHistory.length - 1];
        if (lastAction.action !== 'PLAY_CARD' || !lastAction.cardId) {
          return { success: false, message: 'Last action was not a card play' };
        }
        // Copy the last card played
        return { success: true, message: 'Copied last card played' };
      }

      default:
        return { success: false, message: 'Unknown hero power' };
    }
  }

  private triggerOnAttackEffects(creature: Creature) {
    // Trigger effects like AOE_ON_ATTACK, LIFESTEAL, etc.
    if (creature.effectCode === 'AOE_ON_ATTACK') {
      executeCardEffect({
        game: this.state,
        source: creature,
      });
    }

    if (creature.effectCode === 'LIFESTEAL') {
      executeCardEffect({
        game: this.state,
        source: creature,
      });
    }
  }

  private triggerOnDeathEffects(creature: Creature) {
    // Trigger effects like GROW_ON_DEATH for other creatures
    const owner = this.state.player1.board.some(c => c && c.id === creature.id)
      ? this.state.player1
      : this.state.player2;

    owner.board.forEach(c => {
      if (c && c.effectCode === 'GROW_ON_DEATH') {
        executeCardEffect({
          game: this.state,
          source: c,
        });
      }
    });
  }

  private triggerEndOfTurnEffects() {
    const currentPlayer = this.getCurrentPlayer();
    const opponent = this.getOpponent();

    // Burn effects
    currentPlayer.board.forEach(creature => {
      if (creature && (creature as any).burning) {
        creature.currentHealth -= (creature as any).burning;
        if (creature.currentHealth <= 0) {
          this.destroyCreature(creature, currentPlayer);
        }
      }
    });

    opponent.board.forEach(creature => {
      if (creature && (creature as any).burning) {
        creature.currentHealth -= (creature as any).burning;
        if (creature.currentHealth <= 0) {
          this.destroyCreature(creature, opponent);
        }
      }
    });

    // Ramp Up (Tank Brute mechanic)
    if (currentPlayer.heroId === 'tank-brute') {
      currentPlayer.board.forEach(creature => {
        if (creature) {
          creature.attack += 1;
        }
      });
    }
  }

  private endGame(winnerId: string) {
    this.state.phase = 'ENDED';
    this.state.winner = winnerId;
  }

  private logAction(action: TurnAction) {
    this.state.turnHistory.push(action);
  }
}

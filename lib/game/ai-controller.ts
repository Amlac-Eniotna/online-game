import { GameEngine } from './game-engine';
import { Card, Creature, Player } from './game-types';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export class AIController {
  private engine: GameEngine;
  private difficulty: AIDifficulty;
  private playerId: string;

  constructor(engine: GameEngine, playerId: string, difficulty: AIDifficulty) {
    this.engine = engine;
    this.playerId = playerId;
    this.difficulty = difficulty;
  }

  /**
   * Execute AI turn
   */
  public async playTurn(): Promise<void> {
    const state = this.engine.getState();
    if (state.currentPlayer !== this.playerId) return;

    // Simulate thinking time
    await this.delay(1000);

    // 1. Draw Card Phase
    if (state.phase === 'DRAW') {
      this.engine.drawCard();
      await this.delay(500);
    }

    // 2. Play Cards Phase
    await this.playCards();

    // 3. Attack Phase
    await this.performAttacks();

    // 4. Hero Power Phase
    await this.useHeroPower();

    // 5. End Turn
    this.engine.endTurn();
  }

  /**
   * Play cards based on difficulty
   */
  private async playCards(): Promise<void> {
    const player = this.getPlayer();
    
    // Safety check - if no cards or maxed out
    let attempts = 0;
    while (attempts < 5 && player.cardsPlayedThisTurn < 2) {
      const playableCards = player.hand; // No mana system, just card count limit
      if (playableCards.length === 0) break;

      let cardToPlay: Card | null = null;
      let targetId: string | undefined;
      let position: number | undefined;

      switch (this.difficulty) {
        case 'hard':
          // Hard: Prioritize high cost/value cards
          playOrderedByValue(playableCards);
          cardToPlay = playableCards[0]; 
          break;
        case 'medium':
          // Medium: Play anything that isn't a spell without target
          cardToPlay = playableCards.find(c => c.type === 'CREATURE') || playableCards[0];
          break;
        case 'easy':
        default:
          // Easy: Random card
          cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
          break;
      }

      if (cardToPlay) {
        // Determine targets/positions
        if (cardToPlay.type === 'CREATURE') {
          // Find empty slot
          const emptySlot = player.board.findIndex(c => c === null);
          if (emptySlot !== -1) position = emptySlot;
        } else if (['SPELL', 'EQUIPMENT'].includes(cardToPlay.type)) {
            // Simple target logic
            const opponent = this.getOpponent();
            const enemyCreature = opponent.board.find(c => c !== null);
            const myCreature = player.board.find(c => c !== null);

            if (cardToPlay.type === 'EQUIPMENT' && myCreature) {
                targetId = myCreature.id;
            } else if (cardToPlay.type === 'SPELL') {
                // Heuristic: Damage spell -> enemy, Buff spell -> self
                // For now, simplify: if enemy exists, target enemy, else random valid target
                targetId = enemyCreature?.id || 'player1-hero'; // Assume player1 is enemy for now
            }
        }

        const result = this.engine.playCard({
          cardId: cardToPlay.id,
          position,
          targetId
        });

        if (result.success) {
           await this.delay(800);
        } else {
           // If failed (e.g. invalid target), break to avoid infinite loop
           break;
        }
      }
      
      attempts++;
      // Refresh player state
      if (player.cardsPlayedThisTurn >= 2) break;
    }

    function playOrderedByValue(cards: Card[]) {
        cards.sort((a, b) => b.cost - a.cost);
    }
  }

  /**
   * Attack logic
   */
  private async performAttacks(): Promise<void> {
    const player = this.getPlayer();
    const opponent = this.getOpponent();

    // Get ready attackers
    const attackers = player.board.filter(c => c !== null && c.canAttack && !c.stunned) as Creature[];

    for (const attacker of attackers) {
      let targetId = 'hero'; // Default: Face is the place

      if (this.difficulty === 'hard') {
        // Hard: Trade efficiently
        // Find an enemy creature that we can kill without dying, OR a high value target
        const bestTarget = opponent.board.find(c => 
            c && c.currentHealth <= attacker.attack // Can kill it
        );
        if (bestTarget) targetId = bestTarget.id;
      } else if (this.difficulty === 'medium') {
        // Medium: Attack lowest health minion if available
        const weakTarget = opponent.board
            .filter(c => c !== null)
            .sort((a, b) => (a!.currentHealth - b!.currentHealth))[0];
        
        if (weakTarget) targetId = weakTarget.id;
      }
      // Easy: Always goes face (default)

      // Taunt check (simplified, engine handles validation but AI needs to pick valid)
      const taunt = opponent.board.find(c => c && c.effectCode === 'TAUNT');
      if (taunt) targetId = taunt.id;

      const result = this.engine.attack({
        attackerId: attacker.id,
        targetId,
        damage: 0 // Engine calculates
      });

       if (result.success) {
           await this.delay(600);
       }
    }
  }

  /**
   * Hero power logic
   */
  private async useHeroPower(): Promise<void> {
    if (this.difficulty === 'easy') return; // Easy AI forgets hero power

    // Simple heuristic: 50% chance to use it on Hard/Medium
    if (Math.random() > 0.5) return;

    // Try to find a valid target
    // This is highly dependent on specific power, simplifying for generic usage
    const player = this.getPlayer();
    const myCreature = player.board.find(c => c !== null);

    if (myCreature) {
        this.engine.useHeroPower(myCreature.id);
         await this.delay(500);
    }
  }

  private getPlayer(): Player {
    const state = this.engine.getState();
    return state[state.currentPlayer];
  }

  private getOpponent(): Player {
    const state = this.engine.getState();
    return state[state.currentPlayer === 'player1' ? 'player2' : 'player1'];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

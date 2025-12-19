import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import type { GameState, Creature, Card } from '@/lib/game/game-types';

export class GameScene extends Scene {
  private playerBoard!: Phaser.GameObjects.Container;
  private opponentBoard!: Phaser.GameObjects.Container;
  private playerHand!: Phaser.GameObjects.Container;
  private gameState: GameState | null = null;

  // UI elements
  private turnText!: Phaser.GameObjects.Text;
  private playerHPText!: Phaser.GameObjects.Text;
  private opponentHPText!: Phaser.GameObjects.Text;
  private endTurnBtn!: Phaser.GameObjects.Text;

  // Card objects
  private handCards: Map<string, Phaser.GameObjects.Container> = new Map();
  private boardCreatures: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super('GameScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.cameras.main.setBackgroundColor('#0a0e27');

    // Create game board layout
    this.createBoardLayout(width, height);

    // Listen for game state updates
    EventBus.on('game-state-update', this.handleGameStateUpdate, this);

    // Emit scene ready
    EventBus.emit('current-scene-ready', this);
  }

  private handleGameStateUpdate(gameState: GameState) {
    this.gameState = gameState;
    this.updateBoard();
  }

  private createBoardLayout(width: number, height: number) {
    // Opponent board (top)
    this.createBoard(width / 2, height * 0.25, 'Opponent', true);

    // Player board (bottom)
    this.createBoard(width / 2, height * 0.75, 'You', false);

    // Player hand area
    this.createHandArea(width / 2, height - 80);

    // UI elements
    this.createUI(width, height);
  }

  private createBoard(x: number, y: number, label: string, isOpponent: boolean) {
    // Board label
    this.add.text(x, y - 80, label, {
      fontFamily: 'Arial',
      fontSize: 20,
      color: isOpponent ? '#ec4899' : '#06b6d4',
    }).setOrigin(0.5);

    // 5 card slots
    const slotWidth = 120;
    const slotHeight = 160;
    const gap = 10;
    const startX = x - (5 * slotWidth + 4 * gap) / 2;

    for (let i = 0; i < 5; i++) {
      const slotX = startX + i * (slotWidth + gap);

      const slot = this.add.rectangle(
        slotX + slotWidth / 2,
        y,
        slotWidth,
        slotHeight,
        0x1e293b,
        0.3
      );

      slot.setStrokeStyle(2, isOpponent ? 0xec4899 : 0x06b6d4, 0.5);
    }
  }

  private createHandArea(x: number, y: number) {
    // Hand area background
    const handBg = this.add.rectangle(x, y, 800, 140, 0x1e293b, 0.5);
    handBg.setStrokeStyle(2, 0x6b46c1);

    this.add.text(x - 380, y - 60, 'Your Hand', {
      fontFamily: 'Arial',
      fontSize: 16,
      color: '#6b46c1',
    });
  }

  private createUI(width: number, height: number) {
    // Turn indicator
    this.turnText = this.add.text(width / 2, 20, 'Your Turn', {
      fontFamily: 'Arial Black',
      fontSize: 24,
      color: '#06b6d4',
    }).setOrigin(0.5);

    // End turn button
    this.endTurnBtn = this.add.text(width - 120, height / 2, 'End Turn', {
      fontFamily: 'Arial',
      fontSize: 18,
      color: '#ffffff',
      backgroundColor: '#2563eb',
      padding: { x: 15, y: 8 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.endTurnBtn.on('pointerover', () => {
      this.endTurnBtn.setScale(1.05);
      this.endTurnBtn.setStyle({ backgroundColor: '#3b82f6' });
    });

    this.endTurnBtn.on('pointerout', () => {
      this.endTurnBtn.setScale(1);
      this.endTurnBtn.setStyle({ backgroundColor: '#2563eb' });
    });

    this.endTurnBtn.on('pointerdown', () => {
      console.log('End turn clicked');
      EventBus.emit('end-turn');
    });

    // Player HP
    this.playerHPText = this.add.text(20, height - 40, '❤️ 20/20 HP', {
      fontFamily: 'Arial',
      fontSize: 20,
      color: '#ef4444',
    });

    // Opponent HP
    this.opponentHPText = this.add.text(20, 20, '❤️ 20/20 HP', {
      fontFamily: 'Arial',
      fontSize: 20,
      color: '#ef4444',
    });
  }

  private updateBoard() {
    if (!this.gameState) return;

    const { player1, player2, currentPlayer, phase } = this.gameState;

    // Update HP
    this.playerHPText.setText(`❤️ ${player1.health}/${player1.maxHealth} HP`);
    this.opponentHPText.setText(`❤️ ${player2.health}/${player2.maxHealth} HP`);

    // Update turn indicator
    const isPlayerTurn = currentPlayer === 'player1';
    this.turnText.setText(isPlayerTurn ? 'Your Turn' : "Opponent's Turn");
    this.turnText.setColor(isPlayerTurn ? '#06b6d4' : '#ec4899');

    // Update end turn button state
    this.endTurnBtn.setAlpha(isPlayerTurn && phase === 'MAIN' ? 1 : 0.5);

    // Update hand
    this.updateHand(player1.hand);

    // Update board creatures
    this.updateBoardCreatures(player1.board, player2.board);
  }

  private updateHand(hand: Card[]) {
    const { width, height } = this.cameras.main;
    const handY = height - 80;
    const cardWidth = 100;
    const cardHeight = 140;
    const gap = 10;
    const totalWidth = hand.length * (cardWidth + gap) - gap;
    const startX = width / 2 - totalWidth / 2;

    // Clear existing hand cards
    this.handCards.forEach((card) => card.destroy());
    this.handCards.clear();

    // Create hand cards
    hand.forEach((card, index) => {
      const x = startX + index * (cardWidth + gap);
      const cardContainer = this.createHandCard(card, x, handY, cardWidth, cardHeight);
      this.handCards.set(card.id, cardContainer);
    });
  }

  private createHandCard(card: Card, x: number, y: number, width: number, height: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Card background
    const bg = this.add.rectangle(0, 0, width, height, 0x1e293b);
    bg.setStrokeStyle(2, 0x6b46c1);

    // Card name
    const nameText = this.add.text(0, -height / 2 + 15, card.name, {
      fontFamily: 'Arial',
      fontSize: 12,
      color: '#ffffff',
      wordWrap: { width: width - 10 },
    }).setOrigin(0.5, 0);

    // Cost
    const costText = this.add.text(width / 2 - 15, -height / 2 + 10, card.cost?.toString() || '0', {
      fontFamily: 'Arial Black',
      fontSize: 16,
      color: '#06b6d4',
    }).setOrigin(0.5);

    const costBg = this.add.circle(width / 2 - 15, -height / 2 + 10, 12, 0x0a0e27);
    costBg.setStrokeStyle(2, 0x06b6d4);

    // Stats (for creatures)
    if (card.type === 'CREATURE' && card.attack !== undefined && card.health !== undefined) {
      const attackText = this.add.text(-width / 2 + 15, height / 2 - 15, card.attack.toString(), {
        fontFamily: 'Arial Black',
        fontSize: 14,
        color: '#ef4444',
      }).setOrigin(0.5);

      const healthText = this.add.text(width / 2 - 15, height / 2 - 15, card.health.toString(), {
        fontFamily: 'Arial Black',
        fontSize: 14,
        color: '#10b981',
      }).setOrigin(0.5);

      container.add([attackText, healthText]);
    }

    container.add([bg, costBg, costText, nameText]);

    // Make draggable
    container.setSize(width, height);
    container.setInteractive({ draggable: true, useHandCursor: true });

    container.on('pointerover', () => {
      container.setScale(1.1);
      container.setDepth(100);
    });

    container.on('pointerout', () => {
      container.setScale(1);
      container.setDepth(1);
    });

    this.input.setDraggable(container);

    container.on('drag', (_pointer: any, dragX: number, dragY: number) => {
      container.x = dragX;
      container.y = dragY;
    });

    container.on('dragend', () => {
      // Check if dropped on board
      if (container.y < this.cameras.main.height * 0.5) {
        // Play the card
        EventBus.emit('play-card', { cardId: card.id, position: 0 });
      }
      // Reset position
      container.x = x;
      container.y = y;
    });

    return container;
  }

  private updateBoardCreatures(playerBoard: Creature[], opponentBoard: Creature[]) {
    // Clear existing creatures
    this.boardCreatures.forEach((creature) => creature.destroy());
    this.boardCreatures.clear();

    // Create player creatures
    const { width, height } = this.cameras.main;
    const cardWidth = 100;
    const cardHeight = 140;
    const gap = 10;

    playerBoard.forEach((creature, index) => {
      const x = width / 2 - (5 * cardWidth + 4 * gap) / 2 + index * (cardWidth + gap) + cardWidth / 2;
      const y = height * 0.75;
      const creatureContainer = this.createBoardCreature(creature, x, y, cardWidth, cardHeight, false);
      this.boardCreatures.set(creature.id, creatureContainer);
    });

    // Create opponent creatures
    opponentBoard.forEach((creature, index) => {
      const x = width / 2 - (5 * cardWidth + 4 * gap) / 2 + index * (cardWidth + gap) + cardWidth / 2;
      const y = height * 0.25;
      const creatureContainer = this.createBoardCreature(creature, x, y, cardWidth, cardHeight, true);
      this.boardCreatures.set(creature.id, creatureContainer);
    });
  }

  private createBoardCreature(creature: Creature, x: number, y: number, width: number, height: number, isOpponent: boolean): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const color = isOpponent ? 0xec4899 : 0x06b6d4;

    // Card background
    const bg = this.add.rectangle(0, 0, width, height, 0x1e293b);
    bg.setStrokeStyle(creature.canAttack ? 3 : 2, color, creature.canAttack ? 1 : 0.5);

    // Creature name
    const nameText = this.add.text(0, -height / 2 + 15, creature.name, {
      fontFamily: 'Arial',
      fontSize: 11,
      color: '#ffffff',
      wordWrap: { width: width - 10 },
    }).setOrigin(0.5, 0);

    // Attack
    const attackText = this.add.text(-width / 2 + 15, height / 2 - 15, creature.attack.toString(), {
      fontFamily: 'Arial Black',
      fontSize: 16,
      color: '#ef4444',
    }).setOrigin(0.5);

    // Health
    const healthText = this.add.text(width / 2 - 15, height / 2 - 15, `${creature.currentHealth}/${creature.health}`, {
      fontFamily: 'Arial Black',
      fontSize: 14,
      color: '#10b981',
    }).setOrigin(0.5);

    container.add([bg, nameText, attackText, healthText]);

    // Make clickable for attacks
    if (!isOpponent && creature.canAttack) {
      container.setInteractive({ useHandCursor: true });
      container.on('pointerdown', () => {
        // Highlight for attack selection
        console.log('Creature selected for attack:', creature.id);
        // TODO: Select target
      });
    }

    return container;
  }
}

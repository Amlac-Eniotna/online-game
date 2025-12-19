import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameScene extends Scene {
  private playerBoard!: Phaser.GameObjects.Container;
  private opponentBoard!: Phaser.GameObjects.Container;
  private playerHand!: Phaser.GameObjects.Container;

  constructor() {
    super('GameScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.cameras.main.setBackgroundColor('#0a0e27');

    // Create game board layout
    this.createBoardLayout(width, height);

    // Emit scene ready
    EventBus.emit('current-scene-ready', this);
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
    const turnText = this.add.text(width / 2, 20, 'Your Turn', {
      fontFamily: 'Arial Black',
      fontSize: 24,
      color: '#06b6d4',
    }).setOrigin(0.5);

    // End turn button
    const endTurnBtn = this.add.text(width - 120, height / 2, 'End Turn', {
      fontFamily: 'Arial',
      fontSize: 18,
      color: '#ffffff',
      backgroundColor: '#2563eb',
      padding: { x: 15, y: 8 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    endTurnBtn.on('pointerover', () => {
      endTurnBtn.setScale(1.05);
      endTurnBtn.setStyle({ backgroundColor: '#3b82f6' });
    });

    endTurnBtn.on('pointerout', () => {
      endTurnBtn.setScale(1);
      endTurnBtn.setStyle({ backgroundColor: '#2563eb' });
    });

    endTurnBtn.on('pointerdown', () => {
      console.log('End turn clicked');
      EventBus.emit('end-turn');
    });

    // Player HP
    this.add.text(20, height - 40, '❤️ 20/20 HP', {
      fontFamily: 'Arial',
      fontSize: 20,
      color: '#ef4444',
    });

    // Opponent HP
    this.add.text(20, 20, '❤️ 20/20 HP', {
      fontFamily: 'Arial',
      fontSize: 20,
      color: '#ef4444',
    });
  }
}

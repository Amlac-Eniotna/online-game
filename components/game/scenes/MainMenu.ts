import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene {
  private titleText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Text;

  constructor() {
    super('MainMenu');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.cameras.main.setBackgroundColor('#0a0e27');

    // Title with gradient effect (simulated)
    this.titleText = this.add.text(width / 2, height / 3, 'Merc Deck Madness', {
      fontFamily: 'Arial Black',
      fontSize: 48,
      color: '#6b46c1',
      stroke: '#2563eb',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 3 + 60, 'Galaxy Misfits Card Battle', {
      fontFamily: 'Arial',
      fontSize: 20,
      color: '#06b6d4',
      align: 'center',
    }).setOrigin(0.5);

    // Start button
    this.startButton = this.add.text(width / 2, height / 2 + 100, '▶ Start Game', {
      fontFamily: 'Arial',
      fontSize: 32,
      color: '#ffffff',
      backgroundColor: '#6b46c1',
      padding: { x: 20, y: 10 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.startButton.on('pointerover', () => {
      this.startButton.setScale(1.1);
      this.startButton.setStyle({ backgroundColor: '#8b5cf6' });
    });

    this.startButton.on('pointerout', () => {
      this.startButton.setScale(1);
      this.startButton.setStyle({ backgroundColor: '#6b46c1' });
    });

    this.startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    EventBus.emit('current-scene-ready', this);
  }
}

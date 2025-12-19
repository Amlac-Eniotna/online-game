import { AUTO, Game } from 'phaser';
import { Boot } from './scenes/Boot';
import { GameScene } from './scenes/GameScene';
import { MainMenu } from './scenes/MainMenu';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#0a0e27',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: process.env.NODE_ENV === 'development',
    },
  },
  scene: [Boot, MainMenu, GameScene],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;

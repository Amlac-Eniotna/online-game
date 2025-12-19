import { Scene } from 'phaser';

export class Boot extends Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Load assets here
    // For now, we'll use placeholders
    console.log('Boot: Loading assets...');
  }

  create() {
    console.log('Boot: Starting MainMenu...');
    this.scene.start('MainMenu');
  }
}

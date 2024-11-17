import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    // Charger les assets ici
    this.load.image("player", "/player.png");
  }

  create() {
    this.scene.start("MainScene");
  }
}

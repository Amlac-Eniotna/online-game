import { AUTO, Types } from "phaser";
import { MainScene } from "./scenes/MainScene";
import { PreloadScene } from "./scenes/PreloadScene";

export const GameConfig: Types.Core.GameConfig = {
  type: AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  pixelArt: true,
  scene: [PreloadScene, MainScene],
};

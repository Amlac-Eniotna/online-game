import { Scene } from "phaser";

export class MainScene extends Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  constructor() {
    super("MainScene");
  }
  create() {
    this.player = this.physics.add.sprite(400, 300, "player");
    this.player.body.setCollideWorldBounds(true);
  }

  update() {
    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors?.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (cursors?.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }
    if (cursors?.up.isDown) {
      this.player.setVelocityY(-160);
    } else if (cursors?.down.isDown) {
      this.player.setVelocityY(160);
    } else {
      this.player.setVelocityY(0);
    }
  }
}

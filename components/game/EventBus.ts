// Used to emit events between React components and Phaser scenes
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter

// We cannot import Phaser directly here because it might run on server
// Instead we need a lightweight event emitter or guard the import
import EventEmitter from 'eventemitter3';

export const EventBus = new EventEmitter();

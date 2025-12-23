
import fs from 'fs';
import path from 'path';
import { GameState } from '../lib/game/game-types';

const STORAGE_FILE = path.join(process.cwd(), 'game-storage.json');

export interface PersistedGame {
  gameId: string;
  gameState: GameState;
  player1Socket: string;
  player2Socket?: string;
  aiDifficulty?: string;
}

export const GameStorage = {
  save: (games: Map<string, any>) => {
    try {
      const data: PersistedGame[] = [];
      games.forEach((game) => {
        data.push({
          gameId: game.gameId,
          gameState: game.engine.getState(),
          player1Socket: game.player1Socket,
          player2Socket: game.player2Socket,
          aiDifficulty: game.aiController ? game.aiController.difficulty : undefined
        });
      });
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save games:', error);
    }
  },

  load: (): PersistedGame[] => {
    try {
      if (!fs.existsSync(STORAGE_FILE)) return [];
      const content = fs.readFileSync(STORAGE_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to load games:', error);
      return [];
    }
  }
};

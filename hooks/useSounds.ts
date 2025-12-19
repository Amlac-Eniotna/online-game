"use client";

import { useCallback, useRef } from 'react';

/**
 * Sound effect types available in the game
 */
export type SoundEffect =
  | 'card-play'
  | 'card-draw'
  | 'attack'
  | 'damage'
  | 'death'
  | 'hero-power'
  | 'turn-start'
  | 'turn-end'
  | 'victory'
  | 'defeat'
  | 'match-found'
  | 'button-click'
  | 'button-hover'
  | 'error';

/**
 * Sound effect configuration
 */
const SOUND_CONFIG: Record<SoundEffect, { path: string; volume: number }> = {
  'card-play': { path: '/sounds/card-play.mp3', volume: 0.5 },
  'card-draw': { path: '/sounds/card-draw.mp3', volume: 0.4 },
  'attack': { path: '/sounds/attack.mp3', volume: 0.6 },
  'damage': { path: '/sounds/damage.mp3', volume: 0.5 },
  'death': { path: '/sounds/death.mp3', volume: 0.5 },
  'hero-power': { path: '/sounds/hero-power.mp3', volume: 0.6 },
  'turn-start': { path: '/sounds/turn-start.mp3', volume: 0.4 },
  'turn-end': { path: '/sounds/turn-end.mp3', volume: 0.3 },
  'victory': { path: '/sounds/victory.mp3', volume: 0.7 },
  'defeat': { path: '/sounds/defeat.mp3', volume: 0.6 },
  'match-found': { path: '/sounds/match-found.mp3', volume: 0.7 },
  'button-click': { path: '/sounds/button-click.mp3', volume: 0.3 },
  'button-hover': { path: '/sounds/button-hover.mp3', volume: 0.2 },
  'error': { path: '/sounds/error.mp3', volume: 0.4 },
};

interface UseSoundsReturn {
  play: (sound: SoundEffect) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  isMuted: boolean;
}

/**
 * Custom hook for playing sound effects
 * 
 * Usage:
 * ```tsx
 * const { play, setMuted } = useSounds();
 * play('card-play');
 * ```
 * 
 * Note: Add sound files to /public/sounds/ directory
 * Recommended format: MP3 or OGG for browser compatibility
 */
export function useSounds(): UseSoundsReturn {
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());
  const masterVolume = useRef(1);
  const muted = useRef(false);

  const play = useCallback((sound: SoundEffect) => {
    // Skip if muted or in SSR
    if (muted.current || typeof window === 'undefined') return;

    const config = SOUND_CONFIG[sound];
    if (!config) {
      console.warn(`[Sound] Unknown sound effect: ${sound}`);
      return;
    }

    try {
      // Check cache first
      let audio = audioCache.current.get(config.path);

      if (!audio) {
        // Create new audio element
        audio = new Audio(config.path);
        audioCache.current.set(config.path, audio);
      }

      // Reset and play
      audio.currentTime = 0;
      audio.volume = config.volume * masterVolume.current;
      
      audio.play().catch((error) => {
        // Silently handle autoplay restrictions
        console.debug(`[Sound] Could not play ${sound}:`, error.message);
      });
    } catch (error) {
      // Sound files might not exist yet - fail silently
      console.debug(`[Sound] Error playing ${sound}:`, error);
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    masterVolume.current = Math.max(0, Math.min(1, volume));
  }, []);

  const setMuted = useCallback((isMuted: boolean) => {
    muted.current = isMuted;
  }, []);

  return {
    play,
    setVolume,
    setMuted,
    isMuted: muted.current,
  };
}

/**
 * Placeholder sound files needed in /public/sounds/:
 * - card-play.mp3
 * - card-draw.mp3
 * - attack.mp3
 * - damage.mp3
 * - death.mp3
 * - hero-power.mp3
 * - turn-start.mp3
 * - turn-end.mp3
 * - victory.mp3
 * - defeat.mp3
 * - match-found.mp3
 * - button-click.mp3
 * - button-hover.mp3
 * - error.mp3
 * 
 * Free sound resources:
 * - https://freesound.org/
 * - https://mixkit.co/free-sound-effects/
 * - https://www.zapsplat.com/
 */

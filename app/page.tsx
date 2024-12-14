"use client";

import { GameConfig } from "@/phaser/config";
import { Game } from "phaser";
import { useEffect, useRef } from "react";

const GamePage = () => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const game = new Game({
      ...GameConfig,
      parent: gameRef.current,
    });

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <main className="flex h-svh w-full items-center justify-center">
      <div ref={gameRef} />
    </main>
  );
};

export default GamePage;

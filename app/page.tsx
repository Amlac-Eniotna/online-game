"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { GameConfig } from "@/phaser/config";

const GamePage = () => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const game = new Phaser.Game({
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

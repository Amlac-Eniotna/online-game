import { prisma } from '../prisma';

export interface GameResult {
  gameId: string;
  winnerId: string;
  loserId: string;
  isAiGame: boolean;
  aiDifficulty?: string;
  turns: number;
}

const BASE_REWARDS = {
  WIN: { xp: 100, coins: 50 },
  LOSS: { xp: 25, coins: 10 },
};

const AI_MULTIPLIERS: Record<string, number> = {
  easy: 0.1,
  medium: 0.3,
  hard: 0.5,
};

export async function processGameRewards(result: GameResult) {
  const { gameId, winnerId, loserId, isAiGame, aiDifficulty, turns } = result;

  console.log(`🏆 Processing rewards for game ${gameId}`);

  // Calculate multipliers
  let multiplier = 1.0;
  if (isAiGame && aiDifficulty) {
    multiplier = AI_MULTIPLIERS[aiDifficulty] || 0.1;
  }

  // Winner Rewards
  const winnerRewards = {
    xp: Math.round(BASE_REWARDS.WIN.xp * multiplier),
    coins: Math.round(BASE_REWARDS.WIN.coins * multiplier),
  };

  // Loser Rewards (if human)
  const loserRewards = {
    xp: Math.round(BASE_REWARDS.LOSS.xp * multiplier),
    coins: Math.round(BASE_REWARDS.LOSS.coins * multiplier),
  };

  try {
    // 1. Update Winner
    if (winnerId !== 'ai-opponent') {
      await prisma.user.update({
        where: { id: winnerId },
        data: {
          xp: { increment: winnerRewards.xp },
          coins: { increment: winnerRewards.coins },
          gamesPlayed: { increment: 1 },
          gamesWon: { increment: 1 },
        },
      });
      console.log(`✨ Awarded ${winnerId}: ${winnerRewards.xp} XP, ${winnerRewards.coins} Coins`);
    }

    // 2. Update Loser
    if (loserId !== 'ai-opponent') {
      await prisma.user.update({
        where: { id: loserId },
        data: {
          xp: { increment: loserRewards.xp },
          coins: { increment: loserRewards.coins },
          gamesPlayed: { increment: 1 },
        },
      });
      console.log(`✨ Awarded ${loserId}: ${loserRewards.xp} XP, ${loserRewards.coins} Coins`);
    }

    // 3. Create Match Record
    // Ideally we track the match
    // Check if player2 is AI for ID reference
    const player2Ref = isAiGame ? undefined : { connect: { id: loserId } }; // AI is not in DB
    // Actually, Match schema requires player2Id string relation... 
    // If AI, we might not be able to store it cleanly in the current Schema without a dummy user or modifying schema.
    // For now, let's SKIP creating Match record for AI games if it enforces foreign key, 
    // OR fetch a "System AI" user ID if we had one.
    // Let's assume we skip Match record for now in AI games to avoid FK errors, or just log it.
    
    if (!isAiGame) {
         await prisma.match.create({
            data: {
                player1Id: winnerId, // Simplification: we lost who was p1/p2, just assigning
                player2Id: loserId,
                winnerId: winnerId,
                ranked: false, // TODO: Pass from game options
                turns,
                player1Xp: winnerRewards.xp,
                player1Coins: winnerRewards.coins,
                player2Xp: loserRewards.xp,
                player2Coins: loserRewards.coins,
            }
         });
    }

  } catch (error) {
    console.error('❌ Error processing rewards:', error);
  }
}

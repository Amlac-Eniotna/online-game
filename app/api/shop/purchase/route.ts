import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import type { CardRarity } from '@prisma/client';

/**
 * Booster pack configurations
 */
const BOOSTER_PACKS = {
  STANDARD: {
    price: 1500,
    cardCount: 3,
    rarityOdds: [
      { rarity: 'COMMON' as CardRarity, weight: 60 },
      { rarity: 'RARE' as CardRarity, weight: 25 },
      { rarity: 'EPIC' as CardRarity, weight: 10 },
      { rarity: 'LEGENDARY' as CardRarity, weight: 4 },
      { rarity: 'MYTHIC' as CardRarity, weight: 1 },
    ],
    guaranteedRare: true, // At least 1 RARE or better
  },
  PREMIUM: {
    price: 3000,
    cardCount: 5,
    rarityOdds: [
      { rarity: 'COMMON' as CardRarity, weight: 40 },
      { rarity: 'RARE' as CardRarity, weight: 30 },
      { rarity: 'EPIC' as CardRarity, weight: 20 },
      { rarity: 'LEGENDARY' as CardRarity, weight: 8 },
      { rarity: 'MYTHIC' as CardRarity, weight: 2 },
    ],
    guaranteedRare: true,
  },
};

/**
 * Generate a random rarity based on weighted odds
 */
function getRandomRarity(odds: { rarity: CardRarity; weight: number }[]): CardRarity {
  const totalWeight = odds.reduce((sum, o) => sum + o.weight, 0);
  let random = Math.random() * totalWeight;

  for (const { rarity, weight } of odds) {
    random -= weight;
    if (random <= 0) {
      return rarity;
    }
  }

  return odds[0].rarity; // Fallback
}

/**
 * POST /api/shop/purchase
 * Purchase a booster pack
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { packType = 'STANDARD' } = body;

    const pack = BOOSTER_PACKS[packType as keyof typeof BOOSTER_PACKS];
    if (!pack) {
      return NextResponse.json(
        { error: 'Invalid pack type' },
        { status: 400 }
      );
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has enough coins
    if (user.coins < pack.price) {
      return NextResponse.json(
        { error: 'Insufficient coins' },
        { status: 400 }
      );
    }

    // Generate random cards
    const generatedCards: { rarity: CardRarity; isGolden: boolean }[] = [];

    for (let i = 0; i < pack.cardCount; i++) {
      const rarity = getRandomRarity(pack.rarityOdds);
      const isGolden = Math.random() < 0.02; // 2% chance for golden
      generatedCards.push({ rarity, isGolden });
    }

    // Ensure at least one rare if guaranteed
    if (pack.guaranteedRare) {
      const hasRareOrBetter = generatedCards.some(
        (c) => c.rarity !== 'COMMON'
      );
      if (!hasRareOrBetter) {
        generatedCards[0] = {
          rarity: 'RARE',
          isGolden: Math.random() < 0.02,
        };
      }
    }

    // Fetch actual cards from database
    const openedCards = await Promise.all(
      generatedCards.map(async ({ rarity, isGolden }) => {
        // Get random card of this rarity
        const cards = await prisma.card.findMany({
          where: { rarity },
        });

        if (cards.length === 0) {
          // Fallback to common if no cards of this rarity
          const commonCards = await prisma.card.findMany({
            where: { rarity: 'COMMON' },
          });
          const randomCard = commonCards[Math.floor(Math.random() * commonCards.length)];
          return { ...randomCard, isGolden };
        }

        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        return { ...randomCard, isGolden };
      })
    );

    // Add cards to user's collection
    for (const card of openedCards) {
      const existingCard = await prisma.userCard.findFirst({
        where: {
          userId: user.id,
          cardId: card.id,
          isGolden: card.isGolden,
        },
      });

      if (existingCard) {
        // Increment quantity
        await prisma.userCard.update({
          where: { id: existingCard.id },
          data: {
            quantity: existingCard.quantity + 1,
          },
        });
      } else {
        // Create new entry
        await prisma.userCard.create({
          data: {
            userId: user.id,
            cardId: card.id,
            quantity: 1,
            isGolden: card.isGolden,
          },
        });
      }
    }

    // Deduct coins
    await prisma.user.update({
      where: { id: user.id },
      data: {
        coins: user.coins - pack.price,
      },
    });

    return NextResponse.json({
      success: true,
      cards: openedCards.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        rarity: c.rarity,
        cost: c.cost,
        attack: c.attack,
        health: c.health,
        effect: c.effect,
        isGolden: c.isGolden,
        flavorText: c.flavorText,
      })),
      coinsRemaining: user.coins - pack.price,
    });
  } catch (error) {
    console.error('Error purchasing pack:', error);
    return NextResponse.json(
      { error: 'Failed to purchase pack' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/shop/purchase
 * Get available booster packs and user's coins
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coins: true },
    });

    return NextResponse.json({
      coins: user?.coins || 0,
      packs: [
        {
          type: 'STANDARD',
          name: 'Standard Booster',
          price: BOOSTER_PACKS.STANDARD.price,
          cardCount: BOOSTER_PACKS.STANDARD.cardCount,
          description: 'Contains 3 cards with at least 1 Rare or better',
        },
        {
          type: 'PREMIUM',
          name: 'Premium Booster',
          price: BOOSTER_PACKS.PREMIUM.price,
          cardCount: BOOSTER_PACKS.PREMIUM.cardCount,
          description: 'Contains 5 cards with better odds for high rarity',
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching shop data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shop data' },
      { status: 500 }
    );
  }
}

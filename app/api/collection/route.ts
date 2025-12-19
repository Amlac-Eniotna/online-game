import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

/**
 * GET /api/collection
 * Fetch user's card collection with counts and golden variants
 */
export async function GET(req: NextRequest) {
  try {
    // Get session from better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user's cards with card details
    const userCards = await prisma.userCard.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        card: true,
      },
      orderBy: [
        { card: { rarity: 'desc' } },
        { card: { cost: 'asc' } },
        { card: { name: 'asc' } },
      ],
    });

    // Transform to include quantity and golden status
    const collection = userCards.map((uc) => ({
      id: uc.card.id,
      name: uc.card.name,
      type: uc.card.type,
      rarity: uc.card.rarity,
      cost: uc.card.cost,
      attack: uc.card.attack,
      health: uc.card.health,
      effect: uc.card.effect,
      effectCode: uc.card.effectCode,
      flavorText: uc.card.flavorText,
      imageUrl: uc.card.imageUrl,
      quantity: uc.quantity,
      isGolden: uc.isGolden,
    }));

    // Get user stats
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        coins: true,
        xp: true,
        level: true,
      },
    });

    return NextResponse.json({
      collection,
      stats: {
        totalCards: userCards.reduce((sum, uc) => sum + uc.quantity, 0),
        uniqueCards: userCards.length,
        coins: user?.coins || 0,
        xp: user?.xp || 0,
        level: user?.level || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

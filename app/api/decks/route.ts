import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

/**
 * GET /api/decks
 * Fetch all user's decks
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

    const decks = await prisma.deck.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        hero: true,
        deckCards: {
          include: {
            card: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to friendly format
    const formattedDecks = decks.map((deck) => ({
      id: deck.id,
      name: deck.name,
      heroId: deck.heroId,
      hero: {
        id: deck.hero.id,
        name: deck.hero.name,
        class: deck.hero.class,
      },
      cards: deck.deckCards.map((dc) => ({
        id: dc.card.id,
        name: dc.card.name,
        type: dc.card.type,
        rarity: dc.card.rarity,
        cost: dc.card.cost,
        attack: dc.card.attack,
        health: dc.card.health,
        effect: dc.card.effect,
        quantity: dc.quantity,
      })),
      totalCards: deck.deckCards.reduce((sum, dc) => sum + dc.quantity, 0),
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    }));

    return NextResponse.json({ decks: formattedDecks });
  } catch (error) {
    console.error('Error fetching decks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch decks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/decks
 * Create a new deck
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
    const { name, heroId, cards } = body;

    // Validate input
    if (!name || !heroId || !cards || !Array.isArray(cards)) {
      return NextResponse.json(
        { error: 'Invalid deck data' },
        { status: 400 }
      );
    }

    // Validate deck has exactly 10 cards
    const totalCards = cards.reduce((sum: number, card: any) => sum + (card.quantity || 1), 0);
    if (totalCards !== 10) {
      return NextResponse.json(
        { error: 'Deck must contain exactly 10 cards' },
        { status: 400 }
      );
    }

    // Verify hero exists
    const hero = await prisma.hero.findUnique({
      where: { id: heroId },
    });

    if (!hero) {
      return NextResponse.json(
        { error: 'Hero not found' },
        { status: 404 }
      );
    }

    // Verify user owns all cards
    const cardIds = cards.map((c: any) => c.cardId);
    const userCards = await prisma.userCard.findMany({
      where: {
        userId: session.user.id,
        cardId: { in: cardIds },
      },
    });

    if (userCards.length !== cardIds.length) {
      return NextResponse.json(
        { error: 'You do not own all cards in this deck' },
        { status: 400 }
      );
    }

    // Create deck
    const deck = await prisma.deck.create({
      data: {
        name,
        userId: session.user.id,
        heroId,
        deckCards: {
          create: cards.map((card: any) => ({
            cardId: card.cardId,
            quantity: card.quantity || 1,
          })),
        },
      },
      include: {
        hero: true,
        deckCards: {
          include: {
            card: true,
          },
        },
      },
    });

    return NextResponse.json({
      deck: {
        id: deck.id,
        name: deck.name,
        heroId: deck.heroId,
        hero: {
          id: deck.hero.id,
          name: deck.hero.name,
          class: deck.hero.class,
        },
        cards: deck.deckCards.map((dc) => ({
          id: dc.card.id,
          name: dc.card.name,
          type: dc.card.type,
          rarity: dc.card.rarity,
          cost: dc.card.cost,
          attack: dc.card.attack,
          health: dc.card.health,
          quantity: dc.quantity,
        })),
      },
    });
  } catch (error) {
    console.error('Error creating deck:', error);
    return NextResponse.json(
      { error: 'Failed to create deck' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/decks
 * Update an existing deck
 */
export async function PUT(req: NextRequest) {
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
    const { deckId, name, heroId, cards } = body;

    if (!deckId) {
      return NextResponse.json(
        { error: 'Deck ID is required' },
        { status: 400 }
      );
    }

    // Verify deck belongs to user
    const existingDeck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId: session.user.id,
      },
    });

    if (!existingDeck) {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      );
    }

    // Validate cards if provided
    if (cards) {
      const totalCards = cards.reduce((sum: number, card: any) => sum + (card.quantity || 1), 0);
      if (totalCards !== 10) {
        return NextResponse.json(
          { error: 'Deck must contain exactly 10 cards' },
          { status: 400 }
        );
      }
    }

    // Update deck
    const updateData: any = {};
    if (name) updateData.name = name;
    if (heroId) updateData.heroId = heroId;

    const deck = await prisma.deck.update({
      where: { id: deckId },
      data: updateData,
      include: {
        hero: true,
        deckCards: {
          include: {
            card: true,
          },
        },
      },
    });

    // Update cards if provided
    if (cards) {
      // Delete existing cards
      await prisma.deckCard.deleteMany({
        where: { deckId },
      });

      // Add new cards
      await prisma.deckCard.createMany({
        data: cards.map((card: any) => ({
          deckId,
          cardId: card.cardId,
          quantity: card.quantity || 1,
        })),
      });

      // Fetch updated deck
      const updatedDeck = await prisma.deck.findUnique({
        where: { id: deckId },
        include: {
          hero: true,
          deckCards: {
            include: {
              card: true,
            },
          },
        },
      });

      return NextResponse.json({
        deck: {
          id: updatedDeck!.id,
          name: updatedDeck!.name,
          heroId: updatedDeck!.heroId,
          cards: updatedDeck!.deckCards.map((dc) => ({
            id: dc.card.id,
            name: dc.card.name,
            quantity: dc.quantity,
          })),
        },
      });
    }

    return NextResponse.json({
      deck: {
        id: deck.id,
        name: deck.name,
        heroId: deck.heroId,
      },
    });
  } catch (error) {
    console.error('Error updating deck:', error);
    return NextResponse.json(
      { error: 'Failed to update deck' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/decks?id=deckId
 * Delete a deck
 */
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const deckId = searchParams.get('id');

    if (!deckId) {
      return NextResponse.json(
        { error: 'Deck ID is required' },
        { status: 400 }
      );
    }

    // Verify deck belongs to user
    const deck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId: session.user.id,
      },
    });

    if (!deck) {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      );
    }

    // Delete deck (cascade will delete deckCards)
    await prisma.deck.delete({
      where: { id: deckId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting deck:', error);
    return NextResponse.json(
      { error: 'Failed to delete deck' },
      { status: 500 }
    );
  }
}

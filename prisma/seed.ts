import { PrismaClient } from '@prisma/client';
import { CARDS } from '../lib/game/cards-data';
import { HEROES } from '../lib/game/heroes-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.userCard.deleteMany();
  await prisma.deck.deleteMany();
  await prisma.heroProgress.deleteMany();
  await prisma.card.deleteMany();
  await prisma.hero.deleteMany();

  console.log('✅ Cleared existing data\n');

  // Seed Heroes
  console.log('👾 Seeding 9 Galaxy Misfits Heroes...');

  for (const heroData of HEROES) {
    await prisma.hero.create({
      data: {
        id: heroData.id,
        name: heroData.name,
        class: heroData.class,
        description: heroData.description,
        powerName: heroData.powerName,
        powerEffect: heroData.powerEffect,
        powerCost: heroData.powerCost,
        baseHealth: heroData.baseHealth,
        imageUrl: `/heroes/${heroData.id}.png`, // Placeholder
        portraitUrl: `/heroes/${heroData.id}-portrait.png`, // Placeholder
      },
    });
    console.log(`  ✓ ${heroData.name} (${heroData.class})`);
  }

  console.log(`\n✅ Seeded ${HEROES.length} heroes\n`);

  // Seed Cards
  console.log('🃏 Seeding 50 base cards...');

  let createdCards = 0;

  for (const cardData of CARDS) {
    await prisma.card.create({
      data: {
        name: cardData.name,
        type: cardData.type,
        rarity: cardData.rarity,
        cost: cardData.cost,
        attack: cardData.attack,
        health: cardData.health,
        effect: cardData.effect,
        effectCode: cardData.effectCode,
        heroEffects: cardData.heroEffects || null,
        flavorText: cardData.flavorText,
        imageUrl: `/cards/${cardData.name.toLowerCase().replace(/\s+/g, '-')}.png`, // Placeholder
        set: cardData.set,
      },
    });
    createdCards++;

    if (createdCards % 10 === 0) {
      console.log(`  ✓ Created ${createdCards} cards...`);
    }
  }

  console.log(`\n✅ Seeded ${createdCards} cards\n`);

  // Card distribution stats
  const cardsByRarity = CARDS.reduce((acc, card) => {
    acc[card.rarity] = (acc[card.rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📊 Card Distribution:');
  Object.entries(cardsByRarity).forEach(([rarity, count]) => {
    console.log(`  ${rarity}: ${count} cards`);
  });

  const cardsByType = CARDS.reduce((acc, card) => {
    acc[card.type] = (acc[card.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 Card Types:');
  Object.entries(cardsByType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} cards`);
  });

  // Create a demo user
  console.log('\n👤 Creating demo user...');

  const demoUser = await prisma.user.create({
    data: {
      username: 'demo-player',
      email: 'demo@mercdeckmadness.com',
      passwordHash: 'demo-hash', // In real app, use proper hashing
      coins: 10000,
      premiumCoins: 1000,
      xp: 500,
      level: 5,
      gamesPlayed: 10,
      gamesWon: 6,
      rank: 1250,
    },
  });

  console.log(`  ✓ Created user: ${demoUser.username}`);

  // Give demo user some starter cards
  console.log('\n🎁 Giving demo user starter cards...');

  const allCards = await prisma.card.findMany();
  const starterCards = allCards.filter(c => c.rarity === 'COMMON').slice(0, 20);

  for (const card of starterCards) {
    await prisma.userCard.create({
      data: {
        userId: demoUser.id,
        cardId: card.id,
        quantity: Math.floor(Math.random() * 3) + 1, // 1-3 copies
        isGolden: Math.random() < 0.1, // 10% chance of golden
      },
    });
  }

  // Add some rare/epic cards
  const rareCards = allCards.filter(c => c.rarity === 'RARE').slice(0, 5);
  for (const card of rareCards) {
    await prisma.userCard.create({
      data: {
        userId: demoUser.id,
        cardId: card.id,
        quantity: 1,
      },
    });
  }

  const epicCards = allCards.filter(c => c.rarity === 'EPIC').slice(0, 2);
  for (const card of epicCards) {
    await prisma.userCard.create({
      data: {
        userId: demoUser.id,
        cardId: card.id,
        quantity: 1,
      },
    });
  }

  console.log(`  ✓ Gave ${starterCards.length + rareCards.length + epicCards.length} cards to demo user`);

  // Create a starter deck for demo user
  console.log('\n🎴 Creating starter deck for demo user...');

  const jetpackJunkie = await prisma.hero.findUnique({
    where: { id: 'jetpack-junkie' },
  });

  if (jetpackJunkie) {
    const userCards = await prisma.userCard.findMany({
      where: { userId: demoUser.id },
      include: { card: true },
    });

    // Build a 10-card deck
    const deckCards = userCards.slice(0, 10).map(uc => ({
      cardId: uc.cardId,
      quantity: 1,
    }));

    await prisma.deck.create({
      data: {
        userId: demoUser.id,
        heroId: jetpackJunkie.id,
        name: 'Jetpack Starter Deck',
        cards: deckCards,
        isActive: true,
      },
    });

    console.log(`  ✓ Created starter deck with Jetpack Junkie`);
  }

  // Initialize hero progress for demo user
  console.log('\n📈 Initializing hero progress...');

  for (const hero of HEROES) {
    const dbHero = await prisma.hero.findUnique({
      where: { id: hero.id },
    });

    if (dbHero) {
      await prisma.heroProgress.create({
        data: {
          userId: demoUser.id,
          heroId: dbHero.id,
          xp: hero.id === 'jetpack-junkie' ? 250 : 0,
          level: hero.id === 'jetpack-junkie' ? 3 : 1,
          gamesPlayed: hero.id === 'jetpack-junkie' ? 5 : 0,
          gamesWon: hero.id === 'jetpack-junkie' ? 3 : 0,
        },
      });
    }
  }

  console.log(`  ✓ Initialized progress for all ${HEROES.length} heroes`);

  // Create a test season
  console.log('\n🏆 Creating Season 1...');

  await prisma.season.create({
    data: {
      number: 1,
      name: 'Galactic Chaos',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-03-31'),
      rewards: [
        { rank: 'Bronze', reward: 500 },
        { rank: 'Silver', reward: 1000 },
        { rank: 'Gold', reward: 2000 },
        { rank: 'Platinum', reward: 3000 },
        { rank: 'Diamond', reward: 5000 },
        { rank: 'Master', reward: 10000 },
      ],
      active: true,
    },
  });

  console.log('  ✓ Season 1 created\n');

  console.log('✅ Database seed completed!\n');
  console.log('📊 Summary:');
  console.log(`  - ${HEROES.length} Heroes`);
  console.log(`  - ${CARDS.length} Cards`);
  console.log(`  - 1 Demo User (${demoUser.username})`);
  console.log(`  - 1 Starter Deck`);
  console.log(`  - 1 Active Season\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

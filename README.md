# 🚀 Madness Rumble Space

A chaotic multiplayer card game featuring Galaxy Misfits battling across the cosmos!

## 🎮 Game Overview

- **Genre:** Collectible Card Game (CCG)
- **Theme:** Humorous space mercenaries
- **Platform:** Web (Desktop + Mobile)
- **Players:** 1v1
- **Session:** 10-20 minutes

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS
- **Game Engine:** Phaser 3
- **Backend:** Next.js API Routes, PostgreSQL, Prisma
- **Authentication:** Better-Auth
- **State Management:** Zustand
- **Real-time:** Socket.io
- **Hosting:** Hostinger VPS with Coolify

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm, npm, or yarn

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/merc_deck_madness"

# Authentication
BETTER_AUTH_SECRET="your-super-secret-key-generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"

# Socket.io
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
SOCKET_PORT=3001

# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with 50 cards and 9 heroes
npm run db:seed

# (Optional) Open Prisma Studio to view database
npm run db:studio
```

### 4. Run Development Server

**Option A: Run everything (recommended)**
```bash
npm run dev:all
```
This starts both Next.js (port 3000) and Socket.io (port 3001).

**Option B: Run separately**
```bash
# Terminal 1 - Next.js
npm run dev

# Terminal 2 - Socket.io server
npm run dev:socket
```

### 5. Access the App

- **App:** [http://localhost:3000](http://localhost:3000)
- **Register:** [http://localhost:3000/register](http://localhost:3000/register)
- **Login:** [http://localhost:3000/login](http://localhost:3000/login)
- **Play:** [http://localhost:3000/play](http://localhost:3000/play)

### 6. First Time Setup

1. Create an account at `/register`
2. Visit the **Shop** to open booster packs (you start with 0 coins for now)
3. Build a **Deck** (10 cards + 1 hero)
4. Click **Play** and find a match!

## 📁 Project Structure

```
/app                    # Next.js App Router
  /(auth)              # Authentication pages (login, register)
  /(game)              # Game pages (play, collection, shop, etc.)
  /api                 # API routes
/components            # React components
  /game                # Phaser game components
    /scenes            # Phaser scenes
/lib                   # Utilities
  /auth                # Better-Auth config
  /store               # Zustand stores
/prisma                # Database schema
/public                # Static assets
```

## 🎮 Game Features

### 9 Unique Heroes (Galaxy Misfits)

1. **Jetpack Junkie** - Speed/Aggression
2. **Rocket Maniac** - AoE/Damage
3. **Plasma Freak** - DoT/Chaos
4. **Mine Layer** - Traps/Control
5. **Tank Brute** - Defense/Sustain
6. **Drone Master** - Structures/Support
7. **Bio-Healer** - Heal/Buffs
8. **Sharpshooter** - Removal/Precision
9. **Shapeshifter** - Trickery/Copy

### Core Mechanics

- **No Mana System** - Play 2 cards per turn
- **Draw Skip** - Skip draw to play 3 cards
- **5 Creature Slots** - Strategic board control
- **Equipment System** - Attach to creatures
- **Hero Powers** - Unique abilities per hero
- **Hero-Synergy Cards** - Effects change based on hero

### Progression

- **Account Levels** - XP rewards
- **Hero Mastery** - Unlock skins & voice lines
- **Ranked Ladder** - Bronze to Master
- **Daily Quests** - Earn coins
- **Battle Pass** - Seasonal rewards
- **Card Crafting** - 5:1 same rarity, 10:1 upgrade

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run dev:socket` | Start Socket.io server (port 3001) |
| `npm run dev:all` | **Run both Next.js + Socket.io** ⭐ |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with cards & heroes |
| `npm run db:studio` | Open Prisma Studio |

## 🗄️ Database Schema

Key models:
- **User** - Player accounts, progression, stats
- **Card** - Card definitions
- **UserCard** - Player's card collection
- **Hero** - 9 Galaxy Misfits
- **Deck** - Player decks
- **Match** - Game history
- **Quest** - Daily/weekly quests
- **Season** - Ranked seasons
- **ShopItem** - Store items
- **BattlePass** - Seasonal progression

See full schema in `prisma/schema.prisma`

## 🎨 Design Philosophy

- **Chaotic Fun** - Embrace RNG and unexpected moments
- **Skill-Based** - But skill matters more than luck
- **F2P Friendly** - Competitive deck in ~1 week
- **Meme Potential** - Shareable, funny moments

## 📖 Game Design Document

See [GAME_DESIGN.md](./GAME_DESIGN.md) for complete game design, mechanics, and roadmap.

## 🚧 Development Status

**Current Phase:** CORE COMPLETE ✅ 🎉

### Week 1 - Architecture ✅
- ✅ Next.js 16 + Prisma setup
- ✅ Better-Auth authentication
- ✅ Zustand state management
- ✅ Phaser integration

### Week 2 - Game Engine ✅
- ✅ 50 base cards defined
- ✅ 9 heroes with unique powers
- ✅ Card effect system (40+ effects)
- ✅ Game state machine
- ✅ Turn logic (draw, play, combat, end)
- ✅ Combat resolution system
- ✅ Database seed script
- ✅ Game engine tested

### Week 3 - UI & Multiplayer ✅
- ✅ Card UI components (Card, CardList, CardFilters)
- ✅ Collection view with filters
- ✅ Hero selection component
- ✅ Deck builder UI
- ✅ Shop with booster opening
- ✅ Socket.io server with matchmaking
- ✅ Real-time game synchronization
- ✅ Full multiplayer infrastructure

### API Integration ✅
- ✅ Collection API (fetch user cards)
- ✅ Decks API (CRUD operations)
- ✅ Shop API (booster purchases)
- ✅ Real authentication integration

### Phaser Game Board ✅
- ✅ Interactive game board
- ✅ Drag & drop cards to play
- ✅ Attack system (select attacker → select target)
- ✅ Hero power button
- ✅ Victory/defeat screens
- ✅ Real-time state synchronization

### Remaining (Future Enhancements)
- [ ] Sound effects and music
- [ ] More card animations
- [ ] Spectator mode
- [ ] Replay system
- [ ] Mobile touch controls optimization

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

## 📄 License

MIT

---

**Made with ❤️ and ☕**
**Powered by Next.js 16, Phaser 3, and PostgreSQL**

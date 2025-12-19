# Merc Deck Madness - Game Design Document

## 🎮 Game Overview

**Title:** Merc Deck Madness
**Genre:** Multiplayer Card Game (CCG)
**Theme:** Galaxy Misfits - Humorous Space Mercenaries
**Platform:** Web (Desktop + Mobile Browser)
**Session Duration:** 10-20 minutes
**Players:** 1v1

---

## 🌌 Universe & Theme

**Setting:** A chaotic galaxy where misfit mercenaries battle for contracts, loot, and glory.

**Tone:** Humorous, chaotic, over-the-top sci-fi action with meme-worthy moments.

**Art Style:** Vibrant space cartoon aesthetic with exaggerated character designs, bright neon colors (purples, cyans, pinks), and particle effects.

---

## 🦸 The 9 Galaxy Misfits (Heroes)

### 1. **Jetpack Junkie** (Speed/Aggression)
- **Class:** Assault
- **Playstyle:** Fast, aggressive, swarm tactics
- **Hero Power (2 cost):** "Boost Thrusters" - Give a creature +2 attack this turn
- **Signature Mechanic:** First Strike - His creatures attack before opponent's creatures
- **Visual:** Hyperactive alien with oversized jetpack, always in motion

### 2. **Rocket Maniac** (AoE/Direct Damage)
- **Class:** Demolition
- **Playstyle:** Area damage, board control
- **Hero Power (2 cost):** "Missile Barrage" - Deal 2 damage to all enemy creatures
- **Signature Mechanic:** Splash Damage - His damage spells hit adjacent targets
- **Visual:** Trigger-happy merc with rocket launcher, always grinning

### 3. **Plasma Freak** (DoT/Chaos)
- **Class:** Pyromaniac
- **Playstyle:** Damage over time, chaos effects
- **Hero Power (2 cost):** "Ignite" - Deal 1 damage to target creature. It burns for 1 damage per turn.
- **Signature Mechanic:** Burn - Creatures damaged by his cards take continuous damage
- **Visual:** Unhinged alien in hazmat suit with plasma thrower

### 4. **Mine Layer** (Traps/Control)
- **Class:** Trapper
- **Playstyle:** Reactive, trap-based control
- **Hero Power (2 cost):** "Deploy Mine" - Set a trap that triggers when opponent plays a creature
- **Signature Mechanic:** Traps - Cards that activate on opponent's turn
- **Visual:** One-eyed cyclops with bomb vest and detonator

### 5. **Tank Brute** (Tank/Defense)
- **Class:** Heavy
- **Playstyle:** High HP creatures, sustain
- **Hero Power (2 cost):** "Fortify" - Give a creature +0/+3 health
- **Signature Mechanic:** Ramp Up - His creatures gain +1 attack each turn they survive
- **Visual:** Massive four-armed alien with minigun

### 6. **Drone Master** (Structures/Support)
- **Class:** Engineer
- **Playstyle:** Build structures, summon tokens
- **Hero Power (2 cost):** "Deploy Turret" - Summon a 0/3 Turret that deals 1 damage each turn
- **Signature Mechanic:** Constructs - Permanent creatures that provide passive effects
- **Visual:** Tech-savvy robot with floating drones

### 7. **Bio-Healer** (Heal/Buff)
- **Class:** Medic
- **Playstyle:** Sustain, buff allies
- **Hero Power (2 cost):** "Nanobots" - Restore 3 health to your hero or a creature
- **Signature Mechanic:** Regeneration - Can heal creatures and hero
- **Visual:** Alien doctor with syringe gun and medical scanner

### 8. **Sharpshooter** (Removal/Precision)
- **Class:** Sniper
- **Playstyle:** Single-target removal, control
- **Hero Power (2 cost):** "Headshot" - Destroy target creature with 3 or less health
- **Signature Mechanic:** Execute - Deals double damage to damaged creatures
- **Visual:** Calm, four-eyed alien with high-tech sniper rifle

### 9. **Shapeshifter** (Trickery/Disruption)
- **Class:** Infiltrator
- **Playstyle:** Copy effects, hand disruption
- **Hero Power (2 cost):** "Mimic" - Copy the last card your opponent played
- **Signature Mechanic:** Steal/Copy - Can use opponent's cards
- **Visual:** Amorphous blob alien that changes appearance

---

## 🃏 Card System

### Card Types

1. **Creatures** - Summonable units with Attack/Health
2. **Spells** - Instant effects (damage, draw, buffs)
3. **Equipments** - Attach to creatures for permanent bonuses
4. **Traps** - Hidden cards that trigger on opponent's actions

### Card Rarities

- **Common** (60% drop rate) - Basic cards
- **Rare** (25% drop rate) - Stronger effects
- **Epic** (10% drop rate) - Powerful combos
- **Legendary** (4% drop rate) - Game-changing cards
- **Mythic** (0.9% drop rate) - Ultra-rare, flashy
- **Seasonal** (0.1% drop rate) - Limited-time exclusive

### Deck Building

- **Deck Size:** 10 cards
- **No Copy Limit:** Can have multiple copies of same card
- **Hero-Specific Effects:** Some cards change based on hero
- **Example:** "Plasma Grenade"
  - Normal: Deal 3 damage
  - With Plasma Freak: Deal 3 damage + apply burn
  - With Rocket Maniac: Deal 2 damage to all enemies

---

## ⚔️ Game Mechanics

### Core Gameplay Loop

1. **Start Phase:** Draw 1 card (or skip draw to play 3 cards instead of 2)
2. **Main Phase:** Play up to 2 cards
3. **Combat Phase:** Attack with creatures
4. **End Turn:** Pass to opponent

### Combat Rules

- **Board Limit:** 5 creatures max per player
- **No Mana System:** Cards are balanced by power level, not cost
- **Attack Priority:** Creatures can attack hero or other creatures
- **Equipment System:** Up to 1 equipment per creature

### Win Conditions

- Reduce opponent's HP from 20 to 0
- Opponent cannot draw (deck out)

### Special Mechanics

#### Draw Skip Mechanic
- Skip your draw → Play 3 cards this turn (instead of 2)
- High-risk, high-reward tempo play

#### Hero-Specific Card Effects
- Certain "Universal" cards have different effects based on hero
- Encourages experimenting with different hero/deck combos

#### Equipment Stacking
- Creatures can equip 1 equipment
- Equipment persists even if creature dies (returns to hand)

#### Chaos Cards (RNG Fun)
- "Random Crit" - 50% chance to deal double damage
- "Malfunction" - Swap a random creature's attack and health
- "Cosmic Lottery" - Draw 3 cards, discard 2 random cards

---

## 💰 Business Model

### Monetization

**Primary Currency:** Coins (earned in-game)
**Premium Currency:** None (single currency system)

### Earning Coins

- **Win:** 500 coins
- **Loss:** 100 coins
- **Daily Quests:** ~600 coins (40% of a booster)
- **Season Rewards:** 1000-5000 coins based on rank

### Shop

- **Booster Pack:** 1500 coins (3 random cards, no rarity guarantee)
- **Hero Skins:** 5000-10000 coins
- **Card Backs:** 2000 coins
- **Battle Pass:** 15000 coins (~$5 equivalent if purchasable)

### Pay-to-Win Balance

- **Soft P2W:** Paying speeds up collection
- **F2P Competitive Deck:** ~1 week of daily play
- **Crafting System:** 5 cards → 1 random of same rarity, 10 cards → upgrade to next rarity

---

## 🎯 Progression & Retention

### Account Progression

- **XP System:** 100 XP per win, 25 XP per loss
- **Level Up Rewards:** Coins, boosters, cosmetics
- **Max Level:** 100 (prestige available with special borders)

### Hero Mastery

- **Per-Hero XP:** Track separately
- **Level 5:** Unlock alternate skin
- **Level 10:** Unlock golden hero portrait
- **Level 20:** Unlock unique voice lines

### Ranked System

**Ranks:**
1. Bronze (0-999)
2. Silver (1000-1999)
3. Gold (2000-2999)
4. Platinum (3000-3999)
5. Diamond (4000-4999)
6. Master (5000+)

**Season Duration:** 3 months
**Rank Decay:** Soft reset at season end (drop 1 tier)

### Daily Quests (Rotating)

- "Win 3 games" - 600 coins
- "Play 5 creatures" - 400 coins
- "Deal 20 damage to enemy hero" - 500 coins
- "Win with [Specific Hero]" - 700 coins

### Weekly Quests

- "Win 10 ranked games" - 2000 coins + 1 booster
- "Play 50 cards" - 1500 coins

### Battle Pass (Seasonal)

- **50 Tiers**
- **Free Track:** Coins, common boosters
- **Premium Track ($5 / 15000 coins):** Exclusive skins, legendary cards, emotes
- **Completion Time:** ~1 hour/day for 3 months

---

## 🎨 UI/UX Design

### Main Menu

- Large hero portraits rotating in background
- Neon-lit buttons (Play, Collection, Shop, etc.)
- Daily quest tracker in corner
- Battle Pass progress bar

### Game Board

- **Top:** Opponent's board (5 slots), HP, hand count
- **Middle:** Interactive zone for card effects
- **Bottom:** Player's board (5 slots), hand area, HP
- **Right:** End Turn button, settings

### Card Design

- **Frame:** Rarity-colored borders (purple = legendary, etc.)
- **Art:** Character/spell illustration
- **Stats:** Attack/Health for creatures
- **Effect Text:** Clear, concise
- **Golden Cards:** Animated shimmer effect

### Booster Opening Animation

1. Pack appears with glow
2. Click to open → explosion of stars
3. Cards flip one-by-one with rarity reveal
4. Legendary = extra fanfare, screen shake

---

## 🔊 Audio Design

### Music

- **Menu:** Upbeat electronic/synthwave
- **In-Game:** Intense but not overwhelming space combat theme
- **Victory:** Triumphant fanfare
- **Booster Opening:** Anticipation build-up → payoff reveal

### SFX

- **Card Play:** Whoosh + thud
- **Attack:** Laser/explosion sounds
- **Hero Power:** Unique sound per hero
- **End Turn:** Satisfying "click"
- **Legendary Card:** Epic choir sting

### Voice Lines

- Heroes have 5-10 voice lines each
- Play on summon, attack, death, victory
- Humorous, personality-driven

---

## 🛠️ Technical Architecture

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **Phaser 3** (Game Board)
- **Zustand** (State Management)
- **Tailwind CSS** (UI)

### Backend
- **Next.js API Routes**
- **PostgreSQL** (Database)
- **Prisma** (ORM)
- **Better-Auth** (Authentication)
- **Socket.io** (Real-time matches)

### Hosting
- **VPS:** Hostinger with Coolify
- **Database:** PostgreSQL on same VPS

---

## 📊 50 Base Cards (MVP)

### Distribution
- **30 Universal Cards** (work with all heroes)
- **20 Hero-Synergy Cards** (effects change based on hero)

### Rarity Breakdown
- **25 Common**
- **15 Rare**
- **7 Epic**
- **3 Legendary**

### Example Cards

#### Universal Creatures

1. **Space Rookie** (Common)
   - 2/2 Creature - No effect

2. **Asteroid Miner** (Common)
   - 1/3 Creature - When summoned, draw 1 card

3. **Mercenary Veteran** (Rare)
   - 3/3 Creature - Cannot be targeted by spells

4. **Cosmic Golem** (Epic)
   - 5/5 Creature - Costs 1 less for each creature you control

5. **Galactic Leviathan** (Legendary)
   - 8/8 Creature - When summoned, destroy all other creatures

#### Universal Spells

6. **Laser Blast** (Common)
   - Deal 3 damage to target creature or hero

7. **Shield Generator** (Common)
   - Give a creature +0/+4 health

8. **Tactical Retreat** (Rare)
   - Return a creature to your hand, draw 1 card

9. **Meteor Strike** (Epic)
   - Deal 5 damage to all creatures

10. **Time Warp** (Legendary)
    - Take an extra turn after this one

#### Equipments

11. **Plasma Blade** (Common)
    - +2/+0 - Equipped creature has First Strike

12. **Energy Shield** (Rare)
    - +0/+3 - Equipped creature cannot be destroyed by spells

13. **Gravity Hammer** (Epic)
    - +3/+0 - When this creature attacks, stun target creature

#### Traps

14. **Proximity Mine** (Common)
    - When opponent plays a creature, deal 2 damage to it

15. **EMP Trap** (Rare)
    - When opponent plays a spell, counter it and draw 1 card

16. **Void Snare** (Epic)
    - When opponent attacks, destroy attacking creature

#### Hero-Synergy Cards

17. **Overcharge** (Common - Equipment)
    - +1/+1
    - *Jetpack Junkie:* +2/+0 and gain First Strike
    - *Other:* +1/+1

18. **Explosive Round** (Rare - Spell)
    - Deal 4 damage to target
    - *Rocket Maniac:* Deal 2 damage to all enemies
    - *Sharpshooter:* Destroy target creature with 5 or less health

19. **Nano Swarm** (Epic - Spell)
    - Restore 5 health to your hero
    - *Bio-Healer:* Restore 5 health to your hero and all creatures
    - *Other:* Restore 5 health to your hero

20. **Sabotage** (Legendary - Spell)
    - Destroy target creature
    - *Shapeshifter:* Copy it to your hand
    - *Mine Layer:* Set a trap that destroys next creature played

---

## 🚀 Development Roadmap (MVP - 4 weeks)

### Week 1: Core Infrastructure
- ✅ Next.js 16 setup
- ✅ Prisma + PostgreSQL
- ✅ Better-Auth
- ✅ Zustand stores
- ✅ Phaser integration

### Week 2: Game Engine
- [ ] Card system implementation
- [ ] Game state machine
- [ ] Turn logic
- [ ] Combat resolution
- [ ] 9 heroes with powers

### Week 3: UI & Matchmaking
- [ ] Deck builder
- [ ] Collection view
- [ ] Socket.io matchmaking
- [ ] Game board UI (Phaser)
- [ ] Real-time sync

### Week 4: Progression & Polish
- [ ] 50 base cards
- [ ] Quest system
- [ ] Shop & booster opening
- [ ] Ranked system
- [ ] Audio/animations

---

## 🎲 Post-Launch Content

### Month 1
- Balance patches
- Bug fixes
- QoL improvements

### Month 2
- First season
- 10 new cards
- Battle Pass

### Month 3
- Second expansion (20 new cards)
- New game mode: "Payload" (objective-based)

### Month 6
- Third expansion
- Tournament system
- Spectator mode

---

## 📈 Success Metrics

### KPIs
- **DAU (Daily Active Users):** Target 1000+ after 3 months
- **Retention:** 40% D1, 20% D7, 10% D30
- **Avg Session:** 20-30 minutes
- **Conversion Rate:** 5% to Battle Pass

### Community Goals
- Discord server: 500+ members
- Reddit community
- Content creators playing

---

**Last Updated:** 2025-12-19
**Version:** 1.0 - MVP Design

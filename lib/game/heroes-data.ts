/**
 * The 9 Galaxy Misfits Heroes
 * Each with unique abilities and playstyles
 */

export interface HeroDefinition {
  id: string;
  name: string;
  class: string;
  description: string;
  powerName: string;
  powerEffect: string;
  powerCost: number;
  powerCode: string; // For game logic
  baseHealth: number;
  playstyle: string;
  signatureMechanic: string;
}

export const HEROES: HeroDefinition[] = [
  {
    id: 'jetpack-junkie',
    name: 'Jetpack Junkie',
    class: 'Assault',
    description: 'A hyperactive alien with an oversized jetpack. Fast, aggressive, and always in motion.',
    powerName: 'Boost Thrusters',
    powerEffect: 'Give a creature +2 attack this turn',
    powerCost: 2,
    powerCode: 'BOOST_THRUSTERS',
    baseHealth: 20,
    playstyle: 'Fast, aggressive, swarm tactics',
    signatureMechanic: 'First Strike - His creatures attack before opponent\'s creatures',
  },
  {
    id: 'rocket-maniac',
    name: 'Rocket Maniac',
    class: 'Demolition',
    description: 'A trigger-happy merc with a rocket launcher, always grinning.',
    powerName: 'Missile Barrage',
    powerEffect: 'Deal 2 damage to all enemy creatures',
    powerCost: 2,
    powerCode: 'MISSILE_BARRAGE',
    baseHealth: 20,
    playstyle: 'Area damage, board control',
    signatureMechanic: 'Splash Damage - His damage spells hit adjacent targets',
  },
  {
    id: 'plasma-freak',
    name: 'Plasma Freak',
    class: 'Pyromaniac',
    description: 'An unhinged alien in a hazmat suit with a plasma thrower.',
    powerName: 'Ignite',
    powerEffect: 'Deal 1 damage to target creature. It burns for 1 damage per turn.',
    powerCost: 2,
    powerCode: 'IGNITE',
    baseHealth: 20,
    playstyle: 'Damage over time, chaos effects',
    signatureMechanic: 'Burn - Creatures damaged by his cards take continuous damage',
  },
  {
    id: 'mine-layer',
    name: 'Mine Layer',
    class: 'Trapper',
    description: 'A one-eyed cyclops with a bomb vest and detonator.',
    powerName: 'Deploy Mine',
    powerEffect: 'Set a trap that triggers when opponent plays a creature (deals 3 damage)',
    powerCost: 2,
    powerCode: 'DEPLOY_MINE',
    baseHealth: 20,
    playstyle: 'Reactive, trap-based control',
    signatureMechanic: 'Traps - Cards that activate on opponent\'s turn',
  },
  {
    id: 'tank-brute',
    name: 'Tank Brute',
    class: 'Heavy',
    description: 'A massive four-armed alien with a minigun.',
    powerName: 'Fortify',
    powerEffect: 'Give a creature +0/+3 health',
    powerCost: 2,
    powerCode: 'FORTIFY_POWER',
    baseHealth: 20,
    playstyle: 'High HP creatures, sustain',
    signatureMechanic: 'Ramp Up - His creatures gain +1 attack each turn they survive',
  },
  {
    id: 'drone-master',
    name: 'Drone Master',
    class: 'Engineer',
    description: 'A tech-savvy robot with floating drones.',
    powerName: 'Deploy Turret',
    powerEffect: 'Summon a 0/3 Turret that deals 1 damage to a random enemy each turn',
    powerCost: 2,
    powerCode: 'DEPLOY_TURRET',
    baseHealth: 20,
    playstyle: 'Build structures, summon tokens',
    signatureMechanic: 'Constructs - Permanent creatures that provide passive effects',
  },
  {
    id: 'bio-healer',
    name: 'Bio-Healer',
    class: 'Medic',
    description: 'An alien doctor with a syringe gun and medical scanner.',
    powerName: 'Nanobots',
    powerEffect: 'Restore 3 health to your hero or a creature',
    powerCost: 2,
    powerCode: 'NANOBOTS',
    baseHealth: 20,
    playstyle: 'Sustain, buff allies',
    signatureMechanic: 'Regeneration - Can heal creatures and hero',
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    class: 'Sniper',
    description: 'A calm, four-eyed alien with a high-tech sniper rifle.',
    powerName: 'Headshot',
    powerEffect: 'Destroy target creature with 3 or less health',
    powerCost: 2,
    powerCode: 'HEADSHOT',
    baseHealth: 20,
    playstyle: 'Single-target removal, control',
    signatureMechanic: 'Execute - Deals double damage to damaged creatures',
  },
  {
    id: 'shapeshifter',
    name: 'Shapeshifter',
    class: 'Infiltrator',
    description: 'An amorphous blob alien that changes appearance.',
    powerName: 'Mimic',
    powerEffect: 'Copy the last card your opponent played',
    powerCost: 2,
    powerCode: 'MIMIC',
    baseHealth: 20,
    playstyle: 'Copy effects, hand disruption',
    signatureMechanic: 'Steal/Copy - Can use opponent\'s cards',
  },
];

// Validate we have exactly 9 heroes
if (HEROES.length !== 9) {
  throw new Error(`Expected 9 heroes, got ${HEROES.length}`);
}

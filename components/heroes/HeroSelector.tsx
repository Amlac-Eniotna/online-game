"use client";

import { HEROES } from '@/lib/game/heroes-data';
import Image from 'next/image';
import { useState } from 'react';

interface HeroCardProps {
  hero: typeof HEROES[0];
  isSelected: boolean;
  onClick: () => void;
}

function HeroCard({ hero, isSelected, onClick }: HeroCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        relative rounded-lg overflow-hidden cursor-pointer
        transition-all duration-300 border-2
        ${isSelected ? 'border-space-cyan ring-4 ring-space-cyan/50 scale-105' : 'border-space-purple/30'}
        ${isHovered ? 'scale-105 z-10' : 'scale-100'}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-space-purple/30 to-space-blue/30" />

      {/* Hero Portrait */}
      <div className="relative p-6">
        <div className="relative w-full aspect-square bg-gradient-to-br from-space-dark to-space-purple/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
          <Image
            src={hero.image}
            alt={hero.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Hero Info */}
        <h3 className="text-xl font-bold text-white mb-1">{hero.name}</h3>
        <p className="text-sm text-space-cyan mb-3">{hero.class}</p>

        {/* Hero Power */}
        <div className="bg-black/30 rounded-lg p-3 mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-300">{hero.powerName}</span>
            <span className="text-xs bg-space-purple px-2 py-1 rounded-full">{hero.powerCost} cost</span>
          </div>
          <p className="text-xs text-gray-400">{hero.powerEffect}</p>
        </div>

        {/* Playstyle */}
        <p className="text-xs text-gray-500 italic">{hero.playstyle}</p>

        {/* Selected Badge */}
        {isSelected && (
          <div className="absolute top-4 right-4 bg-space-cyan text-white px-3 py-1 rounded-full text-xs font-bold">
            SELECTED
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      {isHovered && !isSelected && (
        <div className="absolute inset-0 bg-gradient-to-t from-space-cyan/20 to-transparent pointer-events-none" />
      )}
    </div>
  );
}

interface HeroSelectorProps {
  onSelect: (heroId: string) => void;
  selectedHeroId?: string;
}

export default function HeroSelector({ onSelect, selectedHeroId }: HeroSelectorProps) {
  const [localSelected, setLocalSelected] = useState(selectedHeroId || '');

  const handleSelect = (heroId: string) => {
    setLocalSelected(heroId);
    onSelect(heroId);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Choose Your Hero</h2>
        <p className="text-gray-400">Select one of the 9 Galaxy Misfits to build your deck around</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {HEROES.map((hero) => (
          <HeroCard
            key={hero.id}
            hero={hero}
            isSelected={localSelected === hero.id}
            onClick={() => handleSelect(hero.id)}
          />
        ))}
      </div>

      {/* Selected Hero Summary */}
      {localSelected && (
        <div className="mt-6 p-4 bg-space-dark/50 border border-space-cyan rounded-lg">
          {(() => {
            const selected = HEROES.find(h => h.id === localSelected);
            return selected ? (
              <div className="flex items-center gap-4">
                <div className="text-4xl">
                  {selected.class === 'Assault' && '⚡'}
                  {selected.class === 'Demolition' && '🚀'}
                  {selected.class === 'Pyromaniac' && '🔥'}
                  {selected.class === 'Trapper' && '💣'}
                  {selected.class === 'Heavy' && '🛡️'}
                  {selected.class === 'Engineer' && '🤖'}
                  {selected.class === 'Medic' && '💉'}
                  {selected.class === 'Sniper' && '🎯'}
                  {selected.class === 'Infiltrator' && '👽'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{selected.name}</h3>
                  <p className="text-sm text-space-cyan">{selected.class}</p>
                  <p className="text-xs text-gray-400 mt-1">{selected.signatureMechanic}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-300">{selected.powerName}</div>
                  <div className="text-xs text-gray-500">Hero Power</div>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}

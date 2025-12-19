"use client";

import { Card as CardType } from '@/lib/game/game-types';
import { useState } from 'react';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isGolden?: boolean;
  showCount?: boolean;
  count?: number;
  size?: 'small' | 'medium' | 'large';
  isSelected?: boolean;
  isDraggable?: boolean;
}

const rarityColors = {
  COMMON: 'from-gray-400 to-gray-600',
  RARE: 'from-blue-400 to-blue-600',
  EPIC: 'from-purple-400 to-purple-600',
  LEGENDARY: 'from-orange-400 to-orange-600',
  MYTHIC: 'from-pink-400 to-pink-600',
  SEASONAL: 'from-cyan-400 to-cyan-600',
};

const rarityGlow = {
  COMMON: 'shadow-gray-500/50',
  RARE: 'shadow-blue-500/50',
  EPIC: 'shadow-purple-500/50',
  LEGENDARY: 'shadow-orange-500/50',
  MYTHIC: 'shadow-pink-500/50',
  SEASONAL: 'shadow-cyan-500/50',
};

const sizeClasses = {
  small: 'w-32 h-44',
  medium: 'w-40 h-56',
  large: 'w-48 h-64',
};

const typeColors = {
  CREATURE: 'bg-green-900/30 border-green-500',
  SPELL: 'bg-blue-900/30 border-blue-500',
  EQUIPMENT: 'bg-yellow-900/30 border-yellow-500',
  TRAP: 'bg-red-900/30 border-red-500',
};

export default function Card({
  card,
  onClick,
  isGolden = false,
  showCount = false,
  count = 1,
  size = 'medium',
  isSelected = false,
  isDraggable = false,
}: CardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const rarityGradient = rarityColors[card.rarity];
  const glowClass = rarityGlow[card.rarity];
  const sizeClass = sizeClasses[size];
  const typeColor = typeColors[card.type];

  return (
    <div
      className={`
        relative ${sizeClass} rounded-lg overflow-hidden
        transition-all duration-300 cursor-pointer
        ${isHovered ? 'scale-110 z-50' : 'scale-100 z-10'}
        ${isSelected ? 'ring-4 ring-space-cyan' : ''}
        ${isGolden ? 'animate-pulse' : ''}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable={isDraggable}
    >
      {/* Card Border with Rarity Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${rarityGradient} opacity-20`} />

      {/* Card Background */}
      <div className={`relative h-full ${typeColor} border-2 backdrop-blur-sm`}>
        {/* Golden Shimmer Effect */}
        {isGolden && (
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-yellow-600/20 animate-pulse" />
        )}

        {/* Card Header */}
        <div className="p-2 border-b border-white/10">
          <div className="flex justify-between items-start">
            <h3 className="text-white font-bold text-sm leading-tight flex-1">
              {card.name}
            </h3>
            <div className={`
              px-2 py-1 rounded-full text-xs font-bold
              bg-gradient-to-r ${rarityGradient} text-white
              shadow-lg ${glowClass}
            `}>
              {card.cost}
            </div>
          </div>

          {/* Rarity Badge */}
          <div className="flex items-center gap-1 mt-1">
            <span className={`
              text-xs px-2 py-0.5 rounded-full
              bg-gradient-to-r ${rarityGradient}
              text-white font-semibold
            `}>
              {card.rarity}
            </span>
            <span className="text-xs text-gray-400">
              {card.type}
            </span>
          </div>
        </div>

        {/* Card Image Area */}
        <div className="relative h-24 bg-gradient-to-br from-space-dark to-space-purple/20 flex items-center justify-center">
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={card.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl opacity-50">
              {card.type === 'CREATURE' ? '👾' :
               card.type === 'SPELL' ? '✨' :
               card.type === 'EQUIPMENT' ? '⚔️' : '💣'}
            </div>
          )}
        </div>

        {/* Stats (for Creatures) */}
        {card.type === 'CREATURE' && card.attack !== undefined && card.health !== undefined && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-between px-2">
            <div className="bg-red-600 rounded-full w-8 h-8 flex items-center justify-center border-2 border-white/50 shadow-lg">
              <span className="text-white font-bold text-sm">
                {card.attack}
              </span>
            </div>
            <div className="bg-green-600 rounded-full w-8 h-8 flex items-center justify-center border-2 border-white/50 shadow-lg">
              <span className="text-white font-bold text-sm">
                {card.health}
              </span>
            </div>
          </div>
        )}

        {/* Effect Text */}
        {card.effect && (
          <div className="p-2 text-xs text-gray-300 leading-tight h-16 overflow-y-auto">
            {card.effect}
          </div>
        )}

        {/* Count Badge */}
        {showCount && count > 1 && (
          <div className="absolute top-2 right-2 bg-space-purple rounded-full w-6 h-6 flex items-center justify-center border-2 border-white/50 shadow-lg">
            <span className="text-white font-bold text-xs">
              {count}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <p className="text-white text-xs italic">
                {card.flavorText || 'A powerful card from the cosmos.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

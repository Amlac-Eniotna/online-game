"use client";

import { useState } from 'react';
import { CardType, CardRarity } from '@prisma/client';

interface CardFiltersProps {
  onFilterChange: (filters: {
    search: string;
    type: CardType | 'ALL';
    rarity: CardRarity | 'ALL';
    sortBy: 'name' | 'cost' | 'rarity';
  }) => void;
}

export default function CardFilters({ onFilterChange }: CardFiltersProps) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<CardType | 'ALL'>('ALL');
  const [rarity, setRarity] = useState<CardRarity | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'rarity'>('name');

  const handleChange = (newFilters: Partial<typeof filters>) => {
    const filters = { search, type, rarity, sortBy, ...newFilters };
    onFilterChange(filters);
  };

  return (
    <div className="bg-space-dark/50 backdrop-blur-sm border border-space-purple/30 rounded-lg p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Card name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleChange({ search: e.target.value });
            }}
            className="w-full px-3 py-2 bg-space-dark border border-space-purple/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-space-cyan"
          />
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => {
              const newType = e.target.value as CardType | 'ALL';
              setType(newType);
              handleChange({ type: newType });
            }}
            className="w-full px-3 py-2 bg-space-dark border border-space-purple/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-space-cyan"
          >
            <option value="ALL">All Types</option>
            <option value="CREATURE">Creature</option>
            <option value="SPELL">Spell</option>
            <option value="EQUIPMENT">Equipment</option>
            <option value="TRAP">Trap</option>
          </select>
        </div>

        {/* Rarity Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rarity
          </label>
          <select
            value={rarity}
            onChange={(e) => {
              const newRarity = e.target.value as CardRarity | 'ALL';
              setRarity(newRarity);
              handleChange({ rarity: newRarity });
            }}
            className="w-full px-3 py-2 bg-space-dark border border-space-purple/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-space-cyan"
          >
            <option value="ALL">All Rarities</option>
            <option value="COMMON">Common</option>
            <option value="RARE">Rare</option>
            <option value="EPIC">Epic</option>
            <option value="LEGENDARY">Legendary</option>
            <option value="MYTHIC">Mythic</option>
            <option value="SEASONAL">Seasonal</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => {
              const newSort = e.target.value as 'name' | 'cost' | 'rarity';
              setSortBy(newSort);
              handleChange({ sortBy: newSort });
            }}
            className="w-full px-3 py-2 bg-space-dark border border-space-purple/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-space-cyan"
          >
            <option value="name">Name</option>
            <option value="cost">Cost</option>
            <option value="rarity">Rarity</option>
          </select>
        </div>
      </div>
    </div>
  );
}

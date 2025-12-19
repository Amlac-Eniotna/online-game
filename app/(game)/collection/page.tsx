"use client";

import { useState, useEffect } from 'react';
import Card from '@/components/cards/Card';
import CardFilters from '@/components/cards/CardFilters';
import { CardType, CardRarity } from '@prisma/client';
import type { Card as CardData } from '@/lib/game/game-types';

interface CollectionCard extends CardData {
  quantity: number;
  isGolden: boolean;
}

interface CollectionStats {
  totalCards: number;
  uniqueCards: number;
  coins: number;
  xp: number;
  level: number;
}

export default function CollectionPage() {
  const [cards, setCards] = useState<CollectionCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<CollectionCard[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<CollectionCard | null>(null);

  useEffect(() => {
    fetchCollection();
  }, []);

  const fetchCollection = async () => {
    try {
      const response = await fetch('/api/collection');
      if (!response.ok) throw new Error('Failed to fetch collection');

      const data = await response.json();
      setCards(data.collection);
      setFilteredCards(data.collection);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: {
    search: string;
    type: CardType | 'ALL';
    rarity: CardRarity | 'ALL';
    sortBy: 'name' | 'cost' | 'rarity';
  }) => {
    let filtered = [...cards];

    // Filter by search
    if (filters.search) {
      filtered = filtered.filter((card) =>
        card.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filter by type
    if (filters.type !== 'ALL') {
      filtered = filtered.filter((card) => card.type === filters.type);
    }

    // Filter by rarity
    if (filters.rarity !== 'ALL') {
      filtered = filtered.filter((card) => card.rarity === filters.rarity);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'cost':
          return (a.cost || 0) - (b.cost || 0);
        case 'rarity':
          const rarityOrder = { MYTHIC: 5, LEGENDARY: 4, EPIC: 3, RARE: 2, COMMON: 1, SEASONAL: 0 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        default:
          return 0;
      }
    });

    setFilteredCards(filtered);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-space-cyan mx-auto mb-4"></div>
            <p className="text-gray-400">Loading collection...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">My Collection</h1>

        {/* Stats Dashboard */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-space-dark/50 backdrop-blur-sm border border-space-purple/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-space-cyan">{stats.totalCards}</div>
              <div className="text-sm text-gray-400">Total Cards</div>
            </div>
            <div className="bg-space-dark/50 backdrop-blur-sm border border-space-purple/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-space-purple">{stats.uniqueCards}</div>
              <div className="text-sm text-gray-400">Unique Cards</div>
            </div>
            <div className="bg-space-dark/50 backdrop-blur-sm border border-space-purple/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-500">{stats.coins}</div>
              <div className="text-sm text-gray-400">Coins</div>
            </div>
            <div className="bg-space-dark/50 backdrop-blur-sm border border-space-purple/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-500">{stats.level}</div>
              <div className="text-sm text-gray-400">Level</div>
            </div>
            <div className="bg-space-dark/50 backdrop-blur-sm border border-space-purple/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-500">{stats.xp}</div>
              <div className="text-sm text-gray-400">XP</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <CardFilters onFilterChange={handleFilterChange} />

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No cards found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or visit the shop to get more cards!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredCards.map((card) => (
            <Card
              key={`${card.id}-${card.isGolden ? 'golden' : 'normal'}`}
              card={card}
              onClick={() => setSelectedCard(card)}
              isGolden={card.isGolden}
              showCount={true}
              count={card.quantity}
              size="medium"
              isSelected={selectedCard?.id === card.id && selectedCard?.isGolden === card.isGolden}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div className="max-w-md" onClick={(e) => e.stopPropagation()}>
            <Card
              card={selectedCard}
              isGolden={selectedCard.isGolden}
              size="large"
            />
            <div className="mt-4 bg-space-dark/90 border border-space-purple/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Quantity Owned:</span>
                <span className="text-white font-bold">{selectedCard.quantity}</span>
              </div>
              {selectedCard.flavorText && (
                <div className="mt-3 pt-3 border-t border-space-purple/30">
                  <p className="text-gray-300 italic text-sm">{selectedCard.flavorText}</p>
                </div>
              )}
              <button
                onClick={() => setSelectedCard(null)}
                className="mt-4 w-full px-4 py-2 bg-space-purple hover:bg-space-purple/80 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

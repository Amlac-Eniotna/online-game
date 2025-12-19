"use client";

import Card from '@/components/cards/Card';
import CardFilters from '@/components/cards/CardFilters';
import HeroSelector from '@/components/heroes/HeroSelector';
import type { Card as CardData } from '@/lib/game/game-types';
import { CardRarity, CardType } from '@prisma/client';
import { useEffect, useState } from 'react';

interface CollectionCard extends CardData {
  quantity: number;
  isGolden: boolean;
}

interface DeckCard {
  cardId: string;
  quantity: number;
}

interface Deck {
  id: string;
  name: string;
  heroId: string;
  cards: DeckCard[];
  totalCards: number;
  hero: {
    name: string;
    class: string;
  };
  createdAt: string;
}

export default function DeckBuilderPage() {
  const [step, setStep] = useState<'hero' | 'build'>('hero');
  const [selectedHero, setSelectedHero] = useState<string>('');
  const [deckName, setDeckName] = useState('New Deck');
  const [deckCards, setDeckCards] = useState<DeckCard[]>([]);
  const [availableCards, setAvailableCards] = useState<CollectionCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<CollectionCard[]>([]);
  const [savedDecks, setSavedDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [collectionRes, decksRes] = await Promise.all([
        fetch('/api/collection'),
        fetch('/api/decks'),
      ]);

      if (collectionRes.ok) {
        const collectionData = await collectionRes.json();
        setAvailableCards(collectionData.collection);
        setFilteredCards(collectionData.collection);
      }

      if (decksRes.ok) {
        const decksData = await decksRes.json();
        setSavedDecks(decksData.decks);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroSelect = (heroId: string) => {
    setSelectedHero(heroId);
    setStep('build');
  };

  const handleAddCard = (card: CollectionCard) => {
    const currentCount = deckCards.reduce((sum, dc) => sum + dc.quantity, 0);
    if (currentCount >= 10) {
      alert('Deck can only have 10 cards');
      return;
    }

    const existingCard = deckCards.find((dc) => dc.cardId === card.id);
    if (existingCard) {
      setDeckCards(
        deckCards.map((dc) =>
          dc.cardId === card.id ? { ...dc, quantity: dc.quantity + 1 } : dc
        )
      );
    } else {
      setDeckCards([...deckCards, { cardId: card.id, quantity: 1 }]);
    }
  };

  const handleRemoveCard = (cardId: string) => {
    const card = deckCards.find((dc) => dc.cardId === cardId);
    if (!card) return;

    if (card.quantity > 1) {
      setDeckCards(
        deckCards.map((dc) =>
          dc.cardId === cardId ? { ...dc, quantity: dc.quantity - 1 } : dc
        )
      );
    } else {
      setDeckCards(deckCards.filter((dc) => dc.cardId !== cardId));
    }
  };

  const handleSaveDeck = async () => {
    const totalCards = deckCards.reduce((sum, dc) => sum + dc.quantity, 0);
    if (totalCards !== 10) {
      alert('Deck must have exactly 10 cards');
      return;
    }

    if (!selectedHero) {
      alert('Please select a hero');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: deckName,
          heroId: selectedHero,
          cards: deckCards,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save deck');
      }

      alert('Deck saved successfully!');
      fetchData();
      resetDeck();
    } catch (error: any) {
      alert(error.message || 'Failed to save deck');
    } finally {
      setSaving(false);
    }
  };

  const resetDeck = () => {
    setStep('hero');
    setSelectedHero('');
    setDeckName('New Deck');
    setDeckCards([]);
  };

  const handleFilterChange = (filters: {
    search: string;
    type: CardType | 'ALL';
    rarity: CardRarity | 'ALL';
    sortBy: 'name' | 'cost' | 'rarity';
  }) => {
    let filtered = [...availableCards];

    if (filters.search) {
      filtered = filtered.filter((card) =>
        card.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.type !== 'ALL') {
      filtered = filtered.filter((card) => card.type === filters.type);
    }

    if (filters.rarity !== 'ALL') {
      filtered = filtered.filter((card) => card.rarity === filters.rarity);
    }

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

  const totalCardsInDeck = deckCards.reduce((sum, dc) => sum + dc.quantity, 0);
  const avgCost =
    totalCardsInDeck > 0
      ? (
          deckCards.reduce((sum, dc) => {
            const card = availableCards.find((c) => c.id === dc.cardId);
            return sum + (card?.cost || 0) * dc.quantity;
          }, 0) / totalCardsInDeck
        ).toFixed(1)
      : '0';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-space-cyan mx-auto mb-4"></div>
            <p className="text-gray-400">Loading deck builder...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Deck Builder</h1>

      {step === 'hero' ? (
        <div>
          <p className="text-gray-400 mb-4">Step 1: Select your hero</p>
          <HeroSelector onSelect={handleHeroSelect} selectedHeroId={selectedHero} />
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={resetDeck}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                ← Change Hero
              </button>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="px-4 py-2 bg-space-dark border border-space-purple/50 rounded-lg text-white"
                placeholder="Deck Name"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-lg">
                <span className="text-gray-400">Cards: </span>
                <span className={totalCardsInDeck === 10 ? 'text-green-500' : 'text-yellow-500'}>
                  {totalCardsInDeck}
                </span>
                <span className="text-gray-400"> / 10</span>
              </div>
              <button
                onClick={handleSaveDeck}
                disabled={totalCardsInDeck !== 10 || saving}
                className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                  totalCardsInDeck === 10 && !saving
                    ? 'bg-space-cyan hover:bg-space-cyan/80 text-space-dark'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {saving ? 'Saving...' : 'Save Deck'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Available Cards */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Available Cards</h2>
              <CardFilters onFilterChange={handleFilterChange} />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {filteredCards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    onClick={() => handleAddCard(card)}
                    isGolden={card.isGolden}
                    showCount={true}
                    count={card.quantity}
                    size="small"
                  />
                ))}
              </div>
            </div>

            {/* Deck List */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Current Deck</h2>
              <div className="bg-space-dark/50 backdrop-blur-sm border border-space-purple/30 rounded-lg p-4">
                <div className="mb-4 pb-4 border-b border-space-purple/30">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Avg Cost:</span>
                    <span className="text-white">{avgCost}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Cards:</span>
                    <span className="text-white">{totalCardsInDeck} / 10</span>
                  </div>
                </div>

                {deckCards.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Click cards to add to deck</p>
                ) : (
                  <div className="space-y-2">
                    {deckCards.map((dc) => {
                      const card = availableCards.find((c) => c.id === dc.cardId);
                      if (!card) return null;
                      return (
                        <div
                          key={dc.cardId}
                          className="flex items-center justify-between bg-space-dark/50 rounded p-2 hover:bg-space-dark/70 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{card.name}</div>
                            <div className="text-xs text-gray-400">
                              Cost: {card.cost} • {card.type}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">x{dc.quantity}</span>
                            <button
                              onClick={() => handleRemoveCard(dc.cardId)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                            >
                              -
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Decks */}
      {savedDecks.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Saved Decks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDecks.map((deck) => (
              <div
                key={deck.id}
                className="bg-space-dark/50 backdrop-blur-sm border border-space-purple/30 rounded-lg p-4 hover:border-space-cyan transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold">{deck.name}</h3>
                  <span className="text-sm text-gray-400">{deck.totalCards} cards</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{deck.hero.name} - {deck.hero.class}</p>
                <div className="text-xs text-gray-500">
                  Created: {new Date(deck.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

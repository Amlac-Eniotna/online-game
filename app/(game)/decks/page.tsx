"use client";

import { useState } from 'react';
import HeroSelector from '@/components/heroes/HeroSelector';

export default function DeckBuilderPage() {
  const [selectedHero, setSelectedHero] = useState<string>('');
  const [deckCards, setDeckCards] = useState<any[]>([]);
  const [deckName, setDeckName] = useState('New Deck');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Deck Builder</h1>
      <HeroSelector onSelect={setSelectedHero} selectedHeroId={selectedHero} />
      
      {selectedHero && (
        <div className="mt-8 p-4 border border-space-cyan rounded-lg">
          <p className="text-gray-400">Hero selected! Deck builder coming soon...</p>
          <p className="text-sm text-gray-500 mt-2">Cards in deck: {deckCards.length} / 10</p>
        </div>
      )}
    </div>
  );
}

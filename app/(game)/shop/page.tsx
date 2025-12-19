"use client";

import { useState, useEffect } from 'react';
import Card from '@/components/cards/Card';
import type { Card as CardData } from '@/lib/game/game-types';

interface BoosterPack {
  type: string;
  name: string;
  price: number;
  cardCount: number;
  description: string;
}

interface OpenedCard extends CardData {
  isGolden: boolean;
}

export default function ShopPage() {
  const [coins, setCoins] = useState(0);
  const [packs, setPacks] = useState<BoosterPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [openedCards, setOpenedCards] = useState<OpenedCard[]>([]);
  const [showReveal, setShowReveal] = useState(false);

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      const response = await fetch('/api/shop/purchase');
      if (!response.ok) throw new Error('Failed to fetch shop data');

      const data = await response.json();
      setCoins(data.coins);
      setPacks(data.packs);
    } catch (error) {
      console.error('Error fetching shop:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packType: string) => {
    const pack = packs.find((p) => p.type === packType);
    if (!pack) return;

    if (coins < pack.price) {
      alert('Insufficient coins!');
      return;
    }

    setPurchasing(true);
    try {
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packType }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to purchase pack');
      }

      const data = await response.json();

      // Update coins
      setCoins(data.coinsRemaining);

      // Show opening animation
      setTimeout(() => {
        setOpenedCards(data.cards);
        setShowReveal(true);
      }, 500);
    } catch (error: any) {
      alert(error.message || 'Failed to purchase pack');
    } finally {
      setPurchasing(false);
    }
  };

  const closeReveal = () => {
    setShowReveal(false);
    setOpenedCards([]);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-space-cyan mx-auto mb-4"></div>
            <p className="text-gray-400">Loading shop...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Shop</h1>
        <div className="bg-space-dark/50 backdrop-blur-sm border border-yellow-500/50 rounded-lg px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">💰</span>
            <div>
              <div className="text-sm text-gray-400">Your Coins</div>
              <div className="text-2xl font-bold text-yellow-500">{coins.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Booster Packs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map((pack) => (
          <div
            key={pack.type}
            className="bg-gradient-to-br from-space-dark to-space-purple/20 border-2 border-space-purple/50 rounded-lg p-6 hover:border-space-cyan transition-all duration-300 hover:scale-105"
          >
            {/* Pack Header */}
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">
                {pack.type === 'STANDARD' ? '📦' : '✨'}
              </div>
              <h2 className="text-2xl font-bold mb-2">{pack.name}</h2>
              <p className="text-sm text-gray-400 mb-4">{pack.description}</p>
            </div>

            {/* Pack Info */}
            <div className="bg-space-dark/50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Cards:</span>
                <span className="text-white font-bold">{pack.cardCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Price:</span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 font-bold text-xl">{pack.price}</span>
                  <span className="text-sm">💰</span>
                </div>
              </div>
            </div>

            {/* Purchase Button */}
            <button
              onClick={() => handlePurchase(pack.type)}
              disabled={purchasing || coins < pack.price}
              className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-300 ${
                coins >= pack.price && !purchasing
                  ? 'bg-gradient-to-r from-space-cyan to-space-purple hover:from-space-purple hover:to-space-cyan text-white shadow-lg shadow-space-cyan/50'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {purchasing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Opening...
                </span>
              ) : coins < pack.price ? (
                'Insufficient Coins'
              ) : (
                'Buy Now'
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Daily Deals Section */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Placeholder for future features */}
          <div className="bg-space-dark/30 border border-space-purple/30 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3 opacity-50">🎁</div>
            <h3 className="text-xl font-bold mb-2 text-gray-400">Daily Deals</h3>
            <p className="text-sm text-gray-500">Special offers refreshed daily</p>
          </div>
          <div className="bg-space-dark/30 border border-space-purple/30 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3 opacity-50">👕</div>
            <h3 className="text-xl font-bold mb-2 text-gray-400">Hero Skins</h3>
            <p className="text-sm text-gray-500">Customize your heroes</p>
          </div>
          <div className="bg-space-dark/30 border border-space-purple/30 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3 opacity-50">🎫</div>
            <h3 className="text-xl font-bold mb-2 text-gray-400">Battle Pass</h3>
            <p className="text-sm text-gray-500">Unlock exclusive rewards</p>
          </div>
        </div>
      </div>

      {/* Card Reveal Modal */}
      {showReveal && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={closeReveal}
        >
          <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2 animate-pulse">Pack Opened!</h2>
              <p className="text-gray-400">You received {openedCards.length} cards</p>
            </div>

            {/* Cards Display */}
            <div className="flex justify-center items-center gap-4 flex-wrap mb-8">
              {openedCards.map((card, index) => (
                <div
                  key={index}
                  className="animate-bounce"
                  style={{
                    animationDelay: `${index * 200}ms`,
                    animationDuration: '1s',
                    animationIterationCount: '1',
                  }}
                >
                  <Card
                    card={card}
                    isGolden={card.isGolden}
                    size="large"
                  />
                </div>
              ))}
            </div>

            {/* Rarity Summary */}
            <div className="bg-space-dark/80 border border-space-purple/50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 text-center">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'].map((rarity) => {
                  const count = openedCards.filter((c) => c.rarity === rarity).length;
                  if (count === 0) return null;
                  return (
                    <div key={rarity} className="text-center">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-gray-400">{rarity}</div>
                    </div>
                  );
                })}
                {openedCards.some((c) => c.isGolden) && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">
                      {openedCards.filter((c) => c.isGolden).length}
                    </div>
                    <div className="text-sm text-yellow-400">GOLDEN ✨</div>
                  </div>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={closeReveal}
              className="w-full py-4 bg-gradient-to-r from-space-cyan to-space-purple hover:from-space-purple hover:to-space-cyan text-white font-bold text-lg rounded-lg transition-all duration-300 shadow-lg shadow-space-cyan/50"
            >
              Add to Collection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

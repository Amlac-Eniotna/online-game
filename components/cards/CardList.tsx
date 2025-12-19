"use client";

import { Card as CardType } from '@/lib/game/game-types';
import Card from './Card';

interface CardListProps {
  cards: Array<{
    card: CardType;
    quantity?: number;
    isGolden?: boolean;
  }>;
  onCardClick?: (card: CardType) => void;
  selectedCardId?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function CardList({
  cards,
  onCardClick,
  selectedCardId,
  size = 'medium',
}: CardListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
      {cards.map((item, index) => (
        <Card
          key={`${item.card.id}-${index}`}
          card={item.card}
          count={item.quantity}
          showCount={item.quantity !== undefined && item.quantity > 1}
          isGolden={item.isGolden}
          onClick={() => onCardClick?.(item.card)}
          isSelected={item.card.id === selectedCardId}
          size={size}
        />
      ))}
    </div>
  );
}

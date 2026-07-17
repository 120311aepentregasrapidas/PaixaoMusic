'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { RatingsRepository } from '@/repositories/ratings.repository';
import { useCurrentUserId } from '@/hooks/use-current-user';
import { cn } from '@/utils/cn';

export function StarRating({ songId }: { songId: string }) {
  const userId = useCurrentUserId();
  const [rating, setRatingState] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;
    const repo = new RatingsRepository(createClient());
    repo.getRating(userId, songId).then(setRatingState);
  }, [userId, songId]);

  const handleRate = async (stars: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;
    setRatingState(stars);
    const repo = new RatingsRepository(createClient());
    await repo.setRating(userId, songId, stars);
  };

  const activeValue = hovered ?? rating ?? 0;

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          onMouseEnter={() => setHovered(value)}
          onClick={(e) => handleRate(value, e)}
          aria-label={`Avaliar com ${value} estrela${value > 1 ? 's' : ''}`}
          className="p-0.5"
        >
          <Star
            className={cn(
              'h-3 w-3 transition-colors',
              value <= activeValue ? 'fill-vinil-400 text-vinil-400' : 'text-parchment-500',
            )}
          />
        </button>
      ))}
    </div>
  );
}

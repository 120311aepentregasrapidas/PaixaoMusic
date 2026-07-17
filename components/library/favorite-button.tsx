'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { FavoritesRepository, type FavoriteEntityType } from '@/repositories/favorites.repository';
import { useCurrentUserId } from '@/hooks/use-current-user';
import { cn } from '@/utils/cn';

export function FavoriteButton({
  entityType,
  entityId,
  size = 'md',
}: {
  entityType: FavoriteEntityType;
  entityId: string;
  size?: 'sm' | 'md';
}) {
  const userId = useCurrentUserId();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const repo = new FavoritesRepository(createClient());
    repo.isFavorite(userId, entityType, entityId).then(setIsFavorite);
  }, [userId, entityType, entityId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || isLoading) return;

    setIsLoading(true);
    const repo = new FavoritesRepository(createClient());
    const result = await repo.toggle(userId, entityType, entityId);
    setIsFavorite(result);
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      aria-pressed={isFavorite}
      className={cn(
        'flex items-center justify-center rounded-full transition-colors',
        size === 'sm' ? 'h-7 w-7' : 'h-9 w-9',
        isFavorite ? 'text-paixao-500' : 'text-parchment-500 hover:text-parchment-100',
      )}
    >
      <Heart className={cn(size === 'sm' ? 'h-4 w-4' : 'h-5 w-5', isFavorite && 'fill-current')} />
    </button>
  );
}

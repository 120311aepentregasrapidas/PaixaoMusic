'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { FavoritesRepository } from '@/repositories/favorites.repository';
import { SongsRepository } from '@/repositories/songs.repository';
import { useCurrentUserId } from '@/hooks/use-current-user';
import { TrackRow } from '@/components/library/track-row';
import type { Song } from '@/types/database';

export default function FavoritosPage() {
  const userId = useCurrentUserId();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const favoritesRepo = new FavoritesRepository(supabase);
    const songsRepo = new SongsRepository(supabase);

    favoritesRepo
      .listSongIds(userId)
      .then((ids) => Promise.all(ids.map((id) => songsRepo.findById(id))))
      .then((results) => setSongs(results.filter((s): s is Song => s !== null)))
      .finally(() => setIsLoading(false));
  }, [userId]);

  return (
    <div className="px-6 py-10 lg:px-10">
      <h1 className="font-display text-2xl font-semibold text-parchment-50">Favoritos</h1>
      <p className="mt-1 text-sm text-parchment-500">Músicas que você marcou com coração.</p>

      <div className="sprocket-divider my-6" />

      {isLoading && <p className="text-sm text-parchment-500">Carregando...</p>}

      {!isLoading && songs.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Heart className="h-8 w-8 text-parchment-500" />
          <p className="text-sm text-parchment-500">
            Nenhum favorito ainda. Toque no coração de qualquer música para adicioná-la aqui.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        {songs.map((song) => (
          <TrackRow key={song.id} song={song} queue={songs} />
        ))}
      </div>
    </div>
  );
}

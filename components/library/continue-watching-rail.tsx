'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { HistoryRepository } from '@/repositories/history.repository';
import { SongsRepository } from '@/repositories/songs.repository';
import { useCurrentUserId } from '@/hooks/use-current-user';
import { SongCard } from './song-card';
import type { Song } from '@/types/database';

export function ContinueWatchingRail() {
  const userId = useCurrentUserId();
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    const historyRepo = new HistoryRepository(supabase);
    const songsRepo = new SongsRepository(supabase);

    historyRepo
      .getContinueWatching(userId)
      .then((entries) => Promise.all(entries.map((e) => songsRepo.findById(e.songId))))
      .then((results) => setSongs(results.filter((s): s is Song => s !== null)));
  }, [userId]);

  if (songs.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-4 font-display text-xl font-semibold text-parchment-50">
        Continuar assistindo
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {songs.map((song) => (
          <SongCard key={song.id} song={song} queue={songs} />
        ))}
      </div>
    </section>
  );
}

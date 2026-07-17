'use client';

import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { HistoryRepository } from '@/repositories/history.repository';
import { SongsRepository } from '@/repositories/songs.repository';
import { useCurrentUserId } from '@/hooks/use-current-user';
import { TrackRow } from '@/components/library/track-row';
import type { Song } from '@/types/database';

export default function HistoricoPage() {
  const userId = useCurrentUserId();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const historyRepo = new HistoryRepository(supabase);
    const songsRepo = new SongsRepository(supabase);

    historyRepo
      .listRecent(userId)
      .then((entries) => {
        // Remove duplicatas mantendo só a ocorrência mais recente de cada música
        const seen = new Set<string>();
        const uniqueIds = entries.map((e) => e.songId).filter((id) => {
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        return Promise.all(uniqueIds.map((id) => songsRepo.findById(id)));
      })
      .then((results) => setSongs(results.filter((s): s is Song => s !== null)))
      .finally(() => setIsLoading(false));
  }, [userId]);

  return (
    <div className="px-6 py-10 lg:px-10">
      <h1 className="font-display text-2xl font-semibold text-parchment-50">Histórico</h1>
      <p className="mt-1 text-sm text-parchment-500">O que você ouviu recentemente.</p>

      <div className="sprocket-divider my-6" />

      {isLoading && <p className="text-sm text-parchment-500">Carregando...</p>}

      {!isLoading && songs.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <History className="h-8 w-8 text-parchment-500" />
          <p className="text-sm text-parchment-500">Nada reproduzido ainda.</p>
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

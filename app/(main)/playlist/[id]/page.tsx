import { notFound } from 'next/navigation';
import { ListMusic } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PlaylistsRepository } from '@/repositories/playlists.repository';
import { PlayAllButton } from '@/components/library/play-all-button';
import { TrackRow } from '@/components/library/track-row';

export default async function PlaylistPage({ params }: { params: { id: string } }) {
  const db = createServerSupabaseClient();
  const repo = new PlaylistsRepository(db);

  const playlist = await repo.findById(params.id);
  if (!playlist) notFound();

  const songs = await repo.getSongs(playlist);

  return (
    <div className="px-6 py-10 lg:px-10">
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-ink-700">
          <ListMusic className="h-8 w-8 text-parchment-500" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-parchment-500">
            {playlist.isAutomatic ? 'Playlist automática' : 'Playlist'}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-parchment-50">
            {playlist.name}
          </h1>
          <p className="mt-1 text-sm text-parchment-500">{songs.length} músicas</p>
        </div>
      </div>

      <PlayAllButton songs={songs} />

      <div className="sprocket-divider my-8" />

      <div className="flex flex-col gap-1">
        {songs.length === 0 ? (
          <p className="text-sm text-parchment-500">Nenhuma música nesta playlist ainda.</p>
        ) : (
          songs.map((song) => <TrackRow key={song.id} song={song} queue={songs} />)
        )}
      </div>
    </div>
  );
}

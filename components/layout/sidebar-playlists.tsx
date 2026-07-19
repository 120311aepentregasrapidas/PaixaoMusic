'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PlaylistsRepository } from '@/repositories/playlists.repository';
import { useCurrentUserId } from '@/hooks/use-current-user';
import type { Playlist } from '@/types/database';

export function SidebarPlaylists() {
  const userId = useCurrentUserId();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const reload = async (uid: string) => {
    const repo = new PlaylistsRepository(createClient());
    setPlaylists(await repo.listByUser(uid));
  };

  useEffect(() => {
    if (!userId) return;
    const repo = new PlaylistsRepository(createClient());
    // Garante que toda conta tenha a playlist automática "Mais tocadas" pronta
    repo.ensureMostPlayedPlaylist(userId).then(() => reload(userId));
  }, [userId]);

  const handleCreate = async () => {
    if (!userId || !newName.trim()) return;
    const repo = new PlaylistsRepository(createClient());
    await repo.create(userId, newName.trim());
    setNewName('');
    setIsCreating(false);
    reload(userId);
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => setIsCreating((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-parchment-300 hover:bg-white/5 hover:text-parchment-50"
      >
        <Plus className="h-3.5 w-3.5" />
        Nova playlist
      </button>

      {isCreating && (
        <div className="flex gap-1 px-3">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Nome da playlist"
            className="w-full rounded-md border border-white/10 bg-ink-800/60 px-2 py-1 text-xs text-parchment-50 placeholder:text-parchment-500"
          />
        </div>
      )}

      {playlists.length === 0 ? (
        <p className="px-3 py-2 text-sm text-parchment-500">Nenhuma playlist ainda.</p>
      ) : (
        playlists.map((playlist) => (
          <Link
            key={playlist.id}
            href={`/playlist/${playlist.id}`}
            className="truncate rounded-lg px-3 py-2 text-sm text-parchment-300 hover:bg-white/5 hover:text-parchment-50"
          >
            {playlist.name}
          </Link>
        ))
      )}
    </div>
  );
}

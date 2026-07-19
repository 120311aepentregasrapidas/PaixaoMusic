'use client';

import { useEffect, useState } from 'react';
import { ListPlus, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PlaylistsRepository } from '@/repositories/playlists.repository';
import { useCurrentUserId } from '@/hooks/use-current-user';
import { cn } from '@/utils/cn';
import type { Playlist } from '@/types/database';

export function AddToPlaylistButton({ songId }: { songId: string }) {
  const userId = useCurrentUserId();
  const [isOpen, setIsOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [addedTo, setAddedTo] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen || !userId) return;
    const repo = new PlaylistsRepository(createClient());
    repo.listByUser(userId).then((all) => setPlaylists(all.filter((p) => !p.isAutomatic)));
  }, [isOpen, userId]);

  const handleAdd = async (playlistId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const repo = new PlaylistsRepository(createClient());
    await repo.addSong(playlistId, songId);
    setAddedTo((prev) => new Set(prev).add(playlistId));
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((v) => !v);
        }}
        aria-label="Adicionar à playlist"
        className="flex h-7 w-7 items-center justify-center rounded-full text-parchment-500 hover:text-parchment-100"
      >
        <ListPlus className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-48 rounded-lg border border-white/10 bg-ink-900 p-1 shadow-2xl">
            {playlists.length === 0 ? (
              <p className="px-3 py-2 text-xs text-parchment-500">
                Crie uma playlist na barra lateral primeiro.
              </p>
            ) : (
              playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={(e) => handleAdd(playlist.id, e)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs text-parchment-100 hover:bg-white/5"
                >
                  <span className="truncate">{playlist.name}</span>
                  {addedTo.has(playlist.id) && (
                    <Check className={cn('h-3.5 w-3.5 shrink-0 text-emerald-400')} />
                  )}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

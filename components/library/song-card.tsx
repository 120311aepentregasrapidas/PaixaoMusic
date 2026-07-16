'use client';

import { Play } from 'lucide-react';
import type { Song } from '@/types/database';
import { usePlayerStore } from '@/store/player-store';

export function SongCard({ song, queue }: { song: Song; queue: Song[] }) {
  const playSong = usePlayerStore((s) => s.playSong);

  return (
    <button
      onClick={() => playSong(song, queue)}
      className="group w-40 shrink-0 rounded-lg p-2 text-left transition-colors hover:bg-white/5"
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-ink-700">
        {song.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={song.coverUrl} alt={song.title} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-ink-950/40 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paixao-500 text-white">
            <Play className="h-4 w-4 pl-0.5" />
          </div>
        </div>
      </div>
      <p className="truncate text-sm font-medium text-parchment-50">{song.title}</p>
      <p className="truncate text-xs text-parchment-500">{song.artist?.name}</p>
    </button>
  );
}

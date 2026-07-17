'use client';

import { Play, Pause } from 'lucide-react';
import type { Song } from '@/types/database';
import { usePlayerStore } from '@/store/player-store';
import { formatDuration } from '@/utils/format';
import { cn } from '@/utils/cn';
import { FavoriteButton } from './favorite-button';
import { StarRating } from './star-rating';

export function TrackRow({ song, queue }: { song: Song; queue: Song[] }) {
  const playSong = usePlayerStore((s) => s.playSong);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  const isCurrent = currentSong?.id === song.id;

  return (
    <div
      className={cn(
        'group flex w-full items-center gap-2 rounded-lg px-3 py-1 transition-colors hover:bg-white/5',
        isCurrent && 'bg-white/5',
      )}
    >
      <button
        onClick={() => (isCurrent ? togglePlay() : playSong(song, queue))}
        className="flex flex-1 items-center gap-4 py-1.5 text-left"
      >
        <span className="flex w-6 shrink-0 items-center justify-center text-sm text-parchment-500">
          <span className="group-hover:hidden">
            {isCurrent && isPlaying ? (
              <span className="flex gap-0.5">
                <span className="h-3 w-0.5 animate-pulse-rec bg-paixao-500" />
                <span className="h-3 w-0.5 animate-pulse-rec bg-paixao-500 [animation-delay:0.2s]" />
                <span className="h-3 w-0.5 animate-pulse-rec bg-paixao-500 [animation-delay:0.4s]" />
              </span>
            ) : (
              song.trackNumber ?? '—'
            )}
          </span>
          <span className="hidden group-hover:block">
            {isCurrent && isPlaying ? (
              <Pause className="h-4 w-4 text-parchment-100" />
            ) : (
              <Play className="h-4 w-4 text-parchment-100" />
            )}
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <p className={cn('truncate text-sm', isCurrent ? 'text-paixao-500' : 'text-parchment-50')}>
            {song.title}
          </p>
        </div>

        <span className="shrink-0 font-mono text-xs text-parchment-500">
          {formatDuration(song.video?.durationSeconds)}
        </span>
      </button>

      <StarRating songId={song.id} />
      <FavoriteButton entityType="song" entityId={song.id} size="sm" />
    </div>
  );
}

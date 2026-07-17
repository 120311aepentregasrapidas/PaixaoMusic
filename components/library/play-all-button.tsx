'use client';

import { Play } from 'lucide-react';
import type { Song } from '@/types/database';
import { Button } from '@/components/ui/button';
import { usePlayerStore } from '@/store/player-store';

export function PlayAllButton({ songs }: { songs: Song[] }) {
  const playSong = usePlayerStore((s) => s.playSong);

  const firstSong = songs[0];
  if (!firstSong) return null;

  return (
    <Button size="lg" className="mt-8" onClick={() => playSong(firstSong, songs)}>
      <Play className="h-4 w-4" />
      Tocar tudo
    </Button>
  );
}

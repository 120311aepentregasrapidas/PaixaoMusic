'use client';

import { useState } from 'react';
import { Radio, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayerStore } from '@/store/player-store';
import type { Song } from '@/types/database';

export function StartRadioButton({ artistId }: { artistId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const playSong = usePlayerStore((s) => s.playSong);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/radio/${artistId}`);
      const data: { songs: Song[] } = await response.json();
      const firstSong = data.songs[0];
      if (firstSong) playSong(firstSong, data.songs);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="secondary" size="lg" className="mt-8 ml-3" onClick={handleClick} disabled={isLoading}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
      Rádio Inteligente
    </Button>
  );
}

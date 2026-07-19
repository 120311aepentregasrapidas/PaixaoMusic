'use client';

import { useEffect, useMemo, useRef } from 'react';
import { X } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { parseLrc, findActiveLyricIndex } from '@/utils/parse-lrc';
import { cn } from '@/utils/cn';

/**
 * Painel de letras sincronizadas (karaokê). Só renderiza algo quando a
 * música atual tem `lyrics_lrc` preenchido — como a importação automática
 * não busca letras (isso exigiria uma fonte externa de letras, fora do
 * escopo hoje), este campo fica disponível para preenchimento manual
 * futuro (ex.: colando um .lrc na música via um editor no painel admin).
 */
export function LyricsPanel() {
  const currentSong = usePlayerStore((s) => s.currentSong);
  const progressSeconds = usePlayerStore((s) => s.progressSeconds);
  const showLyrics = usePlayerStore((s) => s.showLyrics);
  const toggleLyrics = usePlayerStore((s) => s.toggleLyrics);
  const seekTo = usePlayerStore((s) => s.seekTo);

  const activeLineRef = useRef<HTMLParagraphElement>(null);

  const lines = useMemo(
    () => (currentSong?.lyricsLrc ? parseLrc(currentSong.lyricsLrc) : []),
    [currentSong?.lyricsLrc],
  );

  const activeIndex = findActiveLyricIndex(lines, progressSeconds);

  useEffect(() => {
    activeLineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIndex]);

  if (!showLyrics || !currentSong || lines.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 flex h-96 w-80 flex-col rounded-xl border border-white/10 bg-ink-900/95 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <p className="truncate text-sm font-medium text-parchment-50">{currentSong.title}</p>
        <button onClick={toggleLyrics} aria-label="Fechar letras" className="text-parchment-500 hover:text-parchment-100">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {lines.map((line, index) => (
          <p
            key={`${line.timeSeconds}-${index}`}
            ref={index === activeIndex ? activeLineRef : undefined}
            onClick={() => seekTo(line.timeSeconds)}
            className={cn(
              'cursor-pointer py-1.5 text-sm leading-relaxed transition-colors',
              index === activeIndex
                ? 'font-medium text-paixao-500'
                : 'text-parchment-500 hover:text-parchment-300',
            )}
          >
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}

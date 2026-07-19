'use client';

import Image from 'next/image';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Film,
  Music2,
  Volume2,
  Mic,
} from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { formatDuration } from '@/utils/format';
import { cn } from '@/utils/cn';

export function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    playbackMode,
    isShuffled,
    repeatMode,
    progressSeconds,
    togglePlay,
    togglePlaybackMode,
    toggleShuffle,
    cycleRepeatMode,
    next,
    previous,
    seekTo,
    showLyrics,
    toggleLyrics,
  } = usePlayerStore();

  if (!currentSong) {
    return (
      <footer className="flex h-20 items-center justify-center border-t border-white/5 bg-ink-950/80 px-4 text-sm text-parchment-500">
        Escolha uma música ou vídeo para começar a ouvir.
      </footer>
    );
  }

  const duration = currentSong.video?.durationSeconds ?? 0;
  const progressPct = duration > 0 ? Math.min(100, (progressSeconds / duration) * 100) : 0;

  return (
    <footer className="flex h-20 items-center gap-4 border-t border-white/5 bg-ink-950/80 px-4 backdrop-blur">
      {/* Faixa atual */}
      <div className="flex w-64 min-w-0 items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-ink-700">
          {currentSong.coverUrl && (
            <Image src={currentSong.coverUrl} alt={currentSong.title} fill className="object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-parchment-50">{currentSong.title}</p>
          <p className="truncate text-xs text-parchment-500">{currentSong.artist?.name}</p>
        </div>
      </div>

      {/* Controles centrais */}
      <div className="flex flex-1 flex-col items-center gap-1.5">
        <div className="flex items-center gap-4">
          <button
            aria-label="Ativar shuffle inteligente"
            onClick={toggleShuffle}
            className={cn('text-parchment-500 hover:text-parchment-50', isShuffled && 'text-paixao-500')}
          >
            <Shuffle className="h-4 w-4" />
          </button>
          <button aria-label="Música anterior" onClick={previous} className="text-parchment-100 hover:text-parchment-50">
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
            onClick={togglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-parchment-50 text-ink-950 hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5 pl-0.5" />}
          </button>
          <button aria-label="Próxima música" onClick={next} className="text-parchment-100 hover:text-parchment-50">
            <SkipForward className="h-5 w-5" />
          </button>
          <button
            aria-label="Alternar modo de repetição"
            onClick={cycleRepeatMode}
            className={cn('text-parchment-500 hover:text-parchment-50', repeatMode !== 'off' && 'text-paixao-500')}
          >
            {repeatMode === 'one' ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex w-full max-w-xl items-center gap-2 text-[11px] font-mono text-parchment-500">
          <span>{formatDuration(progressSeconds)}</span>
          <div
            className="h-1 flex-1 cursor-pointer overflow-hidden rounded-full bg-ink-700"
            role="slider"
            aria-label="Progresso da reprodução"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={progressSeconds}
            tabIndex={0}
            onClick={(e) => {
              if (duration <= 0) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              seekTo(Math.max(0, Math.min(duration, ratio * duration)));
            }}
          >
            <div className="h-full bg-paixao-500" style={{ width: `${progressPct}%` }} />
          </div>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Modo de reprodução + volume */}
      <div className="flex w-64 items-center justify-end gap-3">
        <button
          onClick={toggleLyrics}
          disabled={!currentSong.lyricsLrc}
          aria-label="Mostrar letras"
          aria-pressed={showLyrics}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-30',
            showLyrics ? 'text-paixao-500' : 'text-parchment-500 hover:text-parchment-100',
          )}
        >
          <Mic className="h-4 w-4" />
        </button>
        <button
          onClick={togglePlaybackMode}
          className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-parchment-100 hover:bg-white/5"
          aria-label="Alternar entre modo vídeo e apenas áudio"
        >
          {playbackMode === 'video' ? <Film className="h-3.5 w-3.5" /> : <Music2 className="h-3.5 w-3.5" />}
          {playbackMode === 'video' ? 'Vídeo' : 'Apenas áudio'}
        </button>
        <Volume2 className="h-4 w-4 text-parchment-500" />
      </div>
    </footer>
  );
}

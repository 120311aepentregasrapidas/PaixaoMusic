import { create } from 'zustand';
import type { Song } from '@/types/database';
import { SmartShuffleService } from '@/services/smart-shuffle.service';

export type PlaybackMode = 'video' | 'audio';
export type RepeatMode = 'off' | 'one' | 'all';

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  playbackMode: PlaybackMode;
  isPlaying: boolean;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  volume: number; // 0..1
  progressSeconds: number;
  /** Referência ao <video> real, registrada pelo MediaEngine — permite seek a partir de qualquer componente */
  videoElement: HTMLVideoElement | null;

  // ações
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlaybackMode: () => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  setVolume: (v: number) => void;
  setProgress: (seconds: number) => void;
  seekTo: (seconds: number) => void;
  registerVideoElement: (el: HTMLVideoElement | null) => void;
  showLyrics: boolean;
  toggleLyrics: () => void;
}

const shuffleService = new SmartShuffleService();

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  queue: [],
  queueIndex: -1,
  playbackMode: 'video',
  isPlaying: false,
  isShuffled: false,
  repeatMode: 'off',
  volume: 1,
  progressSeconds: 0,
  videoElement: null,
  showLyrics: false,

  playSong: (song, queue) => {
    const nextQueue = queue ?? [song];
    const index = nextQueue.findIndex((s) => s.id === song.id);
    set({
      currentSong: song,
      queue: nextQueue,
      queueIndex: index === -1 ? 0 : index,
      isPlaying: true,
      progressSeconds: 0,
    });
  },

  togglePlaybackMode: () =>
    set((state) => ({ playbackMode: state.playbackMode === 'video' ? 'audio' : 'video' })),

  setPlaybackMode: (mode) => set({ playbackMode: mode }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  next: () => {
    const { queue, queueIndex, isShuffled, repeatMode } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      set({ progressSeconds: 0, isPlaying: true });
      return;
    }

    if (isShuffled) {
      const chosen = shuffleService.pickNext(queue);
      if (chosen) {
        set({
          currentSong: chosen,
          queueIndex: queue.findIndex((s) => s.id === chosen.id),
          progressSeconds: 0,
          isPlaying: true,
        });
      }
      return;
    }

    const isLast = queueIndex >= queue.length - 1;
    if (isLast && repeatMode !== 'all') {
      set({ isPlaying: false });
      return;
    }

    const nextIndex = isLast ? 0 : queueIndex + 1;
    const nextSong = queue[nextIndex];
    if (!nextSong) return;
    set({
      currentSong: nextSong,
      queueIndex: nextIndex,
      progressSeconds: 0,
      isPlaying: true,
    });
  },

  previous: () => {
    const { queue, queueIndex, progressSeconds } = get();
    if (queue.length === 0) return;

    // Se já tocou mais de 3s, "anterior" reinicia a música atual (comportamento padrão de players)
    if (progressSeconds > 3) {
      set({ progressSeconds: 0 });
      return;
    }

    const prevIndex = queueIndex <= 0 ? 0 : queueIndex - 1;
    const prevSong = queue[prevIndex];
    if (!prevSong) return;
    set({
      currentSong: prevSong,
      queueIndex: prevIndex,
      progressSeconds: 0,
      isPlaying: true,
    });
  },

  toggleShuffle: () => {
    shuffleService.reset();
    set((state) => ({ isShuffled: !state.isShuffled }));
  },

  cycleRepeatMode: () =>
    set((state) => {
      const order: RepeatMode[] = ['off', 'all', 'one'];
      const nextIndex = (order.indexOf(state.repeatMode) + 1) % order.length;
      return { repeatMode: order[nextIndex] ?? 'off' };
    }),

  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),

  setProgress: (seconds) => set({ progressSeconds: seconds }),

  seekTo: (seconds) => {
    const { videoElement } = get();
    if (videoElement) videoElement.currentTime = seconds;
    set({ progressSeconds: seconds });
  },

  registerVideoElement: (el) => set({ videoElement: el }),

  toggleLyrics: () => set((state) => ({ showLyrics: !state.showLyrics })),
}));

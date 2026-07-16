'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/player-store';

/**
 * MediaEngine — o único elemento <video> de todo o app.
 *
 * Por que só um <video> e nunca um <audio> separado? Porque o modo "apenas
 * áudio" do Readme não é outro arquivo — é o MESMO MP4, só que escondido
 * visualmente. Trocar de modo não recarrega nem reinicia a reprodução.
 *
 * Este componente é "burro" de propósito: ele só sincroniza o elemento HTML
 * com o que está no `usePlayerStore`. Toda a lógica de fila/shuffle/repeat
 * mora no store; aqui só imperativamente comandamos play/pause/seek/volume.
 *
 * Deve ser montado UMA vez, no layout raiz — nunca dentro de uma página,
 * ou a troca de rota destruiria a reprodução em andamento.
 */
export function MediaEngine() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playbackMode = usePlayerStore((s) => s.playbackMode);
  const volume = usePlayerStore((s) => s.volume);
  const setProgress = usePlayerStore((s) => s.setProgress);
  const registerVideoElement = usePlayerStore((s) => s.registerVideoElement);
  const next = usePlayerStore((s) => s.next);
  const previous = usePlayerStore((s) => s.previous);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  useEffect(() => {
    registerVideoElement(videoRef.current);
    return () => registerVideoElement(null);
  }, [registerVideoElement]);

  // Troca de música → troca a src e começa a tocar
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !currentSong?.video?.id) return;
    el.src = `/api/stream/${currentSong.video.id}`;
    el.load();
    if (isPlaying) {
      el.play().catch(() => {
        /* autoplay bloqueado pelo navegador — usuário precisa interagir primeiro */
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id]);

  // Play/pause vindos de fora (botões da PlayerBar, Media Session, teclado)
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isPlaying) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const el = videoRef.current;
    if (el) el.volume = volume;
  }, [volume]);

  // Media Session API — controles na tela bloqueada / Android Auto / fones
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentSong) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist?.name ?? '',
      album: currentSong.album?.title ?? '',
      artwork: currentSong.coverUrl
        ? [{ src: currentSong.coverUrl, sizes: '512x512', type: 'image/jpeg' }]
        : [],
    });

    navigator.mediaSession.setActionHandler('play', () => togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => togglePlay());
    navigator.mediaSession.setActionHandler('previoustrack', () => previous());
    navigator.mediaSession.setActionHandler('nexttrack', () => next());

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
    };
  }, [currentSong, togglePlay, previous, next]);

  return (
    <video
      ref={videoRef}
      onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
      onEnded={() => next()}
      // Modo "apenas áudio": o mesmo arquivo continua tocando, só escondemos
      // a faixa de vídeo visualmente. Nada é recarregado ou reiniciado.
      className={
        playbackMode === 'video'
          ? 'fixed bottom-24 right-4 z-40 w-72 rounded-xl border border-white/10 bg-black shadow-2xl'
          : 'sr-only'
      }
      playsInline
    />
  );
}

/** Permite que o player seja controlado por fora (ex.: clique na barra de progresso) */
export function seekTo(videoEl: HTMLVideoElement | null, seconds: number) {
  if (videoEl) videoEl.currentTime = seconds;
}

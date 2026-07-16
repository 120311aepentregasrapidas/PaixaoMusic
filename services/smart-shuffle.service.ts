import type { Song } from '@/types/database';

interface SmartShuffleOptions {
  /** Quantas músicas recentes não podem se repetir (padrão: 20) */
  recentHistorySize?: number;
}

/**
 * Shuffle Inteligente.
 *
 * Regras (do Readme):
 *   - nunca repetir o mesmo artista consecutivamente
 *   - nunca tocar a mesma música recentemente
 *   - nunca repetir o mesmo álbum consecutivamente
 *
 * Estratégia: a cada "próxima música", filtra candidatos que violam as
 * regras acima; se o filtro esvaziar o pool (biblioteca pequena/pouco
 * diversa), relaxa a regra do álbum primeiro, depois a do histórico recente,
 * mas NUNCA relaxa "mesmo artista consecutivo" — essa é a regra mais visível
 * ao ouvido e a que o usuário citou como exemplo explícito no briefing.
 */
export class SmartShuffleService {
  private recentlyPlayed: string[] = []; // ids de músicas, mais recente por último
  private lastArtistId: string | null = null;
  private lastAlbumId: string | null = null;
  private readonly recentHistorySize: number;

  constructor(options: SmartShuffleOptions = {}) {
    this.recentHistorySize = options.recentHistorySize ?? 20;
  }

  /** Escolhe a próxima música de um pool (ex.: uma playlist, o álbum, a biblioteca toda) */
  pickNext(pool: Song[]): Song | null {
    if (pool.length === 0) return null;
    if (pool.length === 1) return pool[0] ?? null;

    const recentSet = new Set(this.recentlyPlayed);

    let candidates = pool.filter(
      (song) =>
        song.artistId !== this.lastArtistId &&
        song.albumId !== this.lastAlbumId &&
        !recentSet.has(song.id),
    );

    // Relaxa a regra de álbum se necessário (bibliotecas pequenas por artista)
    if (candidates.length === 0) {
      candidates = pool.filter(
        (song) => song.artistId !== this.lastArtistId && !recentSet.has(song.id),
      );
    }

    // Relaxa o histórico recente, mas nunca a regra de artista consecutivo
    if (candidates.length === 0) {
      candidates = pool.filter((song) => song.artistId !== this.lastArtistId);
    }

    // Único artista na biblioteca inteira — não há como evitar repetição
    if (candidates.length === 0) {
      candidates = pool;
    }

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    if (!chosen) return null;
    this.registerPlayed(chosen);
    return chosen;
  }

  private registerPlayed(song: Song) {
    this.lastArtistId = song.artistId;
    this.lastAlbumId = song.albumId;
    this.recentlyPlayed.push(song.id);
    if (this.recentlyPlayed.length > this.recentHistorySize) {
      this.recentlyPlayed.shift();
    }
  }

  reset() {
    this.recentlyPlayed = [];
    this.lastArtistId = null;
    this.lastAlbumId = null;
  }
}

import type { SupabaseClient } from '@supabase/supabase-js';

export interface ArtistPlayStat {
  artistId: string;
  artistName: string;
  totalPlays: number;
}

export interface AlbumPlayStat {
  albumId: string;
  albumTitle: string;
  artistName: string;
  totalPlays: number;
}

/**
 * Todas as agregações aqui rodam DENTRO do Postgres (via funções SQL
 * definidas em supabase/migrations/0005_scalable_stats.sql), não em
 * memória no servidor Next.js. Isso é o que permite essas estatísticas
 * continuarem rápidas mesmo com uma biblioteca de centenas de milhares
 * de músicas — o banco já devolve só as linhas finais (ex.: top 10),
 * nunca a tabela inteira.
 */
export class StatsRepository {
  constructor(private readonly db: SupabaseClient) {}

  async getTopArtists(limit = 10): Promise<ArtistPlayStat[]> {
    const { data, error } = await this.db.rpc('get_top_artists', { result_limit: limit });
    if (error || !data) return [];
    return (data as Array<{ artist_id: string; artist_name: string; total_plays: number }>).map(
      (row) => ({ artistId: row.artist_id, artistName: row.artist_name, totalPlays: row.total_plays }),
    );
  }

  async getTopAlbums(limit = 10): Promise<AlbumPlayStat[]> {
    const { data, error } = await this.db.rpc('get_top_albums', { result_limit: limit });
    if (error || !data) return [];
    return (
      data as Array<{ album_id: string; album_title: string; artist_name: string; total_plays: number }>
    ).map((row) => ({
      albumId: row.album_id,
      albumTitle: row.album_title,
      artistName: row.artist_name,
      totalPlays: row.total_plays,
    }));
  }

  async getTotalWatchedSeconds(userId: string): Promise<number> {
    const { data, error } = await this.db.rpc('get_total_watched_seconds', { p_user_id: userId });
    if (error || data == null) return 0;
    return Number(data);
  }

  /**
   * Contagem "estimada" (via estatísticas internas do Postgres), não exata.
   * Para bibliotecas grandes, COUNT(*) exato varre a tabela inteira — a
   * versão estimada é instantânea (lê o planner do Postgres) e é precisa o
   * suficiente para um número exibido na tela de estatísticas.
   */
  async getTotalSongsCount(): Promise<number> {
    const { count } = await this.db
      .from('songs')
      .select('id', { count: 'estimated', head: true });
    return count ?? 0;
  }

  async getTotalArtistsCount(): Promise<number> {
    const { count } = await this.db
      .from('artists')
      .select('id', { count: 'estimated', head: true });
    return count ?? 0;
  }
}

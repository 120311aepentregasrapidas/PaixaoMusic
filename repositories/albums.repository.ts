import type { SupabaseClient } from '@supabase/supabase-js';
import type { Album } from '@/types/database';

export class AlbumsRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findAll(limit = 100): Promise<Album[]> {
    const { data, error } = await this.db
      .from('albums')
      .select('*, artist:artists(*)')
      .order('release_year', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map(mapAlbumRow);
  }

  async search(query: string, limit = 10): Promise<Album[]> {
    const { data, error } = await this.db
      .from('albums')
      .select('*, artist:artists(*)')
      .ilike('title', `%${query}%`)
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map(mapAlbumRow);
  }

  /**
   * Busca por slug. LIMITAÇÃO CONHECIDA: `albums.slug` é único apenas por
   * artista (dois artistas diferentes podem ter um álbum de mesmo slug,
   * ex.: "ao-vivo"). Para bibliotecas grandes/diversas, o ideal é rotear
   * por id (`/album/[id]`) em vez de slug — fica anotado aqui como próximo
   * ajuste caso ocorram colisões na prática.
   */
  async findBySlug(slug: string): Promise<Album | null> {
    const { data, error } = await this.db
      .from('albums')
      .select('*, artist:artists(*)')
      .eq('slug', slug)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ? mapAlbumRow(data) : null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAlbumRow(row: any): Album {
  return {
    id: row.id,
    artistId: row.artist_id,
    title: row.title,
    slug: row.slug,
    coverUrl: row.cover_url,
    releaseYear: row.release_year,
    country: row.country,
    language: row.language,
    recordLabel: row.record_label,
    artist: row.artist
      ? {
          id: row.artist.id,
          name: row.artist.name,
          slug: row.artist.slug,
          photoUrl: row.artist.photo_url,
          logoUrl: row.artist.logo_url,
          biography: row.artist.biography,
          country: row.artist.country,
          formedYear: row.artist.formed_year,
        }
      : undefined,
  };
}

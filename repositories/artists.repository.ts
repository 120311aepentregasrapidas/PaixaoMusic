import type { SupabaseClient } from '@supabase/supabase-js';
import type { Artist, Album } from '@/types/database';

export class ArtistsRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findBySlug(slug: string): Promise<Artist | null> {
    const { data, error } = await this.db
      .from('artists')
      .select('*, genres:artist_genres(genre:genres(*))')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data ? mapArtistRow(data) : null;
  }

  async findAll(limit = 100): Promise<Artist[]> {
    const { data, error } = await this.db
      .from('artists')
      .select('*')
      .order('name', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map(mapArtistRow);
  }

  async search(query: string, limit = 10): Promise<Artist[]> {
    const { data, error } = await this.db
      .from('artists')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map(mapArtistRow);
  }

  async findAlbumsByArtist(artistId: string): Promise<Album[]> {
    const { data, error } = await this.db
      .from('albums')
      .select('*')
      .eq('artist_id', artistId)
      .order('release_year', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapAlbumRow);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapArtistRow(row: any): Artist {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    photoUrl: row.photo_url,
    logoUrl: row.logo_url,
    biography: row.biography,
    country: row.country,
    formedYear: row.formed_year,
    genres: Array.isArray(row.genres)
      ? row.genres
          .map((g: { genre: { id: string; name: string; slug: string } | null }) => g.genre)
          .filter(Boolean)
      : undefined,
  };
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
  };
}

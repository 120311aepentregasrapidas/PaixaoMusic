import type { SupabaseClient } from '@supabase/supabase-js';
import type { Song } from '@/types/database';

/**
 * Repository Pattern: nenhum componente ou service monta queries Supabase
 * diretamente para a entidade Song. Tudo passa por aqui, o que torna trivial
 * trocar a fonte de dados no futuro (cache, outra tabela, outro banco).
 */
export class SongsRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findById(id: string): Promise<Song | null> {
    const { data, error } = await this.db
      .from('songs')
      .select(
        `*, artist:artists(*), album:albums(*), video:videos(*), genres:song_genres(genre:genres(*))`,
      )
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapSongRow(data) : null;
  }

  async findByArtist(artistId: string): Promise<Song[]> {
    const { data, error } = await this.db
      .from('songs')
      .select(`*, artist:artists(*), album:albums(*), video:videos(*)`)
      .eq('artist_id', artistId)
      .order('release_year', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapSongRow);
  }

  async findByAlbum(albumId: string): Promise<Song[]> {
    const { data, error } = await this.db
      .from('songs')
      .select(`*, artist:artists(*), album:albums(*), video:videos(*)`)
      .eq('album_id', albumId)
      .order('track_number', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapSongRow);
  }

  async search(query: string, limit = 20): Promise<Song[]> {
    const { data, error } = await this.db
      .from('songs')
      .select(`*, artist:artists(*), album:albums(*), video:videos(*)`)
      .ilike('title', `%${query}%`)
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map(mapSongRow);
  }

  async mostPlayed(limit = 50): Promise<Song[]> {
    const { data, error } = await this.db
      .from('songs')
      .select(`*, artist:artists(*), album:albums(*), video:videos(*)`)
      .order('play_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map(mapSongRow);
  }

  async incrementPlayCount(songId: string): Promise<void> {
    const { error } = await this.db.rpc('increment_song_play_count', { song_id: songId });
    if (error) throw error;
  }
}

// A "row" vinda do Supabase usa snake_case; convertendo para o domínio (camelCase).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSongRow(row: any): Song {
  return {
    id: row.id,
    videoId: row.video_id,
    artistId: row.artist_id,
    albumId: row.album_id,
    title: row.title,
    slug: row.slug,
    trackNumber: row.track_number,
    releaseYear: row.release_year,
    composer: row.composer,
    producer: row.producer,
    recordLabel: row.record_label,
    language: row.language,
    coverUrl: row.cover_url,
    lyricsLrc: row.lyrics_lrc,
    playCount: row.play_count,
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
    album: row.album
      ? {
          id: row.album.id,
          artistId: row.album.artist_id,
          title: row.album.title,
          slug: row.album.slug,
          coverUrl: row.album.cover_url,
          releaseYear: row.album.release_year,
          country: row.album.country,
          language: row.album.language,
          recordLabel: row.album.record_label,
        }
      : null,
    video: row.video
      ? {
          id: row.video.id,
          storageProviderId: row.video.storage_provider_id,
          storageKey: row.video.storage_key,
          originalFilename: row.video.original_filename,
          durationSeconds: row.video.duration_seconds,
          width: row.video.width,
          height: row.video.height,
          fps: row.video.fps,
          videoCodec: row.video.video_codec,
          audioCodec: row.video.audio_codec,
          bitrateKbps: row.video.bitrate_kbps,
          fileSizeBytes: row.video.file_size_bytes,
          importStatus: row.video.import_status,
        }
      : undefined,
  };
}

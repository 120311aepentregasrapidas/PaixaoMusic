import type { SupabaseClient } from '@supabase/supabase-js';
import type { Playlist, Song } from '@/types/database';

export class PlaylistsRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listByUser(userId: string): Promise<Playlist[]> {
    const { data, error } = await this.db
      .from('playlists')
      .select('*, playlist_items(count)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapPlaylistRow);
  }

  async create(userId: string, name: string): Promise<Playlist> {
    const { data, error } = await this.db
      .from('playlists')
      .insert({ user_id: userId, name })
      .select('*')
      .single();

    if (error) throw error;
    return mapPlaylistRow(data);
  }

  async delete(playlistId: string): Promise<void> {
    await this.db.from('playlists').delete().eq('id', playlistId);
  }

  async findById(playlistId: string): Promise<Playlist | null> {
    const { data, error } = await this.db
      .from('playlists')
      .select('*')
      .eq('id', playlistId)
      .maybeSingle();

    if (error) throw error;
    return data ? mapPlaylistRow(data) : null;
  }

  /**
   * Retorna as músicas da playlist. Se `is_automatic`, o conteúdo não vem de
   * `playlist_items` — é calculado na hora a partir da regra (`automatic_rule`).
   * Hoje só existe a regra "most_played" implementada; outras (ex.: gênero+década)
   * ficam documentadas como próximo passo em automatic_rule sem quebrar o schema.
   */
  async getSongs(playlist: Playlist): Promise<Song[]> {
    if (playlist.isAutomatic) {
      return this.getAutomaticSongs(playlist);
    }

    const { data, error } = await this.db
      .from('playlist_items')
      .select('song:songs(*, artist:artists(*), album:albums(*), video:videos(*))')
      .eq('playlist_id', playlist.id)
      .order('position', { ascending: true });

    if (error) throw error;
    return (data ?? [])
      .map((row: { song: unknown }) => row.song)
      .filter(Boolean)
      .map(mapSongRow);
  }

  private async getAutomaticSongs(playlist: Playlist): Promise<Song[]> {
    const rule = playlist.automaticRule as { type?: string } | null;

    if (rule?.type === 'most_played') {
      const { data, error } = await this.db
        .from('songs')
        .select('*, artist:artists(*), album:albums(*), video:videos(*)')
        .order('play_count', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []).map(mapSongRow);
    }

    return [];
  }

  async addSong(playlistId: string, songId: string): Promise<void> {
    const { count } = await this.db
      .from('playlist_items')
      .select('id', { count: 'exact', head: true })
      .eq('playlist_id', playlistId);

    await this.db
      .from('playlist_items')
      .insert({ playlist_id: playlistId, song_id: songId, position: (count ?? 0) + 1 })
      // já está na playlist — ignora silenciosamente (unique constraint)
      .select()
      .single()
      .then(
        () => {},
        () => {},
      );
  }

  async removeSong(playlistId: string, songId: string): Promise<void> {
    await this.db
      .from('playlist_items')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId);
  }

  /** Cria a playlist automática "Mais tocadas" para o usuário, se ainda não existir */
  async ensureMostPlayedPlaylist(userId: string): Promise<void> {
    const { data: existing } = await this.db
      .from('playlists')
      .select('id')
      .eq('user_id', userId)
      .eq('is_automatic', true)
      .contains('automatic_rule', { type: 'most_played' })
      .maybeSingle();

    if (existing) return;

    await this.db.from('playlists').insert({
      user_id: userId,
      name: 'Mais tocadas',
      is_automatic: true,
      automatic_rule: { type: 'most_played' },
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPlaylistRow(row: any): Playlist {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    coverUrl: row.cover_url,
    isAutomatic: row.is_automatic,
    automaticRule: row.automatic_rule,
    isPublic: row.is_public,
    itemCount: row.playlist_items?.[0]?.count ?? undefined,
  };
}

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

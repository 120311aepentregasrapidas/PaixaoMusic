/**
 * Tipos de domínio do Paixão Music.
 * Espelham as tabelas de supabase/migrations/0001_init.sql.
 *
 * `types/supabase.ts` (gerado via `npm run db:types` depois que o schema
 * estiver aplicado no projeto Supabase) fornece o tipo `Database` completo
 * usado pelo client tipado. Este arquivo contém os tipos "de leitura",
 * mais confortáveis de usar em componentes e services.
 */

export type PlaybackMode = 'video' | 'audio';

export type DeviceType =
  | 'web'
  | 'android'
  | 'ios'
  | 'android_auto'
  | 'android_tv'
  | 'smart_tv'
  | 'pwa'
  | 'unknown';

export type Theme = 'light' | 'dark' | 'oled' | 'blue' | 'custom';

export type EqualizerProfile = 'rock' | 'pop' | 'bass_boost' | 'flat' | 'custom';

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Artist {
  id: string;
  name: string;
  slug: string;
  photoUrl: string | null;
  logoUrl: string | null;
  biography: string | null;
  country: string | null;
  formedYear: number | null;
  genres?: Genre[];
}

export interface Album {
  id: string;
  artistId: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  releaseYear: number | null;
  country: string | null;
  language: string | null;
  recordLabel: string | null;
  artist?: Artist;
  songs?: Song[];
}

export interface VideoAsset {
  id: string;
  storageProviderId: string;
  storageKey: string;
  originalFilename: string;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  fps: number | null;
  videoCodec: string | null;
  audioCodec: string | null;
  bitrateKbps: number | null;
  fileSizeBytes: number | null;
  importStatus: 'pending' | 'uploading' | 'processing' | 'ready' | 'error';
}

export interface Song {
  id: string;
  videoId: string;
  artistId: string;
  albumId: string | null;
  title: string;
  slug: string;
  trackNumber: number | null;
  releaseYear: number | null;
  composer: string | null;
  producer: string | null;
  recordLabel: string | null;
  language: string | null;
  coverUrl: string | null;
  lyricsLrc: string | null;
  playCount: number;
  artist?: Artist;
  album?: Album | null;
  video?: VideoAsset;
  genres?: Genre[];
  averageRating?: number;
}

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  isAutomatic: boolean;
  automaticRule: Record<string, unknown> | null;
  isPublic: boolean;
  itemCount?: number;
}

export interface HistoryEntry {
  id: string;
  userId: string;
  songId: string;
  deviceId: string | null;
  playbackMode: PlaybackMode;
  progressSeconds: number;
  watchedSeconds: number;
  playedAt: string;
  song?: Song;
}

export interface FavoriteEntry {
  id: string;
  userId: string;
  entityType: 'song' | 'video' | 'artist' | 'album';
  entityId: string;
}

export interface Rating {
  id: string;
  userId: string;
  songId: string;
  stars: 1 | 2 | 3 | 4 | 5;
}

export interface UserSettings {
  userId: string;
  theme: Theme;
  equalizerProfile: EqualizerProfile;
  equalizerCustom: Record<string, number> | null;
  crossfadeSeconds: number;
  replaygainEnabled: boolean;
  gaplessEnabled: boolean;
  defaultPlaybackMode: PlaybackMode;
}

export interface LibraryStats {
  hoursPlayed: number;
  topArtists: Array<{ artist: Artist; playCount: number }>;
  topSongs: Array<{ song: Song; playCount: number }>;
  topAlbums: Array<{ album: Album; playCount: number }>;
  genreBreakdown: Array<{ genre: Genre; playCount: number }>;
  timeInVideoSeconds: number;
  timeInAudioSeconds: number;
}

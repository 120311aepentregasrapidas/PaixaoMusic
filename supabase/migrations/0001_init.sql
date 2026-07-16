-- =============================================================================
-- Paixão Music — Migration 0001: Schema Inicial
-- =============================================================================
-- Convenções:
--   * Toda tabela de domínio possui id uuid (default gen_random_uuid())
--   * created_at / updated_at em toda tabela relevante
--   * RLS habilitado em 100% das tabelas — sem exceção
--   * "profiles" estende auth.users (Supabase) — nunca duplicamos autenticação
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- -----------------------------------------------------------------------------
-- Trigger genérico para updated_at
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================================================
-- USERS (perfil estendido — auth.users é gerenciado pelo Supabase Auth)
-- =============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =============================================================================
-- STORAGE_PROVIDER — abstração de onde os arquivos físicos vivem
-- =============================================================================
create table public.storage_provider (
  id uuid primary key default gen_random_uuid(),
  name text not null unique, -- ex: 'archive_org', 'cloudflare_r2', 'backblaze_b2', 's3', 'self_hosted'
  display_name text not null,
  is_active boolean not null default false,
  config jsonb not null default '{}'::jsonb, -- config específica do provider (bucket, region, base_url etc.)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_storage_provider_updated_at
  before update on public.storage_provider
  for each row execute function public.set_updated_at();

-- Garante um único provider ativo por vez
create unique index uniq_storage_provider_active
  on public.storage_provider (is_active)
  where is_active = true;

-- =============================================================================
-- GENRES
-- =============================================================================
create table public.genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- ARTISTS
-- =============================================================================
create table public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  photo_url text,
  logo_url text,
  biography text,
  country text,
  formed_year integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_artists_updated_at
  before update on public.artists
  for each row execute function public.set_updated_at();

create index idx_artists_name on public.artists using gin (name gin_trgm_ops);

-- Relação N:N artista <-> gênero (um artista pode ter múltiplos gêneros)
create table public.artist_genres (
  artist_id uuid not null references public.artists(id) on delete cascade,
  genre_id uuid not null references public.genres(id) on delete cascade,
  primary key (artist_id, genre_id)
);

-- Artistas relacionados (para "Relacionados" na página do artista e Rádio Inteligente)
create table public.artist_related (
  artist_id uuid not null references public.artists(id) on delete cascade,
  related_artist_id uuid not null references public.artists(id) on delete cascade,
  similarity_score numeric(4,3) not null default 0.5,
  primary key (artist_id, related_artist_id),
  check (artist_id <> related_artist_id)
);

-- =============================================================================
-- ALBUMS
-- =============================================================================
create table public.albums (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  title text not null,
  slug text not null,
  cover_url text,
  release_year integer,
  country text,
  language text,
  record_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (artist_id, slug)
);

create trigger trg_albums_updated_at
  before update on public.albums
  for each row execute function public.set_updated_at();

create index idx_albums_artist on public.albums (artist_id);
create index idx_albums_release_year on public.albums (release_year);

-- =============================================================================
-- VIDEOS — o arquivo físico (1 MP4 = 1 registro). "songs" referencia este vídeo.
-- =============================================================================
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  storage_provider_id uuid not null references public.storage_provider(id),
  storage_key text not null, -- caminho/identificador no provider (ex: identifier do Archive.org)
  original_filename text not null,
  original_path text, -- caminho original na pasta local do usuário, para referência/reimportação
  duration_seconds numeric(10,3),
  width integer,
  height integer,
  fps numeric(6,3),
  video_codec text,
  audio_codec text,
  bitrate_kbps integer,
  file_size_bytes bigint,
  checksum_sha256 text,
  import_status text not null default 'pending'
    check (import_status in ('pending', 'uploading', 'processing', 'ready', 'error')),
  import_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_videos_updated_at
  before update on public.videos
  for each row execute function public.set_updated_at();

create unique index uniq_videos_checksum on public.videos (checksum_sha256) where checksum_sha256 is not null;
create index idx_videos_storage_provider on public.videos (storage_provider_id);
create index idx_videos_import_status on public.videos (import_status);

-- =============================================================================
-- SONGS — a entidade musical/metadados (título, artista, álbum...), 1:1 com videos
-- =============================================================================
create table public.songs (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null unique references public.videos(id) on delete cascade,
  artist_id uuid not null references public.artists(id),
  album_id uuid references public.albums(id),
  title text not null,
  slug text not null,
  track_number integer,
  release_year integer,
  composer text,
  producer text,
  record_label text,
  language text,
  cover_url text, -- fallback: cover.jpg/folder.jpg/poster.jpg encontrado na pasta
  lyrics_lrc text, -- letras sincronizadas (formato LRC) — preparado para uso futuro
  play_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_songs_updated_at
  before update on public.songs
  for each row execute function public.set_updated_at();

create index idx_songs_artist on public.songs (artist_id);
create index idx_songs_album on public.songs (album_id);
create index idx_songs_title on public.songs using gin (title gin_trgm_ops);
create index idx_songs_play_count on public.songs (play_count desc);

create table public.song_genres (
  song_id uuid not null references public.songs(id) on delete cascade,
  genre_id uuid not null references public.genres(id) on delete cascade,
  primary key (song_id, genre_id)
);

-- =============================================================================
-- DEVICES — dispositivos de cada usuário (para histórico e sessões de reprodução)
-- =============================================================================
create table public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_name text not null,
  device_type text not null default 'unknown'
    check (device_type in ('web', 'android', 'ios', 'android_auto', 'android_tv', 'smart_tv', 'pwa', 'unknown')),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_devices_user on public.devices (user_id);

-- =============================================================================
-- FAVORITES — segmentado por tipo de entidade
-- =============================================================================
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('song', 'video', 'artist', 'album')),
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, entity_type, entity_id)
);

create index idx_favorites_user on public.favorites (user_id, entity_type);

-- =============================================================================
-- HISTORY — histórico de reprodução (dispositivo, horário, progresso, duração assistida)
-- =============================================================================
create table public.history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  device_id uuid references public.devices(id) on delete set null,
  playback_mode text not null default 'video' check (playback_mode in ('video', 'audio')),
  progress_seconds numeric(10,3) not null default 0,
  watched_seconds numeric(10,3) not null default 0,
  played_at timestamptz not null default now()
);

create index idx_history_user_played_at on public.history (user_id, played_at desc);
create index idx_history_song on public.history (song_id);

-- "Continuar assistindo" é derivado de history: última entrada por (user_id, song_id)
-- onde progress_seconds < duration_seconds. Ver view abaixo.
create view public.continue_watching as
select distinct on (h.user_id, h.song_id)
  h.user_id,
  h.song_id,
  h.progress_seconds,
  h.playback_mode,
  h.played_at
from public.history h
join public.songs s on s.id = h.song_id
join public.videos v on v.id = s.video_id
where v.duration_seconds is not null
  and h.progress_seconds < (v.duration_seconds - 5) -- margem de 5s para considerar "concluído"
order by h.user_id, h.song_id, h.played_at desc;

-- =============================================================================
-- PLAYLISTS
-- =============================================================================
create table public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  cover_url text,
  is_automatic boolean not null default false,
  automatic_rule jsonb, -- ex: {"type": "most_played"} | {"type": "genre_decade", "genre": "rock", "decade": 1980}
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_playlists_updated_at
  before update on public.playlists
  for each row execute function public.set_updated_at();

create index idx_playlists_user on public.playlists (user_id);

create table public.playlist_items (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  position integer not null,
  added_at timestamptz not null default now(),
  unique (playlist_id, song_id)
);

create index idx_playlist_items_playlist on public.playlist_items (playlist_id, position);

-- =============================================================================
-- RATINGS — 1 a 5 estrelas
-- =============================================================================
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, song_id)
);

create trigger trg_ratings_updated_at
  before update on public.ratings
  for each row execute function public.set_updated_at();

-- =============================================================================
-- SETTINGS — preferências por usuário (tema, equalizador, crossfade, etc.)
-- =============================================================================
create table public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'dark' check (theme in ('light', 'dark', 'oled', 'blue', 'custom')),
  equalizer_profile text not null default 'flat' check (equalizer_profile in ('rock', 'pop', 'bass_boost', 'flat', 'custom')),
  equalizer_custom jsonb,
  crossfade_seconds numeric(4,1) not null default 0,
  replaygain_enabled boolean not null default true,
  gapless_enabled boolean not null default true,
  default_playback_mode text not null default 'video' check (default_playback_mode in ('video', 'audio')),
  updated_at timestamptz not null default now()
);

create trigger trg_settings_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.storage_provider enable row level security;
alter table public.genres enable row level security;
alter table public.artists enable row level security;
alter table public.artist_genres enable row level security;
alter table public.artist_related enable row level security;
alter table public.albums enable row level security;
alter table public.videos enable row level security;
alter table public.songs enable row level security;
alter table public.song_genres enable row level security;
alter table public.devices enable row level security;
alter table public.favorites enable row level security;
alter table public.history enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_items enable row level security;
alter table public.ratings enable row level security;
alter table public.settings enable row level security;

-- --- Conteúdo de biblioteca (genres, artists, albums, songs, videos) ---------
-- Todo usuário autenticado pode LER (é uma biblioteca pessoal/familiar compartilhada).
-- Apenas admin/owner pode escrever (a escrita real acontece via Service Role no
-- pipeline de importação, mas mantemos policies para admins usarem o painel).

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('owner', 'admin')
  );
$$ language sql stable security definer;

create policy "biblioteca: leitura para autenticados" on public.genres
  for select using (auth.role() = 'authenticated');
create policy "biblioteca: escrita para admin" on public.genres
  for all using (public.is_admin()) with check (public.is_admin());

create policy "biblioteca: leitura para autenticados" on public.artists
  for select using (auth.role() = 'authenticated');
create policy "biblioteca: escrita para admin" on public.artists
  for all using (public.is_admin()) with check (public.is_admin());

create policy "biblioteca: leitura para autenticados" on public.artist_genres
  for select using (auth.role() = 'authenticated');
create policy "biblioteca: escrita para admin" on public.artist_genres
  for all using (public.is_admin()) with check (public.is_admin());

create policy "biblioteca: leitura para autenticados" on public.artist_related
  for select using (auth.role() = 'authenticated');
create policy "biblioteca: escrita para admin" on public.artist_related
  for all using (public.is_admin()) with check (public.is_admin());

create policy "biblioteca: leitura para autenticados" on public.albums
  for select using (auth.role() = 'authenticated');
create policy "biblioteca: escrita para admin" on public.albums
  for all using (public.is_admin()) with check (public.is_admin());

create policy "biblioteca: leitura para autenticados" on public.videos
  for select using (auth.role() = 'authenticated');
create policy "biblioteca: escrita para admin" on public.videos
  for all using (public.is_admin()) with check (public.is_admin());

create policy "biblioteca: leitura para autenticados" on public.songs
  for select using (auth.role() = 'authenticated');
create policy "biblioteca: escrita para admin" on public.songs
  for all using (public.is_admin()) with check (public.is_admin());

create policy "biblioteca: leitura para autenticados" on public.song_genres
  for select using (auth.role() = 'authenticated');
create policy "biblioteca: escrita para admin" on public.song_genres
  for all using (public.is_admin()) with check (public.is_admin());

-- storage_provider: apenas admins podem ver/gerenciar (é configuração interna)
create policy "storage_provider: apenas admin" on public.storage_provider
  for all using (public.is_admin()) with check (public.is_admin());

-- --- profiles -----------------------------------------------------------------
create policy "profiles: usuário vê o próprio" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles: usuário edita o próprio" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles: insere o próprio" on public.profiles
  for insert with check (auth.uid() = id);

-- --- devices, favorites, history, playlists, playlist_items, ratings, settings
-- Regra padrão: cada usuário só acessa os próprios dados.

create policy "devices: dono" on public.devices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "favorites: dono" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "history: dono" on public.history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "playlists: dono ou pública para leitura" on public.playlists
  for select using (auth.uid() = user_id or is_public = true);
create policy "playlists: dono gerencia" on public.playlists
  for insert with check (auth.uid() = user_id);
create policy "playlists: dono atualiza" on public.playlists
  for update using (auth.uid() = user_id);
create policy "playlists: dono remove" on public.playlists
  for delete using (auth.uid() = user_id);

create policy "playlist_items: acompanha a playlist" on public.playlist_items
  for select using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and (p.user_id = auth.uid() or p.is_public = true)
    )
  );
create policy "playlist_items: dono gerencia" on public.playlist_items
  for insert with check (
    exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = auth.uid())
  );
create policy "playlist_items: dono atualiza" on public.playlist_items
  for update using (
    exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = auth.uid())
  );
create policy "playlist_items: dono remove" on public.playlist_items
  for delete using (
    exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = auth.uid())
  );

create policy "ratings: leitura pública (para média/estatísticas)" on public.ratings
  for select using (auth.role() = 'authenticated');
create policy "ratings: dono gerencia" on public.ratings
  for insert with check (auth.uid() = user_id);
create policy "ratings: dono atualiza" on public.ratings
  for update using (auth.uid() = user_id);
create policy "ratings: dono remove" on public.ratings
  for delete using (auth.uid() = user_id);

create policy "settings: dono" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =============================================================================
-- Seed mínimo: provider inicial (Archive.org) — desativado por padrão até
-- o painel admin configurar as credenciais.
-- =============================================================================
insert into public.storage_provider (name, display_name, is_active, config)
values ('archive_org', 'Archive.org', true, '{"base_url": "https://archive.org"}'::jsonb);

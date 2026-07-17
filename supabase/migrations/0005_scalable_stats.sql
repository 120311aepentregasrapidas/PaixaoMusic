-- =============================================================================
-- Paixão Music — Migration 0005: Estatísticas escaláveis
-- =============================================================================
-- A versão anterior calculava "artistas mais ouvidos" trazendo até 500 linhas
-- de `songs` para o servidor Next.js e somando em JavaScript. Isso não escala:
-- numa biblioteca com dezenas/centenas de milhares de músicas, isso vira
-- lento e caro rapidinho.
--
-- Esta migration move a agregação para dentro do Postgres (onde ela é
-- otimizada de verdade, com índices), então o servidor só recebe já as
-- 10 linhas finais — não milhares.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Índices que sustentam as agregações abaixo
-- -----------------------------------------------------------------------------

-- Acelera "ORDER BY play_count DESC LIMIT N" (músicas mais ouvidas)
create index if not exists idx_songs_play_count_desc on public.songs (play_count desc);

-- Acelera o GROUP BY artist_id usado em "artistas mais ouvidos"
create index if not exists idx_songs_artist_play_count on public.songs (artist_id, play_count desc);

-- Acelera a agregação de tempo assistido por usuário
create index if not exists idx_history_user_watched on public.history (user_id) include (watched_seconds);

-- Acelera o DISTINCT ON usado na view continue_watching (migration 0001)
create index if not exists idx_history_user_song_played_at
  on public.history (user_id, song_id, played_at desc);

-- -----------------------------------------------------------------------------
-- Função: artistas mais ouvidos
-- -----------------------------------------------------------------------------
-- Agrega SUM(play_count) por artista DENTRO do banco. `language sql` (não
-- plpgsql) permite ao planner do Postgres "inlinear" a função e otimizar
-- junto com os índices acima — é o equivalente a rodar a query diretamente.
create or replace function public.get_top_artists(result_limit int default 10)
returns table (artist_id uuid, artist_name text, total_plays bigint)
language sql
stable
as $$
  select
    s.artist_id,
    a.name as artist_name,
    sum(s.play_count)::bigint as total_plays
  from public.songs s
  join public.artists a on a.id = s.artist_id
  group by s.artist_id, a.name
  order by total_plays desc
  limit result_limit;
$$;

-- -----------------------------------------------------------------------------
-- Função: total de segundos assistidos por um usuário
-- -----------------------------------------------------------------------------
-- Soma no banco em vez de trazer cada linha de `history` para somar em JS.
-- Continua respeitando RLS: como não é SECURITY DEFINER, a query interna
-- roda com a mesma permissão de quem chamou (o usuário só enxerga as
-- próprias linhas de history de qualquer forma, pela policy já existente).
create or replace function public.get_total_watched_seconds(p_user_id uuid)
returns numeric
language sql
stable
as $$
  select coalesce(sum(watched_seconds), 0)
  from public.history
  where user_id = p_user_id;
$$;

-- -----------------------------------------------------------------------------
-- Função: álbuns mais ouvidos (soma de play_count das músicas do álbum)
-- -----------------------------------------------------------------------------
create or replace function public.get_top_albums(result_limit int default 10)
returns table (album_id uuid, album_title text, artist_name text, total_plays bigint)
language sql
stable
as $$
  select
    al.id as album_id,
    al.title as album_title,
    a.name as artist_name,
    sum(s.play_count)::bigint as total_plays
  from public.songs s
  join public.albums al on al.id = s.album_id
  join public.artists a on a.id = al.artist_id
  where s.album_id is not null
  group by al.id, al.title, a.name
  order by total_plays desc
  limit result_limit;
$$;

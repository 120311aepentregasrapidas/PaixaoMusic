-- =============================================================================
-- Paixão Music — Migration 0007: Rádio Inteligente
-- =============================================================================
-- Monta uma fila de reprodução a partir de um artista "semente", em camadas
-- de relevância (tier), toda calculada dentro do Postgres — evita múltiplas
-- idas e vindas do servidor Next.js e escala bem mesmo com biblioteca grande:
--   tier 1: músicas do próprio artista
--   tier 2: músicas de artistas relacionados (artist_related, se populado)
--   tier 3: músicas de artistas que compartilham gênero
--   tier 4: preenchimento aleatório com o resto da biblioteca (garante que a
--           rádio nunca fique curta, mesmo sem artist_related/gêneros
--           cadastrados ainda — o que é o caso comum logo após a importação)
-- Dentro de cada camada, a ordem é aleatória (`random()`), para a rádio não
-- tocar sempre na mesma sequência.
-- =============================================================================

create or replace function public.get_radio_queue(p_artist_id uuid, result_limit int default 50)
returns setof uuid
language sql
stable
as $$
  with base as (
    select id, 1 as tier from public.songs where artist_id = p_artist_id

    union all

    select s.id, 2 as tier
    from public.songs s
    join public.artist_related ar on ar.related_artist_id = s.artist_id
    where ar.artist_id = p_artist_id

    union all

    select s.id, 3 as tier
    from public.songs s
    join public.artist_genres ag on ag.artist_id = s.artist_id
    where ag.genre_id in (
      select genre_id from public.artist_genres where artist_id = p_artist_id
    )
    and s.artist_id <> p_artist_id

    union all

    select id, 4 as tier from public.songs where artist_id <> p_artist_id
  ),
  deduped as (
    select id, min(tier) as tier from base group by id
  )
  select id from deduped order by tier, random() limit result_limit;
$$;

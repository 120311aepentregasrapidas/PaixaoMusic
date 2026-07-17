-- =============================================================================
-- Paixão Music — Migration 0002: Leitura pública da biblioteca
-- =============================================================================
-- Contexto: o login (autenticação de usuário) foi deixado propositalmente
-- para o final do projeto. Até lá, as políticas de RLS que exigiam
-- `auth.role() = 'authenticated'` bloqueavam qualquer leitura — ninguém
-- veria nada no site, mesmo com a biblioteca cheia.
--
-- Esta migration troca a condição de LEITURA das tabelas de conteúdo
-- (gêneros, artistas, álbuns, vídeos, músicas) para `true` — ou seja,
-- qualquer visitante do site consegue VER a biblioteca. A ESCRITA continua
-- restrita a admin (via public.is_admin(), inalterado).
--
-- Quando o login for implementado, isso pode ser revisado (ex.: exigir
-- autenticação de novo, já que a essa altura o login vai existir de fato).
-- =============================================================================

drop policy if exists "biblioteca: leitura para autenticados" on public.genres;
create policy "biblioteca: leitura pública" on public.genres for select using (true);

drop policy if exists "biblioteca: leitura para autenticados" on public.artists;
create policy "biblioteca: leitura pública" on public.artists for select using (true);

drop policy if exists "biblioteca: leitura para autenticados" on public.artist_genres;
create policy "biblioteca: leitura pública" on public.artist_genres for select using (true);

drop policy if exists "biblioteca: leitura para autenticados" on public.artist_related;
create policy "biblioteca: leitura pública" on public.artist_related for select using (true);

drop policy if exists "biblioteca: leitura para autenticados" on public.albums;
create policy "biblioteca: leitura pública" on public.albums for select using (true);

drop policy if exists "biblioteca: leitura para autenticados" on public.videos;
create policy "biblioteca: leitura pública" on public.videos for select using (true);

drop policy if exists "biblioteca: leitura para autenticados" on public.songs;
create policy "biblioteca: leitura pública" on public.songs for select using (true);

drop policy if exists "biblioteca: leitura para autenticados" on public.song_genres;
create policy "biblioteca: leitura pública" on public.song_genres for select using (true);

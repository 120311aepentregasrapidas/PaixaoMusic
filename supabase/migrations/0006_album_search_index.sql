-- =============================================================================
-- Paixão Music — Migration 0006: Índice de busca em álbuns
-- =============================================================================
-- A busca por álbum (`AlbumsRepository.search`, usada em /pesquisa) faz
-- `ilike` em `albums.title`. Sem um índice trigram (igual já existe para
-- artists.name e songs.title desde a migration 0001), essa busca faz uma
-- varredura completa da tabela — ótimo com 50 álbuns, péssimo com 50 mil.
-- =============================================================================

create index if not exists idx_albums_title on public.albums using gin (title gin_trgm_ops);

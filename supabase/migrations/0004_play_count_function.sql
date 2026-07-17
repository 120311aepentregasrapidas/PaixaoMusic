-- =============================================================================
-- Paixão Music — Migration 0004: Função de incremento de play_count
-- =============================================================================
-- Incrementa songs.play_count de forma atômica sempre que uma música é
-- reproduzida (chamado pelo MediaEngine no primeiro play de cada faixa).
-- Roda com as permissões de quem chama (não é SECURITY DEFINER): como o
-- usuário do dispositivo já nasce com role='owner' (ver migration 0003),
-- a policy de escrita em `songs` (restrita a admin/owner) já permite isso.
-- =============================================================================

create or replace function public.increment_song_play_count(song_id uuid)
returns void as $$
  update public.songs set play_count = play_count + 1 where id = song_id;
$$ language sql;

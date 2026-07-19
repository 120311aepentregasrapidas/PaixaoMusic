-- =============================================================================
-- Paixão Music — Migration 0008: Restringir papel padrão de novas contas
-- =============================================================================
-- Até aqui, TODA sessão (mesmo anônima, criada automaticamente para
-- qualquer visitante) nascia com role='owner' — ou seja, qualquer pessoa
-- que abrisse o site ganhava acesso de administrador (podia importar,
-- editar e apagar a biblioteca). Isso foi intencional enquanto não havia
-- login: era o único jeito de o dono testar o sistema.
--
-- Agora que o login real existe (conversão de conta anônima para
-- e-mail+senha via supabase.auth.updateUser), o fluxo correto é:
--   1. Novas sessões anônimas nascem como 'member' (só leitura).
--   2. Quando você faz login "de verdade" pela primeira vez (criando seu
--      e-mail/senha na tela /login), sua conta é promovida a 'owner'
--      automaticamente — a promoção fica registrada por e-mail, então só
--      quem sabe o(s) e-mail(is) definidos abaixo vira admin.
--
-- IMPORTANTE: troque 'SEU_EMAIL_AQUI@exemplo.com' pelo e-mail que você vai
-- usar para criar sua conta em /login antes de rodar esta migration (ou
-- rode o UPDATE manualmente depois, pelo Table Editor do Supabase).
-- =============================================================================

create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (
    new.id,
    case
      when new.email in ('SEU_EMAIL_AQUI@exemplo.com') then 'owner'
      else 'member'
    end
  )
  on conflict (id) do nothing;

  insert into public.settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Promove uma conta já existente para owner (útil se você converteu sua
-- conta ANTES de rodar esta migration, ou se o e-mail acima não bateu).
-- Ajuste o e-mail e rode manualmente sempre que precisar promover alguém:
--
--   update public.profiles set role = 'owner'
--   where id = (select id from auth.users where email = 'seu@email.com');

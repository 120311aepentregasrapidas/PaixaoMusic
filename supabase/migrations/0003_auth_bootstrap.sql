-- =============================================================================
-- Paixão Music — Migration 0003: Bootstrap de autenticação
-- =============================================================================
-- Como o login "de verdade" (com e-mail/senha) fica para o final do projeto,
-- usamos o login ANÔNIMO do Supabase Auth como um "usuário do dispositivo":
-- ele cria uma sessão real (com um auth.uid() de verdade), sem exigir tela
-- de cadastro. Isso é o que permite favoritos, histórico, avaliações e
-- configurações funcionarem antes do login "de verdade" existir.
--
-- Como este é um app pessoal (uma família/usuário só), a conta criada
-- automaticamente já nasce com role = 'owner' (acesso de administrador).
-- Quando o login de verdade for implementado, essa mesma conta anônima pode
-- ser "promovida" (supabase.auth.linkIdentity) para um login de verdade,
-- sem perder favoritos/histórico já registrados.
-- =============================================================================

create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'owner')
  on conflict (id) do nothing;

  insert into public.settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

/**
 * Cliente Supabase para Server Components, Server Actions e Route Handlers.
 * Lê/escreve cookies de sessão via `next/headers`.
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // chamado de um Server Component sem permissão de escrita — ignorado,
            // o middleware é responsável por refresh de sessão nesse caso.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // idem acima
          }
        },
      },
    },
  );
}

/**
 * Cliente Supabase com privilégios de Service Role.
 * USO RESTRITO: apenas em código que roda no servidor (Route Handlers/Edge
 * Functions) para o pipeline de importação em massa, nunca em código exposto
 * ao cliente. Ignora RLS — use com cautela e sempre validando entrada.
 */
export function createServiceRoleClient() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

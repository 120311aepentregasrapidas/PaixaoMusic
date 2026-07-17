'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Garante que sempre existe uma sessão ativa no navegador.
 *
 * Não é uma tela de login — é um "carimbo de dispositivo" automático via
 * login anônimo do Supabase. Isso dá um `auth.uid()` real, necessário para
 * favoritos/histórico/avaliações/configurações funcionarem, sem exigir
 * nenhuma ação do usuário. Roda uma vez, ao carregar qualquer página.
 */
export function AuthBootstrap() {
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        supabase.auth.signInAnonymously();
      }
    });
  }, []);

  return null;
}

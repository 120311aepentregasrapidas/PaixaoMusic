import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import type { Theme } from '@/types/database';

interface SettingsState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        applyThemeToDocument(theme);
        // Sincroniza com o Supabase em segundo plano — se falhar (ex.: sessão
        // ainda não pronta), o tema já está aplicado localmente de qualquer forma.
        void syncThemeToSupabase(theme);
      },
    }),
    { name: 'paixao-music-settings' },
  ),
);

export function applyThemeToDocument(theme: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
  }
}

async function syncThemeToSupabase(theme: Theme) {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    await supabase
      .from('settings')
      .upsert({ user_id: session.user.id, theme }, { onConflict: 'user_id' });
  } catch {
    // Sincronização é "best effort" — o tema local já foi aplicado
  }
}

'use client';

import { useEffect } from 'react';
import { useSettingsStore, applyThemeToDocument } from '@/store/settings-store';

export function ThemeBootstrap() {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  return null;
}

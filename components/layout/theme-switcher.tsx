'use client';

import { Sun, Moon, CircleDot, Waves } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { cn } from '@/utils/cn';
import type { Theme } from '@/types/database';

const THEMES: Array<{ value: Theme; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'oled', label: 'OLED', icon: CircleDot },
  { value: 'blue', label: 'Azul', icon: Waves },
];

export function ThemeSwitcher() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 p-1">
      {THEMES.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={`Tema ${label}`}
          title={label}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full text-parchment-500 transition-colors',
            theme === value ? 'bg-paixao-500 text-white' : 'hover:bg-white/5 hover:text-parchment-100',
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

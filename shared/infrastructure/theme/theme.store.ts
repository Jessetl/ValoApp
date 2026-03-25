import { mmkvZustandStorage } from '@/shared/infrastructure/storage/app-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ColorScheme } from './theme.constants';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  /** Preferencia guardada: 'light' | 'dark' | 'system' */
  mode: ThemeMode;

  /** Cambia el modo del tema */
  setMode: (mode: ThemeMode) => void;

  /** Alterna entre light y dark (ignora system) */
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',

      setMode: (mode: ThemeMode) => set({ mode }),

      toggleTheme: () => {
        const current = get().mode;
        set({ mode: current === 'dark' ? 'light' : 'dark' });
      },
    }),
    {
      name: 'theme-preference',
      storage: createJSONStorage(() => mmkvZustandStorage),
    },
  ),
);

/**
 * Resuelve el ColorScheme efectivo combinando la preferencia del store
 * con el esquema del sistema operativo.
 *
 * Se usa como función pura (no hook) para que pueda llamarse
 * tanto dentro como fuera de componentes React.
 */
export function resolveColorScheme(
  mode: ThemeMode,
  systemScheme: ColorScheme | null | undefined,
): ColorScheme {
  if (mode === 'system') {
    return systemScheme ?? 'light';
  }
  return mode;
}

import { create } from 'zustand';
import { secureStorage } from '../storage/app-storage';
import type { ColorScheme } from './theme.constants';

const THEME_PREFERENCE_KEY = 'theme-preference';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  /** Preferencia guardada: 'light' | 'dark' | 'system' */
  mode: ThemeMode;
  /** Si la preferencia ya se leyó de SecureStore */
  hasHydrated: boolean;

  /** Cambia el modo del tema */
  setMode: (mode: ThemeMode) => void;

  /** Alterna entre light y dark (ignora system) */
  toggleTheme: () => void;

  /** Hidrata preferencia desde SecureStore */
  hydrateTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>()((set, get) => ({
  mode: 'system',
  hasHydrated: false,

  setMode: (mode: ThemeMode) => {
    set({ mode });
    void secureStorage.setItem(THEME_PREFERENCE_KEY, mode);
  },

  toggleTheme: () => {
    const current = get().mode;
    const nextMode: ThemeMode = current === 'dark' ? 'light' : 'dark';
    set({ mode: nextMode });
    void secureStorage.setItem(THEME_PREFERENCE_KEY, nextMode);
  },

  hydrateTheme: async () => {
    if (get().hasHydrated) {
      return;
    }

    const value = await secureStorage.getItem(THEME_PREFERENCE_KEY);

    if (value === 'light' || value === 'dark' || value === 'system') {
      set({ mode: value, hasHydrated: true });
      return;
    }

    set({ hasHydrated: true });
  },
}));

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

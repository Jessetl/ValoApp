import {
  type ColorScheme,
  type ThemeColorKey,
  type ThemeMode,
  resolveColorScheme,
  ThemeColors,
  useThemeStore,
} from '@/shared/presentation/adapters/theme.adapter';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

type ThemePalette = (typeof ThemeColors)[ColorScheme];

interface AppTheme {
  /** Esquema de color resuelto: 'light' | 'dark' */
  colorScheme: ColorScheme;
  /** Todos los tokens de color del tema actual */
  colors: ThemePalette;
  /** Modo guardado por el usuario: 'light' | 'dark' | 'system' */
  mode: ThemeMode;
  /** Indica si el tema actual es dark */
  isDark: boolean;
  /** Alterna entre light y dark */
  toggleTheme: () => void;
  /** Establece un modo específico */
  setMode: (mode: ThemeMode) => void;
}

export function useAppTheme(): AppTheme {
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const setMode = useThemeStore((s) => s.setMode);
  const systemScheme = useColorScheme();

  const colorScheme = resolveColorScheme(mode, systemScheme);
  const colors = ThemeColors[colorScheme];

  return useMemo(
    () => ({
      colorScheme,
      colors,
      mode,
      isDark: colorScheme === 'dark',
      toggleTheme,
      setMode,
    }),
    [colorScheme, colors, mode, toggleTheme, setMode],
  );
}

export function useThemeMode(): ThemeMode {
  return useThemeStore((s) => s.mode);
}

export function useThemeActions(): Pick<AppTheme, 'toggleTheme' | 'setMode'> {
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const setMode = useThemeStore((s) => s.setMode);

  return useMemo(() => ({ toggleTheme, setMode }), [toggleTheme, setMode]);
}

export function useIsDarkMode(): boolean {
  const mode = useThemeMode();
  const systemScheme = useColorScheme();
  const colorScheme = resolveColorScheme(mode, systemScheme);

  return colorScheme === 'dark';
}

export function useThemeColors(): ThemePalette {
  const mode = useThemeMode();
  const systemScheme = useColorScheme();
  const colorScheme = resolveColorScheme(mode, systemScheme);

  return ThemeColors[colorScheme];
}

/**
 * Hook ligero: obtiene un solo color por nombre semántico.
 * Ideal para componentes que solo necesitan 1-2 colores.
 * Evita que el componente se suscriba a todo el objeto `colors`.
 */
export function useThemeColor(colorKey: ThemeColorKey): string {
  const mode = useThemeStore((s) => s.mode);
  const systemScheme = useColorScheme();
  const colorScheme = resolveColorScheme(mode, systemScheme);

  return ThemeColors[colorScheme][colorKey] as string;
}

import type {
  ColorScheme,
  ThemeColorKey,
} from '@/shared/infrastructure/theme/theme.constants';
import { ThemeColors } from '@/shared/infrastructure/theme/theme.constants';
import type { ThemeMode } from '@/shared/infrastructure/theme/theme.store';
import {
  resolveColorScheme,
  useThemeStore,
} from '@/shared/infrastructure/theme/theme.store';

export { resolveColorScheme, ThemeColors, useThemeStore };
export type { ColorScheme, ThemeColorKey, ThemeMode };

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { ThemeColors } from './theme.constants';
import { resolveColorScheme, useThemeStore } from './theme.store';

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const mode = useThemeStore((s) => s.mode);
  const systemScheme = useColorScheme();
  const colorScheme = resolveColorScheme(mode, systemScheme);
  const colors = ThemeColors[colorScheme];

  // Extender los temas de React Navigation con nuestros colores financieros.
  // useMemo evita recrear el objeto en cada render — solo se recalcula si cambia el scheme.
  const navigationTheme = useMemo(
    () => ({
      ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
      colors: {
        ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
        primary: colors.primary,
        background: colors.background,
        card: colors.backgroundSecondary,
        text: colors.text,
        border: colors.border,
        notification: colors.danger,
      },
    }),
    [colorScheme, colors],
  );

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={colors.statusBar} />
      {children}
    </NavigationThemeProvider>
  );
}

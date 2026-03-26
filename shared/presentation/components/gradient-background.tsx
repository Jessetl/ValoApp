import { useThemeColors } from '@/shared/presentation/hooks/use-app-theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';

interface GradientBackgroundProps {
  children: React.ReactNode;
}

/**
 * Fondo degradado que envuelve el contenido de cada pantalla.
 * Usa los tokens gradientStart/gradientEnd del tema actual,
 * por lo que se adapta automáticamente a light/dark mode.
 */
export const GradientBackground = React.memo(function GradientBackground({
  children,
}: GradientBackgroundProps) {
  const colors = useThemeColors();

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.gradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

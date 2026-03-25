import { markThemeToggleStart } from '@/shared/presentation/devtools/theme-profiler';
import {
  useIsDarkMode,
  useThemeActions,
  useThemeColor,
} from '@/shared/presentation/hooks/use-app-theme';
import * as Haptics from 'expo-haptics';
import { Moon, Sun } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const ICON_SIZE = 22;
const BUTTON_SIZE = 40;
const MIN_TOGGLE_INTERVAL_MS = 100;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ThemeToggle = React.memo(function ThemeToggle() {
  const lastToggleAtRef = useRef(0);
  const isDark = useIsDarkMode();
  const { toggleTheme } = useThemeActions();
  const primary = useThemeColor('primary');
  const warning = useThemeColor('warning');
  const backgroundSecondary = useThemeColor('backgroundSecondary');
  const backgroundTertiary = useThemeColor('backgroundTertiary');
  const rotation = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    rotation.value = withSpring(isDark ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isDark, rotation]);

  const handleToggle = useCallback(() => {
    const now = Date.now();

    if (now - lastToggleAtRef.current < MIN_TOGGLE_INTERVAL_MS) {
      return;
    }

    lastToggleAtRef.current = now;

    markThemeToggleStart();

    rotation.value = withSpring(isDark ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });

    toggleTheme();

    // Haptic feedback sutil al cambiar tema
    if (process.env.EXPO_OS === 'ios') {
      requestAnimationFrame(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      });
    }
  }, [isDark, toggleTheme, rotation]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(
          rotation.value,
          [0, 1],
          [0, 180],
          Extrapolation.CLAMP,
        )}deg`,
      },
    ],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    backgroundColor: isDark ? backgroundTertiary : backgroundSecondary,
  }));

  return (
    <AnimatedPressable
      onPress={handleToggle}
      style={[styles.button, animatedButtonStyle]}
      accessibilityRole='switch'
      accessibilityState={{ checked: isDark }}
      accessibilityLabel={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View pointerEvents='none' style={animatedIconStyle}>
        {isDark ? (
          <Moon size={ICON_SIZE} color={primary} strokeWidth={2} />
        ) : (
          <Sun size={ICON_SIZE} color={warning} strokeWidth={2} />
        )}
      </Animated.View>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

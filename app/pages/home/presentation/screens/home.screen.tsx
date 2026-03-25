import React, { Profiler } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeToggle } from '@/shared/presentation/components/theme-toggle';
import { onThemeProfilerRender } from '@/shared/presentation/devtools/theme-profiler';
import { useAppTheme } from '@/shared/presentation/hooks/use-app-theme';

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.borderLight,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Bienvenido
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Mi Finanzas
            </Text>
          </View>
          <ThemeToggle />
        </View>
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.placeholder,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[styles.placeholderText, { color: colors.textTertiary }]}
          >
            Aquí irán tus widgets financieros
          </Text>
        </View>
      </View>
    </View>
  );

  if (__DEV__) {
    return (
      <Profiler id='HomeScreen' onRender={onThemeProfilerRender}>
        {content}
      </Profiler>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  placeholder: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

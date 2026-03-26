import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/presentation/hooks/use-app-theme';

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + 16, paddingBottom: 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>Perfil</Text>
      <Text style={[styles.subtitle, { color: colors.gradientEnd }]}>
        Configura tu cuenta
      </Text>

      {/* Avatar placeholder */}
      <View style={styles.avatarSection}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <Text style={[styles.avatarText, { color: colors.textOnSurface }]}>
            ?
          </Text>
        </View>
        <Text style={[styles.guestLabel, { color: colors.text }]}>
          Modo Invitado
        </Text>
      </View>

      {/* Settings options */}
      {['Cuenta', 'Notificaciones', 'Apariencia', 'Acerca de'].map(
        (option) => (
          <View
            key={option}
            style={[
              styles.option,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Text style={[styles.optionText, { color: colors.textOnSurface }]}>
              {option}
            </Text>
          </View>
        ),
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    marginTop: -4,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
  },
  guestLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  option: {
    borderRadius: 12,
    padding: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

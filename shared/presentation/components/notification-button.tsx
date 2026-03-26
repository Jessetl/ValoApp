import { useThemeColor } from '@/shared/presentation/hooks/use-app-theme';
import * as Haptics from 'expo-haptics';
import { Bell } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const ICON_SIZE = 22;
const BUTTON_SIZE = 40;

interface NotificationButtonProps {
  /** Número de notificaciones sin leer */
  badgeCount?: number;
  onPress?: () => void;
}

export const NotificationButton = React.memo(function NotificationButton({
  badgeCount = 0,
  onPress,
}: NotificationButtonProps) {
  const text = useThemeColor('text');
  const danger = useThemeColor('danger');

  const handlePress = useCallback(() => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.button, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
      accessibilityRole='button'
      accessibilityLabel={
        badgeCount > 0
          ? `Notificaciones, ${badgeCount} sin leer`
          : 'Notificaciones'
      }
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Bell size={ICON_SIZE} color={text} strokeWidth={2} />
      {badgeCount > 0 && (
        <View style={[styles.badge, { backgroundColor: danger }]} />
      )}
    </Pressable>
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
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

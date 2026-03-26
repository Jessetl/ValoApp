import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { AppThemeProvider } from '@/shared/infrastructure/theme';

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='(tabs)' />
      </Stack>
    </AppThemeProvider>
  );
}

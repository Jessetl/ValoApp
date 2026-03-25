import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { AppThemeProvider } from '@/shared/infrastructure/theme';

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <Stack>
        <Stack.Screen name='index' options={{ headerShown: false }} />
      </Stack>
    </AppThemeProvider>
  );
}

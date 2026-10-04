import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { DeviceProvider } from '@/lib/DeviceContext';
import { getSavedRole, type AppRole } from '@/lib/role';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { I18nManager, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Vazirmatn_400Regular,
  Vazirmatn_500Medium,
  Vazirmatn_700Bold,
} from '@expo-google-fonts/vazirmatn';

// This app is for Persian (Farsi) users — its UI is always RTL regardless of
// the phone's system language. This also makes the bottom tab bar layout correct.
I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    Vazirmatn: Vazirmatn_400Regular,
    'Vazirmatn-Medium': Vazirmatn_500Medium,
    'Vazirmatn-Bold': Vazirmatn_700Bold,
  });

  // Which role was picked for THIS phone on the welcome screen?
  // undefined = still loading, null = not chosen yet.
  const [role, setRole] = useState<AppRole | null | undefined>(undefined);

  useEffect(() => {
    getSavedRole()
      .then((saved) => setRole(saved))
      .catch(() => setRole(null));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && role !== undefined) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, role]);

  if ((!fontsLoaded && !fontError) || role === undefined) {
    return null;
  }

  const initialRoute = role === 'agent' ? 'agent' : role === 'dashboard' ? '(tabs)' : 'welcome';

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <DeviceProvider>
          {/* `direction: 'rtl'` on this top-level wrapper makes the whole subtree
              layout right-to-left immediately — even before the native
              I18nManager flag takes effect (which may need one app restart). */}
          <View style={{ flex: 1, direction: 'rtl' }}>
            {/* The same APK boots into this phone's saved role:
                'welcome' (first run) → '(tabs)' (phone 1) or 'agent' (phone 2). */}
            <Stack screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="dark" />
          </View>
        </DeviceProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

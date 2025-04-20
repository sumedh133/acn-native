import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../../../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Offline from '../Offline';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const isConnectedToInternet = useSelector((state: RootState) => state.app.isConnectedToInternet);

  // const [loaded] = useFonts({
  //   SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  // });

  // useEffect(() => {
  //   if (loaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [loaded]);

  // if (!loaded) {
  //   return null;
  // }

  if (!isConnectedToInternet)
    return (<Offline />)

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" />
        <Stack.Screen name="LandingPage" />
        <Stack.Screen name="Signin" />
        <Stack.Screen name="OTPage" />
        <Stack.Screen name="VerificationPage" />
        <Stack.Screen name="BlacklistedPage" />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="@app/(tabs)/properties" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../../../global.css";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Offline from "../Offline";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

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

  // Track theme changes
  useEffect(() => {
    try {
      logEvent(analytics, 'theme_change', {
        event_category: 'app_settings',
        event_label: 'theme',
        theme: colorScheme,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging theme change:', error);
    }
  }, [colorScheme, userType]);

  // Track offline state
  useEffect(() => {
    try {
      logEvent(analytics, 'connectivity_change', {
        event_category: 'app_status',
        event_label: 'connectivity',
        is_online: isConnectedToInternet,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging connectivity change:', error);
    }
  }, [isConnectedToInternet, userType]);

  

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
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

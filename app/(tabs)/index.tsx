import { View } from "react-native";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";
import LandingPage from "../components/Auth/LandingPage";
import * as Notifications from "expo-notifications";
// import * as Permissions from 'expo-permissions';
import { RootState } from "@/store/store";
import Offline from "../components/Offline";
import messaging from '@react-native-firebase/messaging'
import { analytics } from "../config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

// Keep splash screen visible until explicitly hidden
SplashScreen.preventAutoHideAsync();

export default function TabOneScreen() {
  const router = useRouter();
  // Add state to track if Redux store is ready
  const [isStoreReady, setIsStoreReady] = useState(false);

  const agentData = useSelector((state: RootState) => state?.agent?.docData);
  const userType = agentData?.userType || "free";

  // Track initial app launch
  useEffect(() => {
    try {
      logEvent(analytics, 'app_launch', {
        event_category: 'app',
        event_label: 'launch',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging app launch:', error);
    }
  }, [userType]);

  // useEffect(() => {
  //   // Function to request permission and get the token
  //   const getPushNotificationPermission = async () => {
  //     // Request notification permissions
  //     const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
  //     if (status === 'granted') {
  //       const token = await Notifications.getExpoPushTokenAsync();
  //       console.log('Expo Push Token:', token);
  //       // Optionally send the token to your server to store for sending notifications
  //     } else {
  //       console.log('Notification permissions not granted');
  //     }
  //   };

  //   getPushNotificationPermission();
  // }, []);

  // Get authentication status from Redux
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet,
  );

  // Handle navigation based on auth state once store is ready
  useEffect(() => {
    if (isStoreReady) {
      // Hide splash screen
      SplashScreen.hideAsync();

      // Track navigation based on auth status
      try {
        if (isAuthenticated) {
          logEvent(analytics, 'auth_redirect', {
            event_category: 'authentication',
            event_label: 'authenticated',
            destination: 'properties',
            user_type: userType
          });
          router.replace("/(tabs)/properties");
        } else {
          logEvent(analytics, 'landing_page_view', {
            event_category: 'authentication',
            event_label: 'unauthenticated',
            user_type: 'guest'
          });
        }
      } catch (error) {
        console.error('Error logging auth state:', error);
      }
    }
  }, [isStoreReady, isAuthenticated, router, userType]);

  // Track offline state
  useEffect(() => {
    if (!isConnectedToInternet) {
      try {
        logEvent(analytics, 'offline_state', {
          event_category: 'connectivity',
          event_label: 'offline',
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging offline state:', error);
      }
    }
  }, [isConnectedToInternet, userType]);

  // Set store ready after first render
  useEffect(() => {
    setIsStoreReady(true);
  }, []);

  // Return null while store is loading to keep splash screen visible
  if (!isStoreReady) {
    return null;
  }

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    try {
      logEvent(analytics, 'background_notification', {
        event_category: 'notifications',
        event_label: 'background',
        notification_type: remoteMessage?.data?.type || 'unknown',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging background notification:', error);
    }
    console.log('', remoteMessage)
  })

  if (!isConnectedToInternet) return <Offline />;

  // For unauthenticated users, show landing page
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <LandingPage />
    </View>
  );
}

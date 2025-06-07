import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AppState, Dimensions, Platform } from "react-native";
import "react-native-reanimated";
import "../global.css";
import ReduxProvider from "@/providers/ReduxProvider";
import LayoutApp from "./_layoutApp";
import useAppUpdate from "./helpers/checkUpdates";
import { withIAPContext } from "react-native-iap";
import SessionTracker from "./services/SessionTracker";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const { checkForUpdate, alreadyPromptedOnce } = useAppUpdate();
  
  // Get user data from Redux
  const agentData = useSelector((state: RootState) => state?.agent?.docData);
  const userType = agentData?.userType || "free";
  const userName = agentData?.name || "";
  const userPhoneNumber = useSelector((state: RootState) => state.agent.phonenumber);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // Initialize session tracking only for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      const sessionTracker = SessionTracker.getInstance();
      sessionTracker.setUserInfo(userType, userPhoneNumber || "", userName);

      return () => {
        sessionTracker.cleanup();
      };
    }
  }, [isAuthenticated, userType, userPhoneNumber, userName]);

  // Function to calculate dynamic top margin based on screen dimensions and orientation
  // const calculateTopMargin = () => {
  //   const { height, width } = Dimensions.get('window');
  //   const isLandscape = width > height;

  //   // Different margins based on device type and orientation
  //   if (Platform.OS === 'ios') {
  //     // iOS specific margins
  //     return isLandscape ? 0.01*height : 0.06*height;
  //   } else {
  //     // Android specific margins
  //     return isLandscape ? 0.01*height : 0.04*height;
  //   }
  // };

  // Update top margin when dimensions change (e.g., rotation)
  useEffect(() => {
    const updateMargin = () => {
      // setTopMargin(calculateTopMargin());
    };

    // Set initial margin
    updateMargin();

    // Add event listener for dimension changes
    const dimensionsSubscription = Dimensions.addEventListener(
      "change",
      updateMargin
    );

    // Clean up
    return () => {
      dimensionsSubscription.remove();
    };
  }, []);

  const checkUpdateStatus = async () => {
    await checkForUpdate();
  };

  useEffect(() => {
    const appStateChangeListener = AppState.addEventListener(
      "change",
      (newAppState) => {
        if (newAppState === "active") checkUpdateStatus();
      }
    );
    const interval = setInterval(() => {
      alreadyPromptedOnce.current = false;
      checkUpdateStatus();
    }, 43200000);
    return () => {
      clearInterval(interval);
      appStateChangeListener.remove();
    };
  }, []);

  return (
    <ReduxProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <LayoutApp />
        </SafeAreaView>
      </SafeAreaProvider>
    </ReduxProvider>
  );
}

export default Platform.OS === "ios" ? withIAPContext(RootLayout) : RootLayout;

import {
  router,
  SplashScreen,
  Stack,
  useNavigation,
  useRouter,
} from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";
import { toastConfig } from "@/utils/toastUtils";
import OnboardingFlow, { useOnboardingContext } from "./components/Onboarding";
import { updateAgentDocData } from "@/store/slices/agentSlice";
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import {
  Lato_400Regular,
  Lato_700Bold,
  Lato_300Light,
  Lato_900Black,
} from "@expo-google-fonts/lato";
import {
  Lora_400Regular,
  Lora_500Medium,
  Lora_600SemiBold,
  Lora_700Bold,
} from "@expo-google-fonts/lora";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import NetInfo from "@react-native-community/netinfo";
import { setIsConnectedToInternet } from "@/store/slices/appSlice";
import UserIcon from "@/assets/icons/svg/Header/UserIcon";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import CoinIcon from "@/assets/icons/svg/Sidebar/CoinIcon";
import FooterNavigation from "@/components/FooterNavigation";
import ArrowLeftIcon from "@/assets/icons/svg/Common/ArrowLeftIcon";
import { useCustomBackBehavior } from "@/hooks/useCustomBackBehavior";
import KamManager from "./modals/KamModal";
import { selectMyKam } from "@/store/slices/agentSlice";
import { setKamDataState } from "@/store/slices/kamSlice";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import {
  TrialStatusNotification,
  TrialStatusType,
} from "./components/TrialStatusNotification";

import useNotification from "./components/Notification/useNotification";
import SessionTracker from "./services/SessionTracker";
import Offline from "./components/Offline";

// Custom header component to apply the desired styling
const CustomHeader = ({
  title,
  onMenuPress,
  headerBackVisible,
}: {
  title: string;
  onMenuPress: (backHeader: boolean) => void;
  headerBackVisible: boolean;
}) => {
  const insets = useSafeAreaInsets();
  const monthlyCredits = useSelector(
    (state: RootState) => state?.agent?.docData?.monthlyCredits
  );
  const boosterCredits =
    useSelector((state: RootState) => state.agent?.docData?.boosterCredits) ||
    0;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => onMenuPress(headerBackVisible)}>
            {headerBackVisible ? (
              <ArrowLeftIcon />
            ) : (
              <UserIcon width={32} height={32} />
            )}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        {!headerBackVisible && (
          <TouchableOpacity
            style={styles.headerRight}
            onPress={() => router.push("/(pages)/Credits")}
          >
            <Text style={styles.creditsText}>
              {monthlyCredits + boosterCredits}
            </Text>
            <CoinIcon width={18} height={18} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function LayoutApp() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const colorScheme = useColorScheme();
  const [topMargin, setTopMargin] = useState(10);
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Lato_400Regular,
    Lato_700Bold,
    Lato_300Light,
    Lato_900Black,
    Inter_400Regular,
    Inter_600SemiBold,
    Lora_400Regular,
    Lora_500Medium,
    Lora_600SemiBold,
    Lora_700Bold,
  });
  const navigation = useNavigation();

  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  const { docData: agentData } = useSelector((state: RootState) => state.agent);
  const userType = agentData?.userType || "free";
  const userName = agentData?.name || "";
  const userPhoneNumber = useSelector(
    (state: RootState) => state.agent.phoneNumber
  );
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

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

  const calculateDaysLeft = (trialStartedAt: number): number => {
    try {
      const trialStartDate = new Date(trialStartedAt * 1000);

      if (isNaN(trialStartDate.getTime())) {
        return 31;
      }

      const trialEndDate = new Date(trialStartDate);
      trialEndDate.setDate(trialStartDate.getDate() + 30);

      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate());

      const timeDiff = trialEndDate.getTime() - currentDate.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

      return daysLeft;
    } catch (error) {
      return 31;
    }
  };

  const getTrialStatus = (daysLeft: number, credits: number) => {
    if (daysLeft < -3) {
      if (credits == 0) {
        return TrialStatusType.OUT_OF_CREDITS;
      } else {
        return TrialStatusType.LOW_CREDITS_WSUB;
      }
    } else if (daysLeft == 31) {
      return TrialStatusType.TO_START;
    } else if (daysLeft <= 0) {
      return TrialStatusType.EXPIRED;
    } else if (credits == 0) {
      return TrialStatusType.OUT_OF_CREDITS;
    } else if (credits <= 5) {
      return TrialStatusType.LOW_CREDITS;
    } else if (daysLeft <= 5) {
      return TrialStatusType.EXPIRING_SOON;
    } else if (daysLeft <= 30) {
      return TrialStatusType.ACTIVE;
    }
  };

  const daysLeft = calculateDaysLeft(agentData?.trialStartedAt);

  const showtrial = agentData?.userType === "premium" ? false : true;

  const [trialData, setTrialData] = useState({
    status: getTrialStatus(daysLeft, agentData?.monthlyCredits),
    daysLeft: daysLeft,
    credits: agentData?.monthlyCredits,
    showNotification: showtrial,
  });

  useEffect(() => {
    setTrialData((prev) => ({ ...prev, credits: agentData?.monthlyCredits }));
  }, [agentData?.monthlyCredits]);

  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const router = useRouter();

  const myKamId = useSelector(selectMyKam);
  useEffect(() => {
    if (myKamId) {
      dispatch(setKamDataState(myKamId));
    }
  }, [myKamId, dispatch]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const onMenuPress = (headerBack = false) => {
    if (headerBack) {
      router.back();
      return;
    }
    router.push("/(pages)/Profile");
  };

  useEffect(() => {
    if (fontsLoaded) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 2000);
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Show onboarding modal if the user has not completed onboarding
    if (agentData && agentData?.onboardingComplete === undefined) {
      setShowOnboarding(true);
    } else if (
      agentData &&
      (agentData?.onboardingComplete === true ||
        agentData?.onboardingComplete === false)
    ) {
      // Close the modal when onboarding is completed
      setShowOnboarding(false);
    }
  }, [agentData, agentData?.onboardingComplete]);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch(setIsConnectedToInternet(!!state.isInternetReachable));
    });

    // Unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

  const cpId =
    useSelector((state: RootState) => state?.agent?.docData?.cpId) || null;

  const notification = useNotification();

  useEffect(() => {
    notification.requestPermission();
  }, []);

  useEffect(() => {
    if (isAuthenticated && cpId != null) {
      const getTokenAsync = async () => {
        try {
          notification.refreshToken();
        } catch (error) {
          console.error("Error getting token:", error);
        }
      };

      getTokenAsync();
    }
  }, [isAuthenticated, cpId]);

  useCustomBackBehavior();
  if (!fontsLoaded) {
    return null;
  }

  const handleDismiss = () => {
    // You might want to store this preference in AsyncStorage
    setTrialData((prev) => ({ ...prev, showNotification: false }));
  };

  const handleOnBoarding = () => {
    setShowOnboarding(false);
  };

  if (!isConnectedToInternet) return <Offline />;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {showOnboarding && isAuthenticated && (
        <OnboardingFlow
          visible={showOnboarding}
          onComplete={() => {
            setShowOnboarding(false);
          }}
          onClose={() => {
            setShowOnboarding(false);
          }}
        />
      )}
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#000",
          headerTitleAlign: "center",
          headerBackVisible: false,
          header: ({ route, options }) => {
            const title = options.title || route.name;
            const headerBackVisible = options.headerBackVisible || false;
            const params = navigation?.getState()?.routes?.at(-1)?.params as {
              showNotificationBanner?: boolean;
            };
            return (
              <>
                <CustomHeader
                  title={title}
                  onMenuPress={onMenuPress}
                  headerBackVisible={headerBackVisible}
                />

                {params.showNotificationBanner &&
                  agentData?.userType !== "premium" && (
                    <TrialStatusNotification
                      showNotification={trialData.showNotification}
                      onDismiss={handleDismiss}
                    />
                  )}
              </>
            );
          },
          animation: "fade",
        }}
      >
        <Stack.Screen
          name="(tabs)/index"
          options={{ headerShown: false }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="(tabs)/properties"
          options={{ title: "Resale Inventories" }}
          initialParams={{ showNotificationBanner: true }}
        />
        <Stack.Screen
          name="(tabs)/requirements"
          options={{ title: "Requirements" }}
          initialParams={{ showNotificationBanner: true }}
        />
        <Stack.Screen
          name="(tabs)/AddInventoryForm"
          // options={{ title: "Add Inventory", headerBackVisible: true }}
          options={{ headerShown: false }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="(tabs)/UserRequirementForm"
          options={{ title: "Add Requirement", headerBackVisible: true }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="(tabs)/billings"
          options={{ title: "Billing", headerBackVisible: true }}
          initialParams={{ showFooter: false, showNotificationBanner: false }}
        />
        <Stack.Screen
          name="(tabs)/help"
          options={{ title: "Help", headerBackVisible: true }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="(tabs)/dashboardTab"
          options={{ title: "Dashboard" }}
          initialParams={{ showNotificationBanner: true }}
        />
        <Stack.Screen
          name="(tabs)/NotificationPage"
          options={{ title: "Notifications", headerShown: false }}
          initialParams={{ showNotificationBanner: true }}
        />

        <Stack.Screen
          name="components/Auth"
          options={{ headerShown: false }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="components/Auth/Signin"
          options={{ headerShown: false }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="components/Auth/OTPage"
          options={{ headerShown: false }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="components/Auth/VerificationPage"
          options={{ headerShown: false }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="components/Auth/BlacklistedPage"
          options={{ headerShown: false }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="not-found"
          options={{ headerShown: false }}
          initialParams={{ showFooter: false }}
        />

        <Stack.Screen
          name="components/property/PropertyDetailsScreen"
          options={{ headerShown: false }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="components/requirement/RequirementDetailsScreen"
          options={{ headerShown: false }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="(pages)/Profile"
          options={{
            title: "Settings",
            headerBackVisible: true,
          }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="(pages)/Drafts"
          options={{
            title: "Choose Inventory",
            headerBackVisible: true,
          }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="(pages)/Credits"
          options={{
            title: "ACN Credits",
            headerBackVisible: true,
          }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="(pages)/ComparePlans"
          options={{
            title:
              Platform.OS === "ios"
                ? "Choose the right plan for you"
                : "Plans Page",
            headerBackVisible: true,
          }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="(pages)/CheckoutScreen"
          options={{
            title: "Checkout",
            headerBackVisible: true,
          }}
          initialParams={{ showFooter: false, showNotificationBanner: false }}
        />
        <Stack.Screen
          name="(pages)/PaymentRecords"
          options={{
            title: "Payment Records",
            headerBackVisible: true,
          }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="components/Notification/NotificationSettings"
          options={{ headerShown: false }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="components/Payments/transaction"
          options={{ headerShown: false }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="(pages)/Legal"
          options={{
            title: " ",
            headerBackVisible: true,
          }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="(tabs)/ReportIssue"
          options={{
            title: "Report an Issue or Misuse",
            headerBackVisible: true,
          }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="components/Notification/ArchivedNotifications"
          options={{ headerShown: false }}
          initialParams={{ showFooter: false }}
        />
      </Stack>

      <Toast config={toastConfig} />
      <StatusBar style="auto" />
      <KamManager />

      {isAuthenticated && <FooterNavigation />}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#fff",
    width: "100%",
  },
  headerContent: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "space-between",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "flex-start",
    marginLeft: 16, // Add margin from hamburger icon
  },
  headerTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  headerRight: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    borderRadius: 20,
  },
  creditsText: {
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "Lato",
    color: "#5A5555",
  },
});

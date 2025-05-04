import { router, SplashScreen, Stack, useRouter } from "expo-router";
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
import { TrialStatusNotification, TrialStatusType } from "./components/TrialStatusNotification";
import PremiumModal from "./modals/PremiumModal";
import PaymentUnsuccessfulModal from "./modals/PaymentUnsuccessfulModal";
import useNotification from "./components/Notification/useNotification";

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
          <TouchableOpacity style={styles.headerRight} onPress={()=>router.push('/(pages)/Credits')}>
            <Text style={styles.creditsText}>{monthlyCredits}</Text>
            <CoinIcon width={18} height={18} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function LayoutApp() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const colorScheme = useColorScheme();
  const [topMargin, setTopMargin] = useState(10);
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });
  const [trialData, setTrialData] = useState({
    status: TrialStatusType.ACTIVE,
    daysLeft: 28,
    credits: 20,
    showNotification: true
  });


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
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Check if onboarding should be shown
  const { docData: agentData } = useSelector((state: RootState) => state.agent);
  
  useEffect(() => {
    // Show onboarding modal if the user has not completed onboarding
    if (agentData && agentData.onboardingComplete === false) {
      setShowOnboarding(true);
    } else if (agentData && agentData.onboardingComplete === true) {
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

  const isAuthenticated =
    useSelector((state: RootState) => state.auth.isAuthenticated) || false;

    const cpId =
        useSelector((state: RootState) => state?.agent?.docData?.cpId) || null;

  const notification = useNotification();

  useEffect(() => {
    notification.requestPermission();
  }, [])

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
    setTrialData(prev => ({ ...prev, showNotification: false }));
  };


  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#000",
          headerTitleAlign: "center",
          headerBackVisible: false,
          header: ({ route, options }) => {
            const title = options.title || route.name;
            const headerBackVisible = options.headerBackVisible || false;
            return (
              <>
              <CustomHeader
                title={title}
                onMenuPress={onMenuPress}
                headerBackVisible={headerBackVisible}
              />
              <TrialStatusNotification 
          status={trialData.status}
          daysLeft={trialData.daysLeft}
          credits={trialData.credits}
          onDismiss={handleDismiss}
        />
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
        />
        <Stack.Screen
          name="(tabs)/requirements"
          options={{ title: "Requirements" }}
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
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="(tabs)/help"
          options={{ title: "Help", headerBackVisible: true }}
          initialParams={{ showFooter: false }}
        />
        <Stack.Screen
          name="(tabs)/dashboardTab"
          options={{ title: "Dashboard" }}
        />
        <Stack.Screen
          name="(tabs)/NotificationPage"
          options={{ title: "Notifications" }}
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
            title: "Plans Page",
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
          initialParams={{ showFooter: false }}
        />
      </Stack>
      
       {/* <OnboardingFlow
        visible={true}
        onComplete={() => {
         // dispatch(updateAgentDocData({ onboardingComplete: true }));
          setShowOnboarding(false);
        }}
        onClose={() => {
          setShowOnboarding(false);
        }}
      /> */}
      <Toast config={toastConfig} />
      <StatusBar style="auto" />
      <KamManager />
      {/* <PremiumModal/> */}
      {/* <PaymentUnsuccessfulModal/> */}
      
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

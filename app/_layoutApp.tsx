import { SplashScreen, Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";
import { toastConfig } from "@/utils/toastUtils";
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
          <View style={styles.headerRight}>
            <Text style={styles.creditsText}>{monthlyCredits}</Text>
            <CoinIcon width={18} height={18} />
          </View>
        )}
      </View>
    </View>
  );
};

export default function LayoutApp() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  const dispatch = useDispatch();
  const router = useRouter();

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

  useCustomBackBehavior();
  if (!fontsLoaded) {
    return null;
  }
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
              <CustomHeader
                title={title}
                onMenuPress={onMenuPress}
                headerBackVisible={headerBackVisible}
              />
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
            // headerShown: false,
          }}
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

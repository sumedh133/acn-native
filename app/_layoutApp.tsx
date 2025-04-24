import HamburgerMenu from "@/components/HamburgerMenu";
import { SplashScreen, Stack } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import ProfileModal from "./modals/ProfileModal";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";
import { toastConfig } from "@/utils/toastUtils";
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
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
import { HamburgerMenuButton } from "@/components/HamburgerMenuButton";
import { KamModalButton } from "@/components/KamModalButton";
import { useDispatch } from "react-redux";
import NetInfo from "@react-native-community/netinfo";
import { setIsConnectedToInternet } from "@/store/slices/appSlice";

// Custom header component to apply the desired styling
const CustomHeader = ({
  title,
  onMenuPress,
  isMenuOpen,
}: {
  title: string;
  onMenuPress: () => void;
  isMenuOpen: boolean;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.headerContainer,
        Platform.OS === "android" && { paddingTop: insets.top },
      ]}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <HamburgerMenuButton onPress={onMenuPress} isOpen={isMenuOpen} />
        </View>
        <View style={styles.headerTitleContainer}>
          {!isMenuOpen && <Text style={styles.headerTitle}>{title}</Text>}
        </View>
        <View style={styles.headerRight}>
          <KamModalButton />
        </View>
      </View>
    </View>
  );
};

export default function LayoutApp() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const [topMargin, setTopMargin] = useState(10);
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  const dispatch = useDispatch();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const onMenuPress = () => {
    setIsMenuOpen(true);
    Keyboard.dismiss();
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
            return (
              <CustomHeader
                title={title}
                onMenuPress={() => onMenuPress()}
                isMenuOpen={isMenuOpen}
              />
            );
          },
        }}
      >
        <Stack.Screen name="(tabs)/index" options={{ headerShown: false }} />
        <Stack.Screen
          name="(tabs)/properties"
          options={{ title: "Resale Inventories" }}
        />
        <Stack.Screen
          name="(tabs)/requirements"
          options={{ title: "Requirements" }}
        />
        <Stack.Screen
          name="(tabs)/UserRequirementForm"
          options={{ title: "Add Requirement" }}
        />
        <Stack.Screen name="(tabs)/billings" options={{ title: "Billing" }} />
        <Stack.Screen name="(tabs)/help" options={{ title: "Help" }} />
        <Stack.Screen
          name="(tabs)/dashboardTab"
          options={{ title: "Dashboard" }}
        />

        <Stack.Screen name="components/Auth" options={{ headerShown: false }} />
        <Stack.Screen
          name="components/Auth/Signin"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="components/Auth/OTPage"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="components/Auth/VerificationPage"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="components/Auth/BlacklistedPage"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="not-found" options={{ headerShown: false }} />

        <Stack.Screen
          name="components/property/PropertyDetailsScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="components/requirement/RequirementDetailsScreen"
          options={{ headerShown: false }}
        />
      </Stack>
      <HamburgerMenu
        visible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenProfile={() => setProfileModalVisible(true)}
      />
      <ProfileModal
        visible={profileModalVisible}
        setVisible={setProfileModalVisible}
      />
      <Toast config={toastConfig} />
      <StatusBar style="auto" />
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
  },
  headerLeft: {
    width: 40, // Fixed width for the hamburger menu button
    alignItems: "flex-start",
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
    width: 40, // Fixed width for the right button
    alignItems: "flex-end",
  },
});

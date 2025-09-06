import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Svg, { G, Path, Polyline } from "react-native-svg";
import { useDoubleBackPressExit } from "@/hooks/useDoubleBackPressExit";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { logOut } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";

const { width, height } = Dimensions.get("window");

const UserTickIcon = () => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#e3e3e3"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <Path d="M8.5 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    <Polyline points="17 11 19 13 23 9" />
  </Svg>
);

const ArrowIcon = () => (
  <Svg width="16" height="17" viewBox="0 0 16 17" fill="none">
    <Path
      d="M10 2.5H12.6667C13.0203 2.5 13.3594 2.64048 13.6095 2.89052C13.8595 3.14057 14 3.47971 14 3.83333V13.1667C14 13.5203 13.8595 13.8594 13.6095 14.1095C13.3594 14.3595 13.0203 14.5 12.6667 14.5H10M6.66667 11.8333L10 8.5M10 8.5L6.66667 5.16667M10 8.5H2"
      stroke="#10302D"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LeftArrow = () => (
  <Svg width="24" height="20" viewBox="0 0 24 24">
    <G
      fill="none"
      stroke="#e3e3e3"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M20 12H4" />
      <Path d="M10 18L4 12L10 6" />
    </G>
  </Svg>
);

const RightArrow = () => (
  <Svg width="24" height="20" viewBox="0 0 24 24">
    <G
      fill="none"
      stroke="#e3e3e3"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M4 12H20" />
      <Path d="M14 18L20 12L14 6" />
    </G>
  </Svg>
);

const BidirectionalArrowIcon = () => (
  <View
    style={{
      flexDirection: "column",
      alignItems: "center",
      height: 40,
      overflow: "hidden",
    }}
  >
    <View
      style={{
        position: "relative",
        top: 4,
        right: 4,
        transform: [{ scaleY: -1 }],
      }}
    >
      <LeftArrow />
    </View>
    <View
      style={{
        position: "relative",
        top: -4,
      }}
    >
      <RightArrow />
    </View>
  </View>
);

export default function LandingPage() {
  const router = useRouter();
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";

  useEffect(() => {
    try {
      logEvent(analytics, "view_landing_page", {
        event_category: "auth",
        event_label: "landing_view",
        is_authenticated: isAuthenticated,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging landing page view:", error);
    }
  }, [isAuthenticated, userType]);

  const handleNavigate = async () => {
    try {
      logEvent(analytics, "landing_page_navigation", {
        event_category: "auth",
        event_label: "landing_interaction",
        action: isAuthenticated ? "continue" : "login_signup",
        destination: isAuthenticated
          ? "/(tabs)/properties"
          : "/components/Auth/Signin",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging navigation:", error);
    }

    if (!isAuthenticated) {
      await dispatch(logOut());
      router.replace("/components/Auth/Signin");
    } else {
      router.replace("/(tabs)/properties");
    }
  };

  useDoubleBackPressExit();

  return (
    <ImageBackground
      source={require("../../../assets/images/landingPageBg.webp")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/home-screen.png")}
              style={{ maxHeight: "40%", maxWidth: "55%" }}
            />
            <View style={styles.subtitleRow}>
              <Text style={[styles.subtitle]}>Connect</Text>
              <Text style={[styles.subtitle]}>|</Text>
              <Text style={[styles.subtitle]}>Collaborate</Text>
              <Text style={[styles.subtitle]}>|</Text>
              <Text style={[styles.subtitle]}>Succeed</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardText}>
              Agent Cooperation Network is a trusted platform that helps real
              estate agents share and find property listings for resale.
            </Text>

            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <UserTickIcon />
                </View>
                <Text style={styles.infoText}>Only for verified agents</Text>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <BidirectionalArrowIcon />
                </View>
                <Text style={styles.infoText}>
                  All transactions on a side-by-side basis
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity style={styles.loginBtn} onPress={handleNavigate}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8, // Add some space between icon and text
                }}
              >
                <ArrowIcon />
                <Text style={styles.loginText}>
                  {isAuthenticated ? "Continue" : "Login / Sign Up"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#153E3B",
    width: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: width * 0.05,
  },
  contentWrapper: {
    top: -10,
    width: "100%",
    // maxWidth: 338,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: height * 0.1,
    gap: 10,
  },
  title: {
    fontSize: 48,
    color: "#FFFFFF",
    fontWeight: "bold",
    fontFamily: "Lora_700Bold",
    marginBottom: 10,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#BFE9E6",
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
    tintColor: "#DDDDDD",
    resizeMode: "contain",
  },
  loginBtn: {
    top: height * 0.1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  loginText: {
    color: "#10302D",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 10,
    // borderColor: 'rgba(255, 255, 255, 0.13)',
    backgroundColor: "rgba(255, 255, 255, 0.13)",
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
  },
  cardText: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 24,
    textAlign: "left",
  },
  infoContainer: {
    marginTop: 8,
  },
  infoItem: {
    color: "#e3e3e3",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#e3e3e3",
  },
});

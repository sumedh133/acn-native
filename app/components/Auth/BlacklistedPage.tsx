import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { logOut } from "@/store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

export default function BlacklistedPage() {
  const router = useRouter();
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";
  const phonenumber = useSelector((state: RootState) => state?.agent?.phonenumber);

  const { width } = useWindowDimensions();

  const isSmallScreen = width < 350;

  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  useEffect(() => {
    try {
      logEvent(analytics, 'view_blacklisted_page', {
        event_category: 'auth',
        event_label: 'blacklisted_view',
        user_type: userType,
        phone_number: phonenumber
      });
    } catch (error) {
      console.error('Error logging blacklisted page view:', error);
    }
  }, [userType, phonenumber]);

  const handleBack = () => {
    try {
      logEvent(analytics, 'blacklisted_back_click', {
        event_category: 'auth',
        event_label: 'blacklisted_interaction',
        action: 'back',
        user_type: userType,
        phone_number: phonenumber
      });
    } catch (error) {
      console.error('Error logging back click:', error);
    }
    dispatch(logOut());
    router.back();
  };

  const handleSupportClick = () => {
    try {
      logEvent(analytics, 'blacklisted_support_click', {
        event_category: 'auth',
        event_label: 'blacklisted_interaction',
        action: 'support_call',
        user_type: userType,
        phone_number: phonenumber
      });
    } catch (error) {
      console.error('Error logging support click:', error);
    }
    const url = `tel:${9415006092}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OOPS! You've been blacklisted</Text>
      <View style={styles.card}>
        <Text style={styles.status}>
          <AntDesign name="closecircleo" size={20} color="#DC3545" /> You have
          been blacklisted
        </Text>
        <Text style={styles.message}>
          Your account has been blacklisted due to misuse or non-compliance with
          our agent guidelines. Contact{" "}
          <Text
            style={{ textDecorationLine: "underline" }}
            onPress={handleSupportClick}
          >
            support
          </Text>{" "}
          for assistance.
        </Text>
      </View>
      <TouchableOpacity onPress={handleBack}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 32, paddingLeft: 20 },
  card: {
    backgroundColor: "#FCEBEC",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderColor: "#FCEBEC",
    borderWidth: 1,
  },
  status: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#DC3545",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  message: { fontSize: 15, color: "#DC3545" },
  bold: { fontWeight: "bold" },
  back: {
    textAlign: "center",
    color: "#023020",
    fontWeight: "bold",
    fontSize: 16,
  },
});

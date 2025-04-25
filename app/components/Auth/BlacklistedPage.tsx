import React from "react";
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
import { useDispatch } from "react-redux";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";

export default function BlacklistedPage() {
  const router = useRouter();

  const { width } = useWindowDimensions();

  const isSmallScreen = width < 350;

  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  const handleBack = () => {
    dispatch(logOut());
    router.back();
  };

  const handleSupportClick = () => {
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

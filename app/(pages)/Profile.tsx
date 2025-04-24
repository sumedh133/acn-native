import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Offline from "../components/Offline";
import { SafeAreaView, Text, View, StyleSheet } from "react-native";

const Profile = () => {
  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  if (!isConnectedToInternet) return <Offline />;

  return (
        <Text>
          hihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihi
        </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F7",
    // marginTop: 32,
  },
});

export default Profile;

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Offline from "../components/Offline";
import { Text, View } from "react-native";

const Profile = () => {
  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  if (!isConnectedToInternet) return <Offline />;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F5F6F7",
      }}
    >
      <Text>
        hihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihi
      </Text>
    </View>
  );
};

export default Profile;

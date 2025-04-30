import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Pressable,
  Image,
} from "react-native";
import { Link, usePathname } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Button } from "react-native-elements";
import KamModalIcon from "@/assets/icons/svg/KamModalIcon";
import { showToast } from "@/utils/toastUtils";
import { useDispatch } from "react-redux";
import { setKamModalVisible } from "@/store/slices/kamSlice";

export const KamModalButton = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const pathName = usePathname();

  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  return (
    <>
      {isAuthenticated &&
        pathName != "/" &&
        pathName != "/components/Auth/Signin" &&
        pathName != "/components/Auth/OTPage" &&
        pathName != "/components/Auth/BlacklistedPage" &&
        pathName != "/components/Auth/VerificationPage" && (
          <>
            <View style={styles.button}>
              <Button
                onPress={() => {
                  if (!isConnectedToInternet)
                    showToast(
                      "error",
                      "You're offline! Please check your connection."
                    );
                  else {
                    dispatch(setKamModalVisible(true));
                  }
                }}
                containerStyle={{ marginVertical: 10 }}
                buttonStyle={{
                  backgroundColor: "#153E3B",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 12,
                }}
                icon={<KamModalIcon />}
              />
            </View>
          </>
        )}
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    marginRight: 10,
  },
});

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
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

export const KamModalButton = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const pathName = usePathname();
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  const handleKamButtonPress = () => {
    try {
      logEvent(analytics, 'kam_button_click', {
        event_category: 'interaction',
        event_label: 'kam_modal',
        current_path: pathName,
        is_online: isConnectedToInternet,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging KAM button click:', error);
    }

    if (!isConnectedToInternet) {
      try {
        logEvent(analytics, 'kam_offline_attempt', {
          event_category: 'error',
          event_label: 'offline',
          current_path: pathName,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging offline attempt:', error);
      }
      showToast(
        "error",
        "You're offline! Please check your connection."
      );
    } else {
      try {
        logEvent(analytics, 'kam_modal_open', {
          event_category: 'modal',
          event_label: 'open',
          current_path: pathName,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging modal open:', error);
      }
      dispatch(setKamModalVisible(true));
    }
  };

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
                onPress={handleKamButtonPress}
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

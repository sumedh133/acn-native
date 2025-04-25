import React, { useEffect, useRef } from "react";
import { BackHandler, ToastAndroid, Platform, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";

export const useCustomBackBehavior = () => {
  const router = useRouter();
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const handleBackPress = () => {
        if (navigation?.getState()?.routes?.length === 1) {
          router.replace("/(tabs)/properties");
          return true;
        }
        return false;
      };

      // Add back press event listener
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress
      );

      // Cleanup
      return () => {
        subscription.remove();
      };
    }, [router, navigation])
  );
};

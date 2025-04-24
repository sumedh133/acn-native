import React, { useEffect, useRef } from "react";
import { BackHandler, ToastAndroid, Platform, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

/**
 * A custom hook to handle double back press to exit app functionality
 * @param {number} exitDelay - Time in ms between back presses (default: 2000ms)
 * @returns {void}
 */
export const useDoubleBackPressExit = (exitDelay = 2000) => {
  const backPressedOnce = useRef(false);
  const backPressTimeout = useRef<NodeJS.Timeout | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const handleBackPress = () => {
        if (backPressedOnce.current) {
          // User pressed back twice, exit the app
          BackHandler.exitApp();
          return true;
        }

        // First back press
        backPressedOnce.current = true;

        // Show toast/alert message
        if (Platform.OS === "android") {
          ToastAndroid.show("Press back again to exit", ToastAndroid.SHORT);
        } else {
          Alert.alert("", "Press back again to exit", [{ text: "OK" }], {
            cancelable: true,
          });
        }

        // Reset after delay
        backPressTimeout.current = setTimeout(() => {
          backPressedOnce.current = false;
          backPressTimeout.current = null;
        }, exitDelay);

        // We handled the back press
        return true;
      };

      // Add back press event listener
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );

      // Cleanup
      return () => {
        subscription.remove();
        if (backPressTimeout.current) {
          clearTimeout(backPressTimeout.current);
        }
      };
    }, [exitDelay]),
  );
};

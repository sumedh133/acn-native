import React, { useEffect, useRef } from "react";
import { BackHandler, ToastAndroid, Platform, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

/**
 * A custom hook to handle back press to save draft functionality
 * @param {Function} setSaveDraftModal - State setter for the save draft modal
 * @returns {void}
 */
export const useBackToSaveDraft = (setSaveAsDraftModalVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
  useFocusEffect(
    React.useCallback(() => {
      const handleBackPress = () => {
        // Show save draft modal when back is pressed
        setSaveAsDraftModalVisible(true);
        
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
      };
    }, [setSaveAsDraftModalVisible]),
  );
};
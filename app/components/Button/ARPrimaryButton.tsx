import React from "react";
import {
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  View,
  GestureResponderEvent,
} from "react-native";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

interface ARPrimaryButtonProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  IconFirst?: any;
  IconSecond?: any;
  disabled?: boolean;
  style?: object;
  analyticsLabel?: string;
  analyticsContext?: string;
  analyticsData?: Record<string, any>;
}

const ARPrimaryButton: React.FC<ARPrimaryButtonProps> = ({
  children,
  onPress,
  IconFirst,
  IconSecond,
  disabled = false,
  style = {},
  analyticsLabel,
  analyticsContext = "general",
  analyticsData = {},
}) => {
  const handlePress = (event: GestureResponderEvent) => {
    try {
      logEvent(analytics, "primary_button_click", {
        event_category: analyticsContext,
        event_label:
          analyticsLabel ||
          (typeof children === "string" ? children : "unknown"),
        button_text: typeof children === "string" ? children : "unknown",
        has_icon_first: !!IconFirst,
        has_icon_second: !!IconSecond,
        is_disabled: disabled,
        ...analyticsData,
      });
    } catch (error) {
      console.error("Error logging button click:", error);
    }

    onPress?.(event);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={[styles.button, disabled ? styles.disabled : {}, style]}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {IconFirst && (
          <Image source={IconFirst} style={styles.icon} resizeMode="contain" />
        )}

        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.text}>
          {children}
        </Text>

        {IconSecond && (
          <Image source={IconSecond} style={styles.icon} resizeMode="contain" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: "100%",
  },
  disabled: {
    backgroundColor: "#a0a0a0",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  icon: {
    height: 20,
    width: 20,
  },
  text: {
    color: "#ffffff",
    fontSize: 14,
    flexShrink: 1,
  },
});

export default ARPrimaryButton;

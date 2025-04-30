import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PrimaryButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: keyof typeof Ionicons.glyphMap; // Use correct type for Ionicons
  iconSize?: number;
  iconColor?: string;
  isLoading?: boolean;
  disable?: boolean;
  fullWidth?: boolean;
}

// Use React.memo to optimize rendering and fix the static flag issue
const PrimaryButton = React.memo(
  ({
    children,
    onPress,
    style,
    textStyle,
    icon,
    iconSize = 20,
    iconColor = "white",
    isLoading = false,
    disable = false,
    fullWidth = true,
  }: PrimaryButtonProps) => {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          fullWidth && styles.fullWidth,
          disable || isLoading ? styles.disabled : null,
          style,
        ]}
        onPress={onPress}
        disabled={disable || isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <View style={styles.buttonContent}>
            {icon && (
              <Ionicons
                name={icon}
                size={iconSize}
                color={iconColor}
                style={styles.icon}
              />
            )}
            <Text style={[styles.text, textStyle]}>{children}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  },
);

// Set display name for debugging
PrimaryButton.displayName = "PrimaryButton";

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#153E3B", // Primary theme color
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    // Add shadow for better UI
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  fullWidth: {
    width: "100%",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  icon: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.7,
  },
});

export default PrimaryButton;

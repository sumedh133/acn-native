import React from "react";
import {
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  View,
  GestureResponderEvent,
} from "react-native";

interface ARSecondaryButtonProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  IconFirst?: any;
  IconSecond?: any;
  disabled?: boolean;
  style?: object;
}

const SecondaryButton: React.FC<ARSecondaryButtonProps> = ({
  children,
  onPress,
  IconFirst,
  IconSecond,
  disabled = false,
  style = {},
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.buttonWrapper,
        disabled ? styles.disabledWrapper : {},
        style,
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.innerButton}>
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
  buttonWrapper: {
    borderColor: "#007bff", // Equivalent to border-primary
    borderWidth: 1,
    borderRadius: 8,
    width: "100%",
    backgroundColor: "#f9fafb", // Secondary background (like gray-50)
    paddingVertical: 9,
    paddingHorizontal: 24,
  },
  disabledWrapper: {
    backgroundColor: "#e5e7eb", // Lighter shade when disabled
    borderColor: "#d1d5db",
  },
  innerButton: {
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
    color: "#111827",
    fontSize: 14,
    fontWeight: "500",
    flexShrink: 1,
  },
});

export default SecondaryButton;

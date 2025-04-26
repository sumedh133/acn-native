import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ViewStyle,
  DimensionValue,
} from "react-native";

interface TextInputFieldProps {
  value: string | null; // Changed to accept null since your state uses null
  setValue: (value: string) => void;
  title: string;
  placeholder?: string;
  required?: boolean;
  keyboardType?:
    | "default"
    | "number-pad"
    | "decimal-pad"
    | "numeric"
    | "email-address"
    | "phone-pad";
  maxLength?: number;
  suffix?: string;
}

const TextInputField = ({
  value,
  setValue,
  title,
  placeholder = "",
  required = false,
  keyboardType = "default",
  maxLength,
  suffix,
}: TextInputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <View style={styles.section}>
      <View style={styles.headingContainer}>
        <Text style={styles.sectionHeading}>{title}</Text>
        {required && <Text style={styles.compulsoryStar}>*</Text>}
      </View>

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInputContainer,
        ]}>
        <TextInput
          style={[styles.inputField, isFocused && styles.focusedInput]}
          value={value || ""} // Handle null values
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          maxLength={maxLength}
        />
        <Text style={styles.suffixText}>{suffix}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 6,
    width: "100%",
  },
  headingContainer: {
    flexDirection: "row",
    gap: 6,
    width: "100%", // Ensure heading takes full width
  },
  sectionHeading: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
  },
  compulsoryStar: {
    fontFamily: "sans-serif",
    color: "#DC3545",
    fontSize: 14,
    fontWeight: "400",
  },
  inputField: {
    flex: 1,
    width: "100%", // Always make input field take full width of its container
    height: 32,
    // borderRadius: 8,
    // borderWidth: 1,
    borderColor: "#E1E3E6",
    backgroundColor: "#FFFFFF",
    // paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: "sans-serif",
    color: "#000000",
  },
  focusedInput: {
    borderColor: "#0066FF",
    backgroundColor: "rgba(0, 102, 255, 0.05)",
  },
  inputContainer: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E1E3E6",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  focusedInputContainer: {
    borderColor: "#0066FF",
    backgroundColor: "rgba(0, 102, 255, 0.05)",
  },
  suffixText: {
    fontSize: 14,
    fontFamily: "sans-serif",
    color: "#757575",
    marginLeft: 4,
  },
});

export default TextInputField;

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";

interface ExtraDetailsProps {
  value: string | null;
  setValue: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
}

const ExtraDetailsField = ({
  value,
  setValue,
  placeholder = "Type here",
  required = false,
  maxLength,
}: ExtraDetailsProps) => {
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
        <Text style={styles.sectionHeading}>Extra Details</Text>
        {required && <Text style={styles.compulsoryStar}>*</Text>}
      </View>

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInputContainer,
        ]}>
        <TextInput
          style={[styles.inputField, isFocused && styles.focusedInput]}
          value={value || ""} 
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={maxLength}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
        />
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
    width: "100%",
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
    width: "100%",
    minHeight: 120,
    fontSize: 14,
    fontFamily: "sans-serif",
    color: "#000000",
    paddingTop: 12,
  },
  focusedInput: {
    borderColor: "#2B3034",
    // backgroundColor: "rgba(0, 102, 255, 0.05)",
  },
  inputContainer: {
    width: "100%",
    // minHeight: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E1E3E6",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
  },
  focusedInputContainer: {
    borderColor: "#2B3034",
    // backgroundColor: "rgba(0, 102, 255, 0.05)",
  },
});

export default ExtraDetailsField;
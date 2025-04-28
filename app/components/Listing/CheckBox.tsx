import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ViewStyle,
  DimensionValue,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Make sure to install expo/vector-icons if not already installed

interface CheckboxProps {
  checked: boolean;
  setChecked: (checked: boolean) => void;
  title?: string;
  label?: string;
  required?: boolean;
}

const Checkbox = ({
  checked,
  setChecked,
  title,
  label,
  required = false,
}: CheckboxProps) => {
  const toggleCheckbox = () => {
    setChecked(!checked);
  };

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={toggleCheckbox}
        activeOpacity={1}>
        <View style ={{flexDirection: "row", gap: 8}}>
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
        </View>

        {label && <Text style={styles.label}>{label}</Text>}
      {title && (
        <View style={styles.headingContainer}>
          <Text style={styles.sectionHeading}>{title}</Text>
          {required && <Text style={styles.compulsoryStar}>*</Text>}
        </View>
      )}
      </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
    flexDirection: "row",
  },
  headingContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#133836",
    borderColor: "#133836",
  },
  label: {
    fontSize: 14,
    fontFamily: "sans-serif",
    color: "#000000",
  },
});

export default Checkbox;

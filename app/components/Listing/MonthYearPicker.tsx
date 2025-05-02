import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import DatePicker from "react-native-date-picker";
import { Ionicons } from "@expo/vector-icons";

interface MonthYearPickerProps {
  value: string;
  setValue: (value: string) => void;
  title: string;
  placeholder?: string;
  required?: boolean;
  minYear?: number;
  maxYear?: number;
  disabled: boolean;
}

const MonthYearPicker = ({
  value,
  setValue,
  title,
  placeholder = "MM/YYYY",
  required = false,
  minYear = 1900,
  maxYear = 2100,
  disabled = false,
}: MonthYearPickerProps) => {
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [date, setDate] = useState<Date>(new Date());

  // Parse the current value to initialize date when opening picker
  useEffect(() => {
    if (value && value.includes("/")) {
      const parts = value.split("/");
      if (parts.length === 2) {
        const month = parseInt(parts[0], 10) - 1; // JS months are 0-indexed
        const year = parseInt(parts[1], 10);
        if (!isNaN(month) && !isNaN(year)) {
          const newDate = new Date();
          newDate.setMonth(month);
          newDate.setFullYear(year);
          setDate(newDate);
        }
      }
    }
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
    setOpen(true);
  };

  const handleConfirm = (selectedDate: Date) => {
    setOpen(false);
    setIsFocused(false);
    setDate(selectedDate);

    // Format month to ensure it's two digits (adding 1 because JS months are 0-indexed)
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    const year = selectedDate.getFullYear();
    setValue(`${month}/${year}`);
  };

  const handleCancel = () => {
    setOpen(false);
    setIsFocused(false);
  };

  return (
    <View style={styles.section}>
    <View style={styles.headingContainer}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {required && <Text style={styles.compulsoryStar}>*</Text>}
    </View>

    <TouchableOpacity
      style={[
        styles.inputContainer,
        isFocused && styles.focusedInputContainer,
        disabled && styles.disabledInputContainer, // Apply disabled style
      ]}
      onPress={handleFocus}
      activeOpacity={disabled ? 1 : 0.7} // Adjust opacity based on disabled state
      disabled={disabled} // Disable the touchable when disabled is true
    >
      <TextInput
        style={[styles.inputField, disabled && styles.disabledText]}
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        editable={false}
        pointerEvents="none"
      />
      <Ionicons 
        name="calendar-outline" 
        size={18} 
        color={disabled ? "#BBBBBB" : "#757575"} // Lighter color when disabled
      />
    </TouchableOpacity>

    <DatePicker
      modal
      open={open}
      date={date}
      mode="date"
      title="Select Month and Year"
      minimumDate={new Date(minYear, 0, 1)}
      maximumDate={new Date(maxYear, 11, 31)}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      locale="en"
      theme="light"
    />
  </View>
  );
};

const styles = StyleSheet.create({
  section: {
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 6,
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
    borderColor: "#2B3034",
  },
  inputField: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    fontFamily: "sans-serif",
    color: "#000000",
    padding: 0,
  },
  disabledText: {
    color: '#999999',
  },
  disabledInputContainer: {
    backgroundColor: '#F5F5F5',
    borderColor: '#DDDDDD',
  },
});

export default MonthYearPicker;

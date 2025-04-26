import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle, DimensionValue } from "react-native";
import { Ionicons } from '@expo/vector-icons'; // Make sure to install expo/vector-icons if not already installed


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
        {title && (
          <View style={styles.headingContainer}>
            <Text style={styles.sectionHeading}>{title}</Text>
            {required && <Text style={styles.compulsoryStar}>*</Text>}
          </View>
        )}

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={toggleCheckbox}
          activeOpacity={0.7}>
          <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
            {checked && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>

          {label && <Text style={styles.label}>{label}</Text>}
        </TouchableOpacity>
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
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#E1E3E6",
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxChecked: {
        backgroundColor: "#0066FF",
        borderColor: "#0066FF",
    },
    label: {
        fontSize: 14,
        fontFamily: "sans-serif",
        color: "#000000",
    },
});

export default Checkbox;
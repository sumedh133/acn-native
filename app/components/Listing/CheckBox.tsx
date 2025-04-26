import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle, DimensionValue } from "react-native";
import { Ionicons } from '@expo/vector-icons'; // Make sure to install expo/vector-icons if not already installed

type AlignmentType = "left" | "right" | "full";

interface CheckboxProps {
    checked: boolean;
    setChecked: (checked: boolean) => void;
    title?: string;
    label?: string;
    isRequired?: boolean;
    alignment?: AlignmentType;
    width?: DimensionValue;
}

const Checkbox = ({
    checked,
    setChecked,
    title,
    label,
    isRequired = false,
    alignment = "full",
    width,
}: CheckboxProps) => {
    const toggleCheckbox = () => {
        setChecked(!checked);
    };

    // Calculate container style based on alignment and width
    const getContainerStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            ...styles.section,
        };

        // Apply width if specified
        if (width) {
            baseStyle.width = width;
        }

        // Apply alignment styles
        switch (alignment) {
            case "left":
                baseStyle.alignSelf = "flex-start";
                if (!width) baseStyle.width = "auto";
                break;
            case "right":
                baseStyle.alignSelf = "flex-end";
                if (!width) baseStyle.width = "auto";
                break;
            case "full":
            default:
                baseStyle.alignSelf = "stretch";
                baseStyle.width = "100%";
                break;
        }

        return baseStyle;
    };

    return (
        <View style={getContainerStyle()}>
            {title && (
                <View style={styles.headingContainer}>
                    <Text style={styles.sectionHeading}>{title}</Text>
                    {isRequired && <Text style={styles.compulsoryStar}>*</Text>}
                </View>
            )}

            <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={toggleCheckbox}
                activeOpacity={0.7}
            >
                <View style={[
                    styles.checkbox,
                    checked && styles.checkboxChecked
                ]}>
                    {checked && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
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
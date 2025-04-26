import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, ViewStyle, DimensionValue } from "react-native";

type AlignmentType = "left" | "right" | "full";

interface TextInputFieldProps {
    value: string;
    setValue: (value: string) => void;
    title: string;
    placeholder?: string;
    isRequired?: boolean;
    keyboardType?: "default" | "number-pad" | "decimal-pad" | "numeric" | "email-address" | "phone-pad";
    maxLength?: number;
    alignment?: AlignmentType;
    width?: DimensionValue;
}

const TextInputField = ({
    value,
    setValue,
    title,
    placeholder = "",
    isRequired = false,
    keyboardType = "default",
    maxLength,
    alignment = "full",
    width,
}: TextInputFieldProps) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
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
            <View style={styles.headingContainer}>
                <Text style={styles.sectionHeading}>{title}</Text>
                {isRequired && <Text style={styles.compulsoryStar}>*</Text>}
            </View>

            <TextInput
                style={[
                    styles.inputField,
                    isFocused && styles.focusedInput
                ]}
                value={value}
                onChangeText={setValue}
                placeholder={placeholder}
                placeholderTextColor="#A0A0A0"
                onFocus={handleFocus}
                onBlur={handleBlur}
                keyboardType={keyboardType}
                maxLength={maxLength}
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
    inputField: {
        width: "100%",
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E1E3E6",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 12,
        fontSize: 14,
        fontFamily: "sans-serif",
        color: "#000000",
    },
    focusedInput: {
        borderColor: "#0066FF",
        backgroundColor: "rgba(0, 102, 255, 0.05)",
    }
});

export default TextInputField;

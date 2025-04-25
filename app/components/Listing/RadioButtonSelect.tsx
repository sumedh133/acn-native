import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

interface RadioButtonSelectProps {
    value: string | null;
    setvalue: (value: string | null) => void;
    title: string;
    options: Array<{ label: string; value: string }>;
}

const RadioButtonSelect = ({
    value,
    setvalue,
    title,
    options,
}: RadioButtonSelectProps) => {
    const handleSelect = (val: string) => {
        console.log(val, "value")
        if (value === val) {
            setvalue(null);
        } else {
            setvalue(val);
        }
    };

    return (
        <View style={styles.section}>
            <View style={styles.headingContainer}>
                <Text style={styles.sectionHeading}>{title}</Text>
                <Text style={styles.compulsoryStar}>*</Text>
            </View>

            <View style={styles.optionContainer}>
                {options.map((option) => {
                    return (
                        <TouchableOpacity
                            style={[styles.options]}
                            onPress={() => handleSelect(option.label)}>
                            <View style={styles.radioCircle}>
                                {value === option.value && (
                                    <View style={styles.selectedRadioCircle} />
                                )}
                            </View>
                            <Text style={styles.optionText}>{option.value}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        width: "100%",
        flex: 1,
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
    optionContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        gap: 10,
    },
    options: {
        flex: 1,
        height: 40,
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1,
        paddingVertical: 6,
        paddingHorizontal: 12,
        display: "flex",
        flexDirection: "row",
        gap: 12,
        backgroundColor: "#FFFFFF",
        borderColor: "#E1E3E6",
    },
    selectedOption: {
        borderColor: "#0066FF",
        backgroundColor: "rgba(0, 102, 255, 0.05)",
    },
    radioCircle: {
        height: 14,
        width: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
    },
    selectedRadioCircle: {
        width: 8.4,
        height: 8.4,
        borderRadius: 16,
        backgroundColor: "#000000",
    },
    optionText: {
        fontFamily: "sans-serif",
        fontWeight: "400",
        fontSize: 14,
        color: "#000000",
    },
});

export default RadioButtonSelect;

import React, { useState } from "react";
import { 
    StyleSheet, 
    Text, 
    View, 
    TouchableOpacity, 
    Modal, 
    FlatList, 
    ViewStyle,
    DimensionValue 
} from "react-native";
import { Ionicons } from '@expo/vector-icons'; // Make sure to install expo/vector-icons if not already installed

type AlignmentType = "left" | "right" | "full";

interface DropdownOption {
    label: string;
    value: string;
}

interface DropdownSelectProps {
    value: string | null;
    setValue: (value: string | null) => void;
    title: string;
    options: DropdownOption[];
    placeholder?: string;
    required?: boolean;
    width?: DimensionValue;
    alignment: AlignmentType;
}

const DropdownSelect = ({
    value,
    setValue,
    title,
    options,
    placeholder = "Select",
    required = false,
    alignment = "full",
    width,
}: DropdownSelectProps) => {
    const [modalVisible, setModalVisible] = useState(false);

    const handleSelect = (option: DropdownOption) => {
        setValue(option.value);
        setModalVisible(false);
    };

    // Find the selected option label to display
    const selectedLabel = value 
        ? options.find(option => option.value === value)?.label || value
        : placeholder;

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
                {required && <Text style={styles.compulsoryStar}>*</Text>}
            </View>

            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <Text 
                    style={[
                        styles.selectedText,
                        !value && styles.placeholderText
                    ]}
                >
                    {selectedLabel}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#555" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                    activeOpacity={1}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{title}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        value === item.value && styles.selectedOptionItem
                                    ]}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text 
                                        style={[
                                            styles.optionText,
                                            value === item.value && styles.selectedOptionText
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                    {value === item.value && (
                                        <Ionicons name="checkmark" size={18} color="#0066FF" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
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
    dropdownButton: {
        width: "100%",
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E1E3E6",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    selectedText: {
        fontSize: 14,
        fontFamily: "sans-serif",
        color: "#000000",
    },
    placeholderText: {
        color: "#A0A0A0",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 20,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E1E3E6",
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E1E3E6",
    },
    selectedOptionItem: {
        backgroundColor: "rgba(0, 102, 255, 0.05)",
    },
    optionText: {
        fontSize: 14,
    },
    selectedOptionText: {
        color: "#0066FF",
        fontWeight: "500",
    },
});

export default DropdownSelect;
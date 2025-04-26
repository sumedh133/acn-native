import React, { useState } from "react";
import { 
    StyleSheet, 
    Text, 
    View, 
    TouchableOpacity, 
    Modal, 
    FlatList, 
    ViewStyle,
    TextInput,
    TouchableWithoutFeedback,
    DimensionValue 
} from "react-native";
import { Ionicons } from '@expo/vector-icons'; // Make sure to install expo/vector-icons if not already installed


interface MonthYearPickerProps {
    value: string;
    setValue: (value: string) => void;
    title: string;
    placeholder?: string;
    required?: boolean;
    minYear?: number;
    maxYear?: number;
}

const MonthYearPicker = ({
    value,
    setValue,
    title,
    placeholder = "MM/YYYY",
    required = false,
    minYear = 1900,
    maxYear = 2100,
}: MonthYearPickerProps) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [tempMonth, setTempMonth] = useState<number | null>(null);
    const [tempYear, setTempYear] = useState<number | null>(null);
    
    // Parse the current value to initialize month and year when opening modal
    const initializeValues = () => {
        if (value && value.includes('/')) {
            const parts = value.split('/');
            if (parts.length === 2) {
                setTempMonth(parseInt(parts[0], 10));
                setTempYear(parseInt(parts[1], 10));
            }
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
        initializeValues();
        setModalVisible(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleConfirm = () => {
        if (tempMonth && tempYear) {
            // Format month to ensure it's two digits
            const formattedMonth = tempMonth.toString().padStart(2, '0');
            setValue(`${formattedMonth}/${tempYear}`);
        }
        setModalVisible(false);
    };

    const handleCancel = () => {
        setModalVisible(false);
    };

    const months = [
        { label: "January", value: 1 },
        { label: "February", value: 2 },
        { label: "March", value: 3 },
        { label: "April", value: 4 },
        { label: "May", value: 5 },
        { label: "June", value: 6 },
        { label: "July", value: 7 },
        { label: "August", value: 8 },
        { label: "September", value: 9 },
        { label: "October", value: 10 },
        { label: "November", value: 11 },
        { label: "December", value: 12 }
    ];

    // Generate years array from minYear to maxYear
    const years = Array.from(
        { length: maxYear - minYear + 1 },
        (_, i) => ({ label: (minYear + i).toString(), value: minYear + i })
    );

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
          ]}
          onPress={handleFocus}
          activeOpacity={0.7}>
          <TextInput
            style={styles.inputField}
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#A0A0A0"
            editable={false}
            pointerEvents="none"
          />
          <Ionicons name="calendar-outline" size={18} color="#757575" />
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleCancel}>
          <TouchableWithoutFeedback onPress={handleCancel}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Month and Year</Text>
                    <TouchableOpacity onPress={handleCancel}>
                      <Ionicons name="close" size={24} color="#000" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.pickerContainer}>
                    <View style={styles.pickerColumn}>
                      <Text style={styles.pickerTitle}>Month</Text>
                      <FlatList
                        data={months}
                        keyExtractor={(item) => item.value.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={[
                              styles.pickerItem,
                              tempMonth === item.value &&
                                styles.selectedPickerItem,
                            ]}
                            onPress={() => setTempMonth(item.value)}>
                            <Text
                              style={[
                                styles.pickerText,
                                tempMonth === item.value &&
                                  styles.selectedPickerText,
                              ]}>
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>

                    <View style={styles.pickerColumn}>
                      <Text style={styles.pickerTitle}>Year</Text>
                      <FlatList
                        data={years}
                        keyExtractor={(item) => item.value.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={[
                              styles.pickerItem,
                              tempYear === item.value &&
                                styles.selectedPickerItem,
                            ]}
                            onPress={() => setTempYear(item.value)}>
                            <Text
                              style={[
                                styles.pickerText,
                                tempYear === item.value &&
                                  styles.selectedPickerText,
                              ]}>
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </View>

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancel}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.confirmButton,
                        (!tempMonth || !tempYear) && styles.disabledButton,
                      ]}
                      onPress={handleConfirm}
                      disabled={!tempMonth || !tempYear}>
                      <Text style={styles.confirmButtonText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
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
    inputField: {
        flex: 1,
        height: "100%",
        fontSize: 14,
        fontFamily: "sans-serif",
        color: "#000000",
        padding: 0,
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
    pickerContainer: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#E1E3E6",
    },
    pickerColumn: {
        flex: 1,
        maxHeight: 300,
    },
    pickerTitle: {
        fontSize: 14,
        fontWeight: "600",
        padding: 12,
        textAlign: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E1E3E6",
    },
    pickerItem: {
        padding: 12,
        alignItems: "center",
    },
    selectedPickerItem: {
        backgroundColor: "rgba(0, 102, 255, 0.05)",
    },
    pickerText: {
        fontSize: 14,
    },
    selectedPickerText: {
        color: "#0066FF",
        fontWeight: "500",
    },
    buttonContainer: {
        flexDirection: "row",
        padding: 16,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E1E3E6",
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#000000",
    },
    confirmButton: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        backgroundColor: "#0066FF",
        alignItems: "center",
        justifyContent: "center",
    },
    disabledButton: {
        backgroundColor: "#CCE0FF",
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#FFFFFF",
    },
});

export default MonthYearPicker;

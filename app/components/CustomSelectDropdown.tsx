import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useCallback, useMemo, useRef } from "react";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";

interface DropdownOption {
  label: string;
  value: string;
}

interface CustomSelectDropdownProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: DropdownOption[];
  placeholder: string;
  disabled?: boolean;
  style?: any;
}

const CustomSelectDropdown: React.FC<CustomSelectDropdownProps> = ({
  selectedValue,
  onValueChange,
  options,
  placeholder,
  disabled = false,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });
  const triggerRef = useRef<View>(null);
  const userType = useSelector((state: RootState) => state.agent?.docData?.userType) || "free";

  const handleToggle = useCallback(() => {
    if (disabled) return;

    try {
      logEvent(analytics, isOpen ? 'close_dropdown' : 'open_dropdown', {
        event_category: 'dropdown',
        event_label: isOpen ? 'close' : 'open',
        placeholder: placeholder,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging dropdown toggle:', error);
    }

    // Measure the trigger component
    if (triggerRef.current) {
      triggerRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDimensions({
          width,
          height,
          top: pageY + 14,
          left: pageX,
        });
        setIsOpen((prev) => !prev);
      });
    }
  }, [disabled, isOpen, placeholder, userType]);

  const handleSelectItem = useCallback(
    (value: string) => {
      const selectedOption = options.find(opt => opt.value === value);
      try {
        logEvent(analytics, 'select_dropdown_option', {
          event_category: 'dropdown',
          event_label: 'select',
          option_value: value,
          option_label: selectedOption?.label,
          dropdown_type: placeholder,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging option selection:', error);
      }

      onValueChange(value);
      setIsOpen(false);
    },
    [onValueChange, options, placeholder, userType],
  );

  const renderItems = useMemo(() => {
    return options.map((item, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.item,
          selectedValue === item.value && styles.selectedItemBackground,
        ]}
        onPress={() => handleSelectItem(item.value)}
      >
        <View style={styles.itemContent}>
          <View
            style={[
              styles.checkbox,
              selectedValue === item.value && styles.selectedCheckbox,
            ]}
          >
            {selectedValue === item.value && (
              <MaterialIcons name="check" size={12} color="#FFFFFF" />
            )}
          </View>
          <Text
            style={[
              styles.itemText,
              selectedValue === item.value && styles.selectedItemText,
            ]}
          >
            {item.label}
          </Text>
        </View>
      </TouchableOpacity>
    ));
  }, [options, selectedValue, handleSelectItem]);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        ref={triggerRef}
        onPress={handleToggle}
        style={[
          styles.dropdownButton,
          isOpen && styles.dropdownButtonOpen,
          disabled && styles.disabledButton,
        ]}
      >
        <Text
          style={[
            styles.dropdownButtonText,
            isOpen && styles.dropdownButtonTextOpen,
            disabled && styles.disabledButtonText,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selectedValue
            ? options.find((opt) => opt.value === selectedValue)?.label
            : placeholder}
        </Text>
        <MaterialIcons
          name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color={disabled ? "#A0A0A0" : isOpen ? "#FFFFFF" : "#666666"}
        />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={isOpen}
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.dropdown,
                {
                  width: dimensions.width,
                  top: dimensions.top,
                  left: dimensions.left,
                },
              ]}
            >
              <ScrollView
                style={styles.dropdownScroll}
                contentContainerStyle={styles.dropdownContent}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
              >
                {renderItems}
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 8,
  },
  dropdownButtonOpen: {
    backgroundColor: "#153E3B",
    borderColor: "#153E3B",
  },
  disabledButton: {
    backgroundColor: "#F5F5F4",
    borderColor: "#e5e7eb",
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    marginRight: 10,
  },
  dropdownButtonTextOpen: {
    color: "#FFFFFF",
  },
  disabledButtonText: {
    color: "#6B7280",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownContent: {
    paddingVertical: 4,
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  selectedItemBackground: {
    backgroundColor: "#F3F4F6",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCheckbox: {
    backgroundColor: "#153E3B",
    borderColor: "#153E3B",
  },
  itemText: {
    fontSize: 14,
    color: "#1F2937",
  },
  selectedItemText: {
    color: "#153E3B",
    fontWeight: "500",
  },
});

export default React.memo(CustomSelectDropdown);

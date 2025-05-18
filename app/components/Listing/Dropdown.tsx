import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  ViewStyle,
  Pressable,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  searchable?: boolean;
}

const DropdownSelect = ({
  value,
  setValue,
  title,
  options,
  placeholder = "Select",
  required = false,
  searchable = false,
}: DropdownSelectProps) => {
  const dropdownRef = useRef<View>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Add this function to your component
  const measureDropdownPosition = () => {
    if (dropdownRef.current) {
      dropdownRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          x: pageX,
          y: pageY,
          width: width,
          height: height,
        });
      });
    }
  };

  const handleSelect = (option: DropdownOption) => {
    if (value === option.value && !required) {
      setValue(null);
    } else {
      setValue(option.value);
    }
    setModalVisible(false);
  };

  const toggleModal = () => {
    if (!modalVisible) {
      measureDropdownPosition();
    }
    setModalVisible(!modalVisible);
  };

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
  };

  // Filter options based on search term
  const filteredOptions = searchTerm
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Find the selected option label to display
  const selectedLabel = value
    ? options.find((option) => option.value === value)?.label || value
    : placeholder;

  return (
    <View style={styles.section}>
      <View style={styles.headingContainer}>
        <Text style={styles.sectionHeading}>{title}</Text>
        {required && <Text style={styles.compulsoryStar}>*</Text>}
      </View>

      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={toggleModal}
        activeOpacity={0.7}
        // Add this ref to get the position of the dropdown button
        ref={dropdownRef}
      >
        <Text style={[styles.selectedText, !value && styles.placeholderText]}>
          {selectedLabel}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#555" />
      </TouchableOpacity>

      {modalVisible && (
        <Modal
          transparent
          animationType="none"
          visible={modalVisible}
          onRequestClose={toggleModal}
        >
          {/* invisible full-screen backdrop */}
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={toggleModal}
          />
          {/* Position the dropdown list directly below the button */}
          <View
            style={[
              styles.optionsContainer,
              {
                position: "absolute",
                top: dropdownPosition.y + dropdownPosition.height - 35, // Reducing the gap
                left: dropdownPosition.x,
                width: dropdownPosition.width,
              },
            ]}
          >
            {searchable && (
              <TextInput
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={handleSearchChange}
                placeholder="Search..."
                placeholderTextColor="#6B7280"
              />
            )}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.optionItem,
                    hoveredItem === item.value && styles.hoveredOptionItem,
                    value === item.value && styles.selectedOptionItem,
                  ]}
                  onPress={() => handleSelect(item)}
                  onPressIn={() => setHoveredItem(item.value)}
                  onPressOut={() => setHoveredItem(null)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </Pressable>
              )}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={true}
              nestedScrollEnabled={true}
              style={styles.resultsList}
            />
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 6,
    position: "relative",
    width: "100%",
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
  optionsContainer: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    padding: 4,
    marginTop: 1,
  },
  searchInput: {
    width: "100%",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E3E3E3",
    backgroundColor: "#FFFFFF",
    position: "relative",
    top: 0,
    fontFamily: "sans-serif",
    fontSize: 14,
  },
  resultsList: {
    width: "100%",
    // backgroundColor: "pink",
  },
  optionItem: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginVertical: 1,
    borderRadius: 6,
  },
  hoveredOptionItem: {
    backgroundColor: "#F2F2F2",
  },
  selectedOptionItem: {
    backgroundColor: "#DFF4F3",
  },
  optionText: {
    fontFamily: "sans-serif",
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 21,
    color: "#0A0B0A",
  },
});

export default DropdownSelect;

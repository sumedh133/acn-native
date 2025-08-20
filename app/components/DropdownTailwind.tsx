import React, { useState, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
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
  title?: string;
  options: DropdownOption[];
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  // Custom classNames for styling
  containerClassName?: string;
  titleClassName?: string;
  buttonClassName?: string;
  buttonTextClassName?: string;
  dropdownClassName?: string;
  searchInputClassName?: string;
  optionItemClassName?: string;
  optionTextClassName?: string;
  selectedOptionClassName?: string;
  hoveredOptionClassName?: string;
  iconComponent?: React.ReactNode;
}

const DropdownTailwind = ({
  value,
  setValue,
  title,
  options,
  placeholder = "Select",
  required = false,
  searchable = false,
  // Custom classNames with defaults
  containerClassName = "items-center justify-center gap-1.5 relative w-full",
  titleClassName = "font-semibold text-sm",
  buttonClassName = "w-full h-10 rounded-lg border border-[#B5B3B3] bg-white px-3 flex-row items-center justify-between",
  buttonTextClassName = "text-sm",
  dropdownClassName = "absolute bg-white rounded-lg border border-gray-200 shadow-md z-50 p-1 mt-0.5",
  searchInputClassName = "w-full p-2.5 border-b border-gray-200 bg-white text-sm",
  optionItemClassName = "w-full px-4 py-1.5 my-0.5 rounded-md",
  optionTextClassName = "font-semibold text-sm leading-5 text-gray-900",
  selectedOptionClassName = "bg-teal-50",
  hoveredOptionClassName = "bg-gray-100",
  iconComponent,
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
    <View className={containerClassName}>
      {title && (
        <View className="flex-row gap-1.5 self-start">
          <Text className={titleClassName}>{title}</Text>
          {required && <Text className="text-red-500">*</Text>}
        </View>
      )}

      <TouchableOpacity
        className={buttonClassName}
        onPress={toggleModal}
        activeOpacity={0.7}
        ref={dropdownRef}
      >
        <Text 
          className={`${buttonTextClassName} ${!value ? "text-gray-400" : "text-black"}`}
        >
          {selectedLabel}
        </Text>
        {iconComponent || <Ionicons name="chevron-down" size={16} color="#555" />}
      </TouchableOpacity>

      {modalVisible && (
        <Modal
          transparent
          animationType="none"
          visible={modalVisible}
          onRequestClose={toggleModal}
        >
          {/* invisible full-screen backdrop */}
          <Pressable className="absolute inset-0" onPress={toggleModal} />
          {/* Position the dropdown list directly below the button */}
          <View
            className={dropdownClassName}
            style={{
              top: dropdownPosition.y + dropdownPosition.height - 35,
              left: dropdownPosition.x,
              width: dropdownPosition.width,
              maxHeight: 200,
            }}
          >
            {searchable && (
              <TextInput
                className={searchInputClassName}
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
                  className={`${optionItemClassName} ${
                    hoveredItem === item.value ? hoveredOptionClassName : ""
                  } ${value === item.value ? selectedOptionClassName : ""}`}
                  onPress={() => handleSelect(item)}
                  onPressIn={() => setHoveredItem(item.value)}
                  onPressOut={() => setHoveredItem(null)}
                >
                  <Text className={optionTextClassName}>
                    {item.label}
                  </Text>
                </Pressable>
              )}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={true}
              nestedScrollEnabled={true}
              className="w-full"
            />
          </View>
        </Modal>
      )}
    </View>
  );
};

export default DropdownTailwind;
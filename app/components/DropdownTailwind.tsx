import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Pressable,
  Modal,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface DropdownOption {
  label: string;
  value: string;
  count?: number; // NEW: For Algolia facet counts
}

// Single select props
interface SingleSelectProps {
  multiSelect?: false;
  value: string | null;
  setValue: (value: string | null) => void;
}

// Multi select props
interface MultiSelectProps {
  multiSelect: true;
  value: string[] | null;
  setValue: (value: string[] | null) => void;
}

// Base props shared by both
interface BaseDropdownProps {
  title?: string;
  options: DropdownOption[];
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  forcePlaceholder?: boolean;
  placeholderClassName?: string;
  showCounts?: boolean; // NEW: Show facet counts

  // Custom classNames for styling (merged with defaults)
  containerClassName?: string;
  titleClassName?: string;
  buttonClassName?: string;
  buttonTextClassName?: string;
  dropdownClassName?: string;
  searchInputClassName?: string;
  optionItemClassName?: string;
  optionTextClassName?: string;
  selectedOptionClassName?: string;
  countClassName?: string; // NEW: For styling counts
  iconComponent?: React.ReactNode;
  loading?: boolean;
}

// Combined props using union type
type DropdownSelectProps = BaseDropdownProps &
  (SingleSelectProps | MultiSelectProps);

const DropdownTailwind = ({
  value,
  setValue,
  multiSelect = false,
  title,
  options,
  placeholder = "Select",
  required = false,
  searchable = false,
  forcePlaceholder = false,
  showCounts = false, // NEW

  containerClassName,
  titleClassName,
  placeholderClassName,
  buttonClassName,
  buttonTextClassName,
  dropdownClassName,
  searchInputClassName,
  optionItemClassName,
  optionTextClassName,
  selectedOptionClassName,
  countClassName, // NEW
  iconComponent,
}: DropdownSelectProps) => {
  const dropdownRef = useRef<View>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;

  // Default classes
  const defaults = {
    container: "items-center justify-center relative w-full",
    title: "text-gray-800 mb-2",
    button:
      "w-full h-10 rounded-lg border border-[#B5B3B3] bg-white px-3 flex-row items-center justify-between relative bg-[#FAFAFA]",
    placeholderText: "text-sm text-gray-400 pr-2",
    buttonText: "text-sm",
    dropdown:
      "absolute bg-white rounded-lg border border-gray-200 shadow-md z-50 p-1",
    searchInput: "w-full p-2.5 border-b border-gray-200 bg-white text-sm",
    optionItem:
      "w-full px-4 py-1.5 my-0.5 rounded-md flex-row items-center justify-between",
    optionText: "font-semibold text-sm leading-5 text-gray-900 flex-1",
    selectedOption: "bg-teal-50",
    count: "text-xs text-gray-500 ml-2", // NEW: Default count styling
  };

  const merge = (def: string, custom?: string) =>
    custom ? `${def} ${custom}` : def;

  const measureDropdownPosition = () => {
    if (dropdownRef.current) {
      dropdownRef.current.measureInWindow((pageX, pageY, width, height) => {
        setDropdownPosition({
          x: pageX,
          y: pageY,
          width,
          height,
        });
      });
    }
  };

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: modalVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [modalVisible]);

  // interpolation for degrees
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [modalVisible]);

  // Helper functions for multi-select
  const getSelectedValues = (): string[] => {
    if (multiSelect) {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return value ? [value as string] : [];
  };

  const isOptionSelected = (optionValue: string): boolean => {
    const selectedValues = getSelectedValues();
    return selectedValues.includes(optionValue);
  };

  const handleSelect = (option: DropdownOption) => {
    if (multiSelect) {
      const selectedValues = getSelectedValues();
      let newValues: string[];

      if (selectedValues.includes(option.value)) {
        // Remove if already selected
        newValues = selectedValues.filter((v) => v !== option.value);
      } else {
        // Add if not selected
        newValues = [...selectedValues, option.value];
      }

      if (newValues.length === 0 && !required) {
        (setValue as MultiSelectProps["setValue"])(null);
      } else {
        (setValue as MultiSelectProps["setValue"])(newValues);
      }
    } else {
      // Single select logic (original)
      if (value === option.value && !required) {
        (setValue as SingleSelectProps["setValue"])(null);
      } else {
        (setValue as SingleSelectProps["setValue"])(option.value);
      }
      setModalVisible(false);
    }
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

  const filteredOptions = searchTerm
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Updated display logic for multi-select
  const getDisplayText = (): string => {
    if (forcePlaceholder) {
      return placeholder;
    }

    if (multiSelect) {
      const selectedValues = getSelectedValues();
      if (selectedValues.length === 0) {
        return placeholder;
      } else if (selectedValues.length === 1) {
        const selectedOption = options.find(
          (opt) => opt.value === selectedValues[0]
        );
        return selectedOption?.label || selectedValues[0];
      } else {
        return `${selectedValues.length} selected`;
      }
    } else {
      // Single select logic
      if (value) {
        const selectedOption = options.find((option) => option.value === value);
        return selectedOption?.label || (value as string);
      }
      return placeholder;
    }
  };

  const selectedLabel = getDisplayText();
  const hasSelection = multiSelect ? getSelectedValues().length > 0 : !!value;

  return (
    <View className={merge(defaults.container, containerClassName)}>
      {title && (
        <View className="flex-row gap-1.5 self-start">
          <Text className={merge(defaults.title, titleClassName)} style={{fontFamily: "Montserrat_600SemiBold"}}>{title}</Text>
          {required && <Text className="text-red-500">*</Text>}
        </View>
      )}

      <TouchableOpacity
        className={merge(defaults.button, buttonClassName)}
        onPress={toggleModal}
        activeOpacity={0.7}
        ref={dropdownRef}
      >
        <Text
          className={
            !hasSelection || forcePlaceholder
              ? merge(defaults.placeholderText, placeholderClassName)
              : merge(defaults.buttonText, buttonTextClassName)
          }
        >
          {selectedLabel}
        </Text>
        {iconComponent || (
          <Animated.View
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: [
                { translateY: -10 }, // center vertically (chevron is ~20px tall)
                { rotate: rotateInterpolate },
              ],
            }}
          >
            <Ionicons name="chevron-down" size={20} color="#555" />
          </Animated.View>
        )}
      </TouchableOpacity>

      {modalVisible && (
        <Modal
          transparent
          visible={modalVisible}
          onRequestClose={toggleModal}
          className="w-20"
        >
          <View style={{ flex: 1 }}>
            {/* Backdrop */}
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={toggleModal}
            />

            {/* Dropdown with animation */}
            <Animated.View
              style={{
                position: "absolute",
                top: dropdownPosition.y + dropdownPosition.height, // ✅ directly below button
                left: dropdownPosition.x,
                // ✅ only apply button width if dropdownClassName does NOT specify a width
                ...(dropdownClassName?.match(/\bw-\d+/)
                  ? {}
                  : { width: dropdownPosition.width }),
                maxHeight: 200,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className={merge(defaults.dropdown, dropdownClassName)}
            >
              {searchable && (
                <TextInput
                  className={merge(defaults.searchInput, searchInputClassName)}
                  value={searchTerm}
                  onChangeText={handleSearchChange}
                  placeholder="Search..."
                  placeholderTextColor="#6B7280"
                />
              )}
              <FlatList
                data={filteredOptions}
                keyExtractor={(item, index) => `${item.value}-${index}`}
                renderItem={({ item }) => {
                  const isSelected = isOptionSelected(item.value);
                  return (
                    <Pressable
                      className={`${merge(
                        defaults.optionItem,
                        optionItemClassName
                      )} ${
                        isSelected
                          ? merge(
                              "",
                              selectedOptionClassName || defaults.selectedOption
                            )
                          : ""
                      }`}
                      onPress={() => handleSelect(item)}
                    >
                      <View className="flex-row items-center flex-1">
                        <Text
                          className={merge(
                            defaults.optionText,
                            optionTextClassName
                          )}
                        >
                          {item.label}
                        </Text>
                        {showCounts && item.count !== undefined && (
                          <Text
                            className={merge(defaults.count, countClassName)}
                          >
                            ({item.count})
                          </Text>
                        )}
                      </View>
                      {multiSelect && isSelected && (
                        <Ionicons name="checkmark" size={18} color="#059669" />
                      )}
                    </Pressable>
                  );
                }}
                keyboardShouldPersistTaps="handled"
                scrollEnabled
                nestedScrollEnabled
                className="w-full"
              />
            </Animated.View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default DropdownTailwind;

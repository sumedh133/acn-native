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
  forcePlaceholder?: boolean; // NEW
  placeholderClassName?: string;
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
  iconComponent?: React.ReactNode;
  loading?: boolean;
}

const DropdownTailwind = ({
  value,
  setValue,
  title,
  options,
  placeholder = "Select",
  required = false,
  searchable = false,
  forcePlaceholder = false,
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
    container: "items-center justify-center gap-1.5 relative w-full",
    title: "font-semibold text-sm",
    button:
      "w-full h-10 rounded-lg border border-[#B5B3B3] bg-white px-3 flex-row items-center justify-between relative",
    placeholderText: "text-sm text-gray-400 pr-2",
    buttonText: "text-sm",
    dropdown:
      "absolute bg-white rounded-lg border border-gray-200 shadow-md z-50 p-1 mt-0.5",
    searchInput: "w-full p-2.5 border-b border-gray-200 bg-white text-sm",
    optionItem: "w-full px-4 py-1.5 my-0.5 rounded-md",
    optionText: "font-semibold text-sm leading-5 text-gray-900",
    selectedOption: "bg-teal-50",
  };

  const merge = (def: string, custom?: string) =>
    custom ? `${def} ${custom}` : def;

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

  const filteredOptions = searchTerm
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedLabel = forcePlaceholder
    ? placeholder
    : value
    ? options.find((option) => option.value === value)?.label || value
    : placeholder;

  return (
    <View className={merge(defaults.container, containerClassName)}>
      {title && (
        <View className="flex-row gap-1.5 self-start">
          <Text className={merge(defaults.title, titleClassName)}>{title}</Text>
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
            !value || forcePlaceholder
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
        <Modal transparent visible={modalVisible} onRequestClose={toggleModal} className="w-20">
          <View style={{ flex: 1 }}>
            {/* Backdrop */}
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={toggleModal}
            />

            {/* Dropdown with animation */}
            <Animated.View
              className={merge(defaults.dropdown, dropdownClassName)}
              style={{
                position: "absolute",
                top: dropdownPosition.y + dropdownPosition.height - 22,
                left: dropdownPosition.x,
                maxHeight: 200,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
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
                renderItem={({ item }) => (
                  <Pressable
                    className={`${merge(
                      defaults.optionItem,
                      optionItemClassName
                    )} ${
                      value === item.value
                        ? merge(
                            "",
                            selectedOptionClassName || defaults.selectedOption
                          )
                        : ""
                    }`}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      className={merge(
                        defaults.optionText,
                        optionTextClassName
                      )}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                )}
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

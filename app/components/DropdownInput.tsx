import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownWithInputProps {
  options: DropdownOption[];
  placeholder?: string;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
  style?: string;
}

const DropdownWithInput: React.FC<DropdownWithInputProps> = ({
  options,
  placeholder = "Select a field",
  onChange,
  disabled = false,
  style,
}) => {
  const [selectedField, setSelectedField] = useState(options[0]?.value || "");
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });
  const triggerRef = useRef<View>(null);
  const userType = useSelector((state: RootState) => state.agent?.docData?.userType) || "free";

  useEffect(() => {
    if (selectedField) {
      onChange(selectedField, inputValue);
    }
  }, [selectedField, inputValue]);

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
         top: pageY + 20,
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

      setSelectedField(value);
      setIsOpen(false);
    },
    [options, placeholder, userType],
  );

  const renderItems = useMemo(() => {
    return options.map((item, index) => (
      <TouchableOpacity
        key={index}
        className={`py-2 px-3 border-b border-gray-100 bg-white ${
          selectedField === item.value ? 'bg-gray-50' : ''
        }`}
        onPress={() => handleSelectItem(item.value)}
      >
        <View className="flex-row items-center">
          <View
            className={`w-4 h-4 border rounded items-center justify-center mr-2 ${
              selectedField === item.value 
                ? 'bg-[#153E3B] border-[#153E3B]' 
                : 'border-gray-300'
            }`}
          >
            {selectedField === item.value && (
              <MaterialIcons name="check" size={12} color="#FFFFFF" />
            )}
          </View>
          <Text
            className={`text-sm ${
              selectedField === item.value 
                ? 'text-[#153E3B] font-medium' 
                : 'text-gray-800'
            }`}
          >
            {item.label}
          </Text>
        </View>
      </TouchableOpacity>
    ));
  }, [options, selectedField, handleSelectItem]);

  const selectedLabel = options.find((opt) => opt.value === selectedField)?.label || placeholder;

  return (
    <View className={`relative z-10 ${style || ''}`}>
      <View
        ref={triggerRef}
        className={`flex-row bg-white border-[1.5px] rounded-lg overflow-hidden ${
          isOpen 
            ? 'border-[#153E3B]' 
            : disabled 
              ? 'border-gray-200 bg-stone-50' 
              : 'border-gray-200'
        }`}
      >
        {/* Input Section */}
        <TextInput
          className={`flex-[2] px-3 py-2.5 text-sm text-gray-800 ${
            disabled ? 'bg-stone-50 text-gray-500' : 'bg-white'
          }`}
          placeholder={`Enter ${selectedField}`}
          value={inputValue}
          onChangeText={setInputValue}
          editable={!disabled}
          placeholderTextColor="#9CA3AF"
        />

        {/* Vertical Divider */}
        <View className="w-px bg-gray-200 self-stretch" />

        {/* Dropdown Section */}
        <TouchableOpacity
          onPress={handleToggle}
          className={`flex-1 flex-row justify-between items-center px-3 py-2.5 ${
            isOpen 
              ? 'bg-[#153E3B]' 
              : disabled 
                ? 'bg-stone-50' 
                : 'bg-white'
          }`}
        >
          <Text
            className={`text-sm mr-1 flex-1 ${
              isOpen 
                ? 'text-white' 
                : disabled 
                  ? 'text-gray-500' 
                  : 'text-gray-800'
            }`}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {selectedLabel}
          </Text>
          <MaterialIcons
            name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={20}
            color={disabled ? "#A0A0A0" : isOpen ? "#FFFFFF" : "#666666"}
          />
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={isOpen}
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View className="flex-1 bg-transparent">
            <View
              className="absolute bg-white top-0 rounded-md border border-slate-200 shadow-lg elevation-5"
              style={{
                width: dimensions.width * 0.4, // Make dropdown narrower, only for field selection
                top: dimensions.top,
                left: dimensions.left + (dimensions.width * 0.6), // Position under dropdown section
              }}
            >
              <ScrollView
                className="max-h-48"
                contentContainerStyle={{ paddingVertical: 4 }}
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

export default React.memo(DropdownWithInput);
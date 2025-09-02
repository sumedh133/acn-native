import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import DropDownArrow from "@/assets/icons/svg/AddInventory/DropdownIcon";

export interface DropdownOption<T = string | number> {
  value: T;
  label: string;
}

interface DropdownProps<T = string | number> {
  options: DropdownOption<T>[];
  placeholder?: string;
  selectedValue?: DropdownOption<T> | null;
  onSelect?: (option: DropdownOption<T>) => void;
  maxHeight?: number;
  disabled?: boolean;
  containerClassName?: string;
  dropdownClassName?: string;
  textClassName?: string;
  optionClassName?: string;
  selectedOptionClassName?: string;
  optionsContainerClassName?: string;
}

const Dropdown = <T = string | number,>({
  options = [],
  placeholder = "Select an option",
  selectedValue = null,
  onSelect,
  maxHeight = 200,
  disabled = false,
  containerClassName = "",
  dropdownClassName = "",
  textClassName = "",
  optionClassName = "",
  selectedOptionClassName = "",
  optionsContainerClassName = "",
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<DropdownOption<T> | null>(
    selectedValue
  );

  // Update internal state when selectedValue prop changes
  useEffect(() => {
    setSelected(selectedValue);
  }, [selectedValue]);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option: DropdownOption<T>) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <View className={`relative flex-1 ${containerClassName}`}>
      {/* Dropdown Trigger */}
      <Pressable
        className={`
          h-[33px] py-2 px-[10px] rounded-md 
          flex flex-row items-center justify-between outline-none
          ${disabled ? "bg-gray-100 opacity-60" : "bg-white active:bg-gray-50"}
          ${dropdownClassName}
        `}
        onPress={toggleDropdown}
        disabled={disabled}
      >
        <Text
          className={`
            flex-1 text-sm
            ${selected ? "text-black" : "text-gray-500"}
            ${disabled ? "text-gray-400" : ""}
            ${textClassName}
          `}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <DropDownArrow pointerDown={isOpen} />
      </Pressable>

      {/* Dropdown Options */}
      {isOpen && (
        <View
          className={`
            absolute top-[37px] left-0 right-0 
            bg-white border border-[#D3D4DD] rounded-md 
            shadow-lg z-50
            ${optionsContainerClassName}
          `}
        >
          <ScrollView
            style={{ maxHeight: maxHeight }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            className="max-h-48"
          >
            {options.map((option, index) => (
              <Pressable
                key={`${String(option.value)}-${index}`}
                className={`
                  py-3 px-[10px] active:bg-gray-50
                  ${
                    selected?.value === option.value
                      ? "bg-[#EAFFFD]"
                      : "bg-white"
                  }
                  ${
                    index !== options.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }
                  ${index === 0 ? "rounded-t-md" : ""}
                  ${index === options.length - 1 ? "rounded-b-md" : ""}
                  ${optionClassName}
                  ${
                    selected?.value === option.value
                      ? selectedOptionClassName
                      : ""
                  }
                `}
                onPress={() => handleSelect(option)}
              >
                <Text className="text-sm text-[10302D] font-medium">
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <Pressable
          className="absolute -inset-[1000px] -z-10"
          onPress={handleClose}
        />
      )}
    </View>
  );
};

export default Dropdown;

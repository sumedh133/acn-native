import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Option {
  label: string;
  value: string;
}

interface MultiCheckboxProps {
  options: Option[];
  selectedOptions: string[]; // Array of selected values
  setSelectedOptions: (selected: string[]) => void;
  title?: string;
  required?: boolean;
}

const MultiCheckbox = ({
  options,
  selectedOptions,
  setSelectedOptions,
  title,
  required = false,
}: MultiCheckboxProps) => {
  const toggleOption = (value: string) => {
    if (selectedOptions.includes(value)) {
      setSelectedOptions(selectedOptions.filter((v) => v !== value));
    } else {
      setSelectedOptions([...selectedOptions, value]);
    }
  };

  return (
    <View className="flex-col gap-2">
      {title && (
        <View className="flex-row items-center gap-1 mb-1">
          <Text className="text-base font-semibold">{title}</Text>
          {required && <Text className="text-red-600 text-base">*</Text>}
        </View>
      )}

      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isChecked = selectedOptions.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              className="flex-row items-center gap-1 rounded-sm"
              onPress={() => toggleOption(option.value)}
            >
              <View
                className={`w-5 h-5 rounded-sm border border-black items-center justify-center ${
                  isChecked ? "bg-[#133836] border-[#133836]" : "bg-white"
                }`}
              >
                {isChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text className="text-base">{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default MultiCheckbox;

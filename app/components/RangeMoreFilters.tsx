import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, Dimensions } from 'react-native';

interface RangeMoreFiltersProps {
  title: string;
  // attribute: string;
  transformFunction?: (value: number) => string | number;
  refine: (range: [number, number]) => void;
  // currentRefinement?: [number | undefined, number | undefined];
  range: { min?: number; max?: number }; // Add range prop
  start: (number | undefined)[]; // Add start prop
}

const RangeMoreFilters: React.FC<RangeMoreFiltersProps> = ({
  title,
  // attribute,
  transformFunction,
  refine,
  range,
  start,
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(Dimensions.get('window').width <= 640);

  const formatValue = (value: string | number | undefined): string => {
    if (value === undefined || value === '') return '';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return transformFunction && typeof numValue === 'number'
      ? transformFunction(numValue).toString()
      : String(value);
  };

  const [minValue, setMinValue] = useState<string>(
    start && start[0] !== undefined && start[0] !== -Infinity
      ? start[0].toString()
      : ""
  );
  const [maxValue, setMaxValue] = useState<string>(
    start && start[1] !== undefined && start[1] !== Infinity
      ? start[1].toString()
      : ""
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsMobile(window.width <= 640);
    });

    return () => subscription.remove();
  }, []);

  const validateRange = (): boolean => {
    // Clear previous error
    setErrorMessage("");

    const minNum = minValue ? Number(minValue) : undefined;
    const maxNum = maxValue ? Number(maxValue) : undefined;

    // Check if min is less than range.min
    if (minNum !== undefined && range.min !== undefined && minNum < range.min) {
      setErrorMessage(`Minimum value cannot be less than ${formatValue(range.min)}`);
      return false;
    }

    // Check if max is greater than range.max
    if (maxNum !== undefined && range.max !== undefined && maxNum > range.max) {
      setErrorMessage(`Maximum value cannot be greater than ${formatValue(range.max)}`);
      return false;
    }

    // Check if min is greater than max
    if (minNum !== undefined && maxNum !== undefined && minNum > maxNum) {
      setErrorMessage("Minimum value cannot be greater than maximum value");
      return false;
    }

    return true;
  };

  const handleApply = (): void => {
    if (!validateRange()) {
      return;
    }

    const min: number = minValue ? Number(minValue) : (range.min ?? 0);
    const max: number = maxValue ? Number(maxValue) : (range.max ?? 0);

    refine([min, max]);
  };

  const handleMinChange = (value: string) => {
    setMinValue(value);
    // Clear error when user starts typing again
    if (errorMessage) setErrorMessage("");
  };

  const handleMaxChange = (value: string) => {
    setMaxValue(value);
    // Clear error when user starts typing again
    if (errorMessage) setErrorMessage("");
  };

  return (
    <View className="p-4 border border-gray-200 rounded-xl w-full mb-4">
      <Text className="font-semibold text-sm text-gray-700 mb-4" style={{ fontFamily: 'Montserrat_600SemiBold' }}>{title}</Text>
      <View className="flex-row items-center">
        <View className="flex-row items-center flex-1 justify-between">
          <TextInput
            className={`h-10 w-[45%] border ${errorMessage ? 'border-red-500' : 'border-gray-300'} rounded-md px-3`}
            placeholder={formatValue(range.min) || 'Min'}
            value={minValue}
            onChangeText={handleMinChange}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF" 
            style={{ color: '#1F2937' }} 
          />
          <Text className="text-black">to</Text>
          <TextInput
            className={`h-10 w-[45%] border ${errorMessage ? 'border-red-500' : 'border-gray-300'} rounded-md px-3  `}
            placeholder={formatValue(range.max) || 'Max'}
            value={maxValue}
            onChangeText={handleMaxChange}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF" 
            style={{ color: '#1F2937' }} 
          />
        </View>
        <TouchableOpacity
          className="bg-[#153E3B] py-3 px-4 rounded-md items-center ml-3"
          onPress={handleApply}
        >
          <Text className="text-white font-medium">Apply</Text>
        </TouchableOpacity>
      </View>
      {errorMessage ? (
        <Text className="text-red-500 mt-2 text-sm">{errorMessage}</Text>
      ) : null}
    </View>
  );
};

export default RangeMoreFilters;
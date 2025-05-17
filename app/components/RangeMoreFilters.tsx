import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

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
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";
  const [isMobile, setIsMobile] = useState<boolean>(
    Dimensions.get("window").width <= 640,
  );

  const formatValue = (value: string | number | undefined): string => {
    if (value === undefined || value === "") return "";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return transformFunction && typeof numValue === "number"
      ? transformFunction(numValue).toString()
      : String(value);
  };

  const [minValue, setMinValue] = useState<string>(
    start && start[0] !== undefined && start[0] !== -Infinity
      ? start[0].toString()
      : "",
  );
  const [maxValue, setMaxValue] = useState<string>(
    start && start[1] !== undefined && start[1] !== Infinity
      ? start[1].toString()
      : "",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
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
      const errorMsg = `Minimum value cannot be less than ${formatValue(range.min)}`;
      setErrorMessage(errorMsg);
      try {
        logEvent(analytics, 'range_filter_error', {
          event_category: 'filters',
          event_label: 'validation',
          filter_title: title,
          error_type: 'min_below_range',
          min_value: minNum,
          range_min: range.min,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging range validation:', error);
      }
      return false;
    }

    // Check if max is greater than range.max
    if (maxNum !== undefined && range.max !== undefined && maxNum > range.max) {
      const errorMsg = `Maximum value cannot be greater than ${formatValue(range.max)}`;
      setErrorMessage(errorMsg);
      try {
        logEvent(analytics, 'range_filter_error', {
          event_category: 'filters',
          event_label: 'validation',
          filter_title: title,
          error_type: 'max_above_range',
          max_value: maxNum,
          range_max: range.max,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging range validation:', error);
      }
      return false;
    }

    // Check if min is greater than max
    if (minNum !== undefined && maxNum !== undefined && minNum > maxNum) {
      const errorMsg = "Minimum value cannot be greater than maximum value";
      setErrorMessage(errorMsg);
      try {
        logEvent(analytics, 'range_filter_error', {
          event_category: 'filters',
          event_label: 'validation',
          filter_title: title,
          error_type: 'min_greater_than_max',
          min_value: minNum,
          max_value: maxNum,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging range validation:', error);
      }
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

    try {
      logEvent(analytics, 'apply_range_filter', {
        event_category: 'filters',
        event_label: 'range',
        filter_title: title,
        min_value: min,
        max_value: max,
        is_default_min: !minValue,
        is_default_max: !maxValue,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging range filter apply:', error);
    }

    refine([min, max]);
  };

  const handleMinChange = (value: string) => {
    try {
      logEvent(analytics, 'range_filter_input', {
        event_category: 'filters',
        event_label: 'input',
        filter_title: title,
        input_type: 'min',
        value: value,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging min value change:', error);
    }
    setMinValue(value);
    // Clear error when user starts typing again
    if (errorMessage) setErrorMessage("");
  };

  const handleMaxChange = (value: string) => {
    try {
      logEvent(analytics, 'range_filter_input', {
        event_category: 'filters',
        event_label: 'input',
        filter_title: title,
        input_type: 'max',
        value: value,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging max value change:', error);
    }
    setMaxValue(value);
    // Clear error when user starts typing again
    if (errorMessage) setErrorMessage("");
  };

  return (
    <View className="p-4 border border-gray-200 rounded-xl w-full mb-4">
      <Text
        className="font-semibold text-sm text-gray-700 mb-4"
        style={{ fontFamily: "Montserrat_600SemiBold" }}
      >
        {title}
      </Text>
      <View className="flex-row items-center">
        <View className="flex-row items-center flex-1 justify-between">
          <TextInput
            className={`h-10 w-[45%] border ${errorMessage ? "border-red-500" : "border-gray-300"} rounded-md px-3`}
            placeholder={formatValue(range.min) || "Min"}
            value={minValue}
            onChangeText={handleMinChange}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
            style={{ color: "#1F2937" }}
          />
          <Text className="text-black">to</Text>
          <TextInput
            className={`h-10 w-[45%] border ${errorMessage ? "border-red-500" : "border-gray-300"} rounded-md px-3  `}
            placeholder={formatValue(range.max) || "Max"}
            value={maxValue}
            onChangeText={handleMaxChange}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
            style={{ color: "#1F2937" }}
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

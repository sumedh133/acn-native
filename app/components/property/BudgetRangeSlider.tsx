import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useRange } from "react-instantsearch";

// Local formatCurrency function with crore formatting
const formatCurrency = (value: number, currency: string = "INR"): string => {
  // Handle invalid values
  if (value === undefined || value === null || !isFinite(value)) {
    return "₹0";
  }

  // Format in crores for readability when value is high
  if (value >= 10000000) {
    const crores = value / 10000000;
    return `₹${crores.toFixed(1)} Cr`;
  }

  // Format in lakhs for mid-range values
  if (value >= 100000) {
    const lakhs = value / 100000;
    return `₹${lakhs.toFixed(1)} L`;
  }

  // Use standard formatting for smaller values
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

interface BudgetRangeSliderProps {
  attribute: string;
  onApply: () => void;
}

const BudgetRangeSlider: React.FC<BudgetRangeSliderProps> = ({
  attribute,
  onApply,
}) => {
  const { start, range, refine } = useRange({ attribute });
  const MAX_VALUE = 500000000; // 50 crore
  const [values, setValues] = useState([0, MAX_VALUE]); // 0 to 50 crore
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Initialize with valid values
  useEffect(() => {
    // Always start with default range (no filters applied)
    setValues([0, MAX_VALUE]);
  }, []);

  const handleValuesChange = useCallback((newValues: number[]) => {
    // Validate values before setting
    if (
      newValues &&
      newValues.length === 2 &&
      isFinite(newValues[0]) &&
      isFinite(newValues[1])
    ) {
      setValues(newValues);
      setHasUserInteracted(true);
    }
  }, []);

  const handleApply = useCallback(() => {
    // Only apply refinement if user has interacted with the slider
    if (hasUserInteracted) {
      // Ensure values are valid before refining
      const validMin = isFinite(values[0]) ? values[0] : 0;
      const validMax = isFinite(values[1]) ? values[1] : MAX_VALUE;

      refine([validMin, validMax]);
    }
    onApply();
  }, [values, refine, onApply, hasUserInteracted]);

  // Custom marker component
  const CustomMarker = () => (
    <View className="h-5 w-5 rounded-full bg-[#153e3b] shadow-sm shadow-black" />
  );

  return (
    <View className="px-4 pt-2 pb-4">
      <View className="flex-row justify-between mb-2">
        <Text className="font-semibold text-sm text-gray-700">
          {formatCurrency(values[0])}
        </Text>
        <Text className="font-semibold text-sm text-gray-700">
          {formatCurrency(values[1])}
        </Text>
      </View>

      <View className="py-4 items-center">
        <MultiSlider
          values={values}
          sliderLength={280}
          min={0}
          max={MAX_VALUE} // 50 crore
          step={500000} // 5 lakh steps (smaller than before)
          allowOverlap={false}
          snapped
          onValuesChange={handleValuesChange}
          selectedStyle={{ backgroundColor: "#153e3b" }}
          unselectedStyle={{ backgroundColor: "#E5E7EB" }}
          trackStyle={{ height: 6, borderRadius: 3 }}
          customMarker={CustomMarker}
          containerStyle={{ height: 40 }}
        />
      </View>

      <TouchableOpacity
        className="bg-[#153e3b] py-2 px-4 rounded-lg items-center mt-2"
        onPress={handleApply}
      >
        <Text className="font-semibold text-sm text-white">Apply Range</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BudgetRangeSlider;

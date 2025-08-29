import React, { useState, useEffect, useMemo } from "react";
import { View, Text } from "react-native";
import RangeSlider from "crn-range-slider";
import DropdownTailwind, { DropdownOption } from "../../../components/DropdownTailwind";
import type { SearchFilters } from "@/app/services/property_services/propertyAlgoliaService";

export interface BudgetRangeFilterProps {
  attribute: string;
  localFilters: SearchFilters;
  onChangeRange: (attribute: string, range: string[]) => void;
  title?: string;
  containerClassName?: string;
  titleClassName?: string;
  type?: 'rental' | 'resale'; // New prop to determine which range to use
}

// Rental range: 5k to 10 lakh
const RENTAL_OPTIONS = [5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000, 150000, 200000, 300000, 500000, 750000, 1000000];

// Resale range: 1 lakh to 100Cr+
const RESALE_OPTIONS = [100000, 200000, 500000, 1000000, 2000000];

const formatBudget = (value: number): string => {
  if (value >= 10000000) { // 1 Crore or more
    const crores = value / 10000000;
    return `₹${crores}${crores === 1 ? ' Cr' : ' Cr'}`;
  } else if (value >= 100000) { // 1 Lakh or more
    const lakhs = value / 100000;
    return `₹${lakhs}${lakhs === 1 ? ' L' : ' L'}`;
  } else {
    return `₹${(value / 1000)}K`;
  }
};

const BudgetRangeFilter: React.FC<BudgetRangeFilterProps> = ({
  attribute,
  localFilters,
  onChangeRange,
  title = "Budget",
  containerClassName = "",
  titleClassName = "",
  type = 'rental', // Default to rental
}) => {
  // Choose options based on type
  const budgetOptions = type === 'rental' ? RENTAL_OPTIONS : RESALE_OPTIONS;
  
  const budgetDropdownOptions: DropdownOption[] = useMemo(() => 
    budgetOptions.map((val) => ({
      label: formatBudget(val),
      value: val.toString(),
    })), [budgetOptions]
  );

  const initialPair = useMemo<[string, string]>(() => {
    const raw = (localFilters?.[attribute as keyof SearchFilters] as
      | string[]
      | undefined) ?? ["", ""];
    return [raw?.[0] || "", raw?.[1] || ""];
  }, [attribute, localFilters]);

  const [min, setMin] = useState<number>(initialPair[0] ? Number(initialPair[0]) : 20000);
const [max, setMax] = useState<number>(initialPair[1] ? Number(initialPair[1]) : 200000);



  const [isDragging, setIsDragging] = useState(false);

  // Update parent whenever values change (but not during dragging)
  // useEffect(() => {
  //   if (!isDragging) {
  //     onChangeRange(attribute, [min.toString(), max.toString()]);
  //   }
  // }, [min, max, attribute]);

  // Snap to nearest valid option
 const snapToNearest = (val: number) => {
  return budgetOptions.reduce((prev, curr) =>
    Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
  );
};

  // Handle slider changes
  const handleSliderChange = (low: number, high: number) => {
    console.log('Slider moving:', low, high); // Debug log
    setIsDragging(true);
    // Don't bound the values, let slider move freely
    setMin(low);
    setMax(high);
  };

  // Handle slider end (snap to nearest)
  const handleSliderEnd = () => {
    const snappedMin = snapToNearest(min);
    const snappedMax = snapToNearest(max);
    setMin(snappedMin);
    setMax(snappedMax);
    setIsDragging(false); // Allow useEffect to run
  };

  // Handle dropdown changes with validation
  const handleMinDropdownChange = (val: string) => {
    if (!val) return;
    const numVal = Number(val);
    if (numVal <= max) {
      setMin(numVal); // State expects number
    }
  };

  const handleMaxDropdownChange = (val: string) => {
    if (!val) return;
    const numVal = Number(val);
    if (numVal >= min) {
      setMax(numVal); // State expects number
    }
  };

  return (
    <View className={`w-full mb-5 ${containerClassName}`}>
      <Text
        style={{ fontFamily: "Montserrat_600SemiBold" }}
        className={`text-base text-gray-800 mb-2 ${titleClassName}`}
      >
        {title} ({type === 'rental' ? 'Rental' : 'Sale'})
      </Text>

      {/* Slider */}
      <View className="mb-4">
        <View className="mb-4">
  <RangeSlider
    min={budgetOptions[0]}
    max={budgetOptions[budgetOptions.length - 1]}
    step={5000} // not 1, keeps it smooth
    low={min}
    high={max}
    renderThumb={() => (
      <View
        style={{
          height: 20,
          width: 20,
          borderRadius: 10,
          backgroundColor: "white",
          borderWidth: 2,
          borderColor: "#0f766e",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.3,
          shadowRadius: 2,
          elevation: 3,
        }}
      />
    )}
    renderRail={() => (
      <View style={{ flex: 1, height: 4, backgroundColor: "#e5e7eb", borderRadius: 2 }} />
    )}
    renderRailSelected={() => (
      <View style={{ flex: 1, height: 4, backgroundColor: "#0f766e", borderRadius: 2 }} />
    )}
    onValueChanged={(low, high, fromUser) => {
      if (fromUser) {
        setMin(low);
        setMax(high);
      } else {
        // snap to nearest when drag ends
        setMin(snapToNearest(low));
        setMax(snapToNearest(high));
      }
    }}
  />
</View>



      </View>

      {/* Dropdowns */}
      <View className="flex-row justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xs text-gray-600 mb-1">Minimum</Text>
          <DropdownTailwind
            options={budgetDropdownOptions.filter(opt => Number(opt.value) <= max)}
            value={String(min)}
            setValue={(val) => handleMinDropdownChange(val!)}
            placeholder="Min"
          />
        </View>
        <View className="flex-1">
          <Text className="text-xs text-gray-600 mb-1">Maximum</Text>
          <DropdownTailwind
            options={budgetDropdownOptions.filter(opt => Number(opt.value) >= min)}
            value={String(max)}
            setValue={(val) => handleMaxDropdownChange(val!)}
            placeholder="Max"
          />
        </View>
      </View>

      {/* Display current range */}
      <View className="mt-3 p-2 bg-gray-50 rounded-lg">
        <Text className="text-sm text-gray-700 text-center">
          {formatBudget(min)} – {formatBudget(max)}
        </Text>
      </View>
    </View>
  );
};

export default BudgetRangeFilter;
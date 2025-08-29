import React, { useState, useEffect, useMemo } from "react";
import { View, Text } from "react-native";
import RangeSlider from "rn-range-slider";
import DropdownTailwind, {
  DropdownOption,
} from "../../../components/DropdownTailwind";
import type { SearchFilters } from "@/app/services/property_services/propertyAlgoliaService";

export interface BudgetRangeFilterProps {
  attribute: string;
  localFilters: SearchFilters;
  onChangeRange: (attribute: string, range: string[]) => void;
  title?: string;
  containerClassName?: string;
  titleClassName?: string;
  type?: "rental" | "resale"; // New prop to determine which range to use
}

// Rental range: 5k to 10 lakh
const RENTAL_OPTIONS = [
  5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000, 150000,
  200000, 300000, 500000, 750000, 1000000,
];

// Resale range: 1 lakh to 100Cr+
const RESALE_OPTIONS = [
  // Up to 50L → 5L steps
  100000, 500000, 1000000, 1500000, 2000000, 2500000, 3000000, 3500000, 4000000,
  4500000, 5000000,

  // 50L – 1Cr → 10L steps
  6000000, 7000000, 8000000, 9000000, 10000000,

  // 1Cr – 5Cr → 25L steps
  12500000, 15000000, 17500000, 20000000, 22500000, 25000000, 30000000,
  35000000, 40000000, 45000000, 50000000,

  // 5Cr – 25Cr → 50L steps
  55000000, 60000000, 65000000, 70000000, 75000000, 80000000, 90000000,
  100000000, 120000000, 150000000, 200000000, 250000000,

  // 25Cr – 50Cr → 1Cr steps
  260000000, 270000000, 280000000, 300000000, 350000000, 400000000, 450000000,
  500000000,

  // 50Cr – 100Cr → 5Cr steps
  550000000, 600000000, 700000000, 800000000, 900000000, 1000000000,
];

const formatBudget = (value: number): string => {
  if (value >= 10000000) {
    // 1 Crore or more
    const crores = value / 10000000;
    return `₹${crores}${crores === 1 ? " Cr" : " Cr"}`;
  } else if (value >= 100000) {
    // 1 Lakh or more
    const lakhs = value / 100000;
    return `₹${lakhs}${lakhs === 1 ? " L" : " L"}`;
  } else {
    return `₹${value / 1000}K`;
  }
};

const BudgetRangeFilter: React.FC<BudgetRangeFilterProps> = ({
  attribute,
  localFilters,
  onChangeRange,
  title = "Budget",
  containerClassName = "",
  titleClassName = "",
  type = "rental", // Default to rental
}) => {
  // Choose options based on type
  const budgetOptions = type === "rental" ? RENTAL_OPTIONS : RESALE_OPTIONS;

  const budgetDropdownOptions: DropdownOption[] = useMemo(
    () =>
      budgetOptions.map((val) => ({
        label: formatBudget(val),
        value: val.toString(),
      })),
    [budgetOptions]
  );

  const initialPair = useMemo<[string, string]>(() => {
    const raw = (localFilters?.[attribute as keyof SearchFilters] as
      | string[]
      | undefined) ?? ["", ""];
    return [raw?.[0] || "", raw?.[1] || ""];
  }, [attribute, localFilters]);

  const [min, setMin] = useState<number>(
    Number(initialPair[0]) || budgetOptions[0]
  );
  const [max, setMax] = useState<number>(
    Number(initialPair[1]) || budgetOptions[budgetOptions.length - 1]
  );

  const [isDragging, setIsDragging] = useState(false);
  const [sliderMin, setSliderMin] = useState<number>(min);
  const [sliderMax, setSliderMax] = useState<number>(max);

  useEffect(() => {
    if (!isDragging) {
      setSliderMin(min);
      setSliderMax(max);
    }
  }, [min, max, isDragging]);

  // Update parent whenever values change (but not during dragging)
  useEffect(() => {
    if (!isDragging) {
      // Apply changes only after drag ends
      onChangeRange(attribute, [min.toString(), max.toString()]);
    }
  }, [min, max, isDragging, attribute]);

  // Snap to nearest valid option
  const snapToNearest = (val: number) => {
    return budgetOptions.reduce((prev, curr) =>
      Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
    );
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
        {title} ({type === "rental" ? "Rental" : "Sale"})
      </Text>

      {/* Dropdowns */}
      <View className="flex-row justify-between gap-3 mb-6">
        <View className="flex-1">
          <Text className="text-xs text-gray-600 mb-1">Minimum</Text>
          <DropdownTailwind
            options={budgetDropdownOptions.filter(
              (opt) => Number(opt.value) <= max
            )}
            value={String(min)}
            setValue={(val) => handleMinDropdownChange(val!)}
            placeholder="Min"
          />
        </View>
        <View className="flex-1">
          <Text className="text-xs text-gray-600 mb-1">Maximum</Text>
          <DropdownTailwind
            options={budgetDropdownOptions.filter(
              (opt) => Number(opt.value) >= min
            )}
            value={String(max)}
            setValue={(val) => handleMaxDropdownChange(val!)}
            placeholder="Max"
          />
        </View>
      </View>

      {/* Slider */}
      <View className="mb-4">
        <RangeSlider
          min={budgetOptions[0]}
          max={budgetOptions[budgetOptions.length - 1]}
          step={1}
          low={sliderMin} // Changed from min
          high={sliderMax}
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
            <View
              style={{
                flex: 1,
                height: 4,
                backgroundColor: "#e5e7eb",
                borderRadius: 2,
              }}
            />
          )}
          renderRailSelected={() => (
            <View
              style={{
                flex: 1,
                height: 4,
                backgroundColor: "#0f766e",
                borderRadius: 2,
              }}
            />
          )}
          onValueChanged={(low, high, fromUser) => {
            if (fromUser) {
              // Dragging → update slider state only
              setIsDragging(true);
              setSliderMin(low); // Changed from setMin
              setSliderMax(high); // Changed from setMax
            }
          }}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => {
            // Drag ended → snap and apply to main state
            const snappedMin = snapToNearest(sliderMin); // Changed from min
            const snappedMax = snapToNearest(sliderMax); // Changed from max
            setMin(snappedMin);
            setMax(snappedMax);
            setIsDragging(false); // triggers useEffect to call onChangeRange
          }}
        />
      </View>
    </View>
  );
};

export default BudgetRangeFilter;

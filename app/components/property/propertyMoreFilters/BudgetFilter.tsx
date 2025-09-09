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
  type?: "rental" | "resale";
}

// Rental range: 5k to 10 lakh
const RENTAL_OPTIONS = [
  5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000, 150000,
  200000, 300000, 500000, 750000, 1000000,
];

// Resale range: 1 lakh to 100Cr+
const RESALE_OPTIONS = [
  100000, 500000, 1000000, 1500000, 2000000, 2500000, 3000000, 3500000, 4000000,
  4500000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000, 12500000, 15000000,
  17500000, 20000000, 22500000, 25000000, 30000000, 35000000, 40000000, 45000000,
  50000000, 55000000, 60000000, 65000000, 70000000, 75000000, 80000000, 90000000,
  100000000, 120000000, 150000000, 200000000, 250000000, 260000000, 270000000,
  280000000, 300000000, 350000000, 400000000, 450000000, 500000000, 550000000,
  600000000, 700000000, 800000000, 900000000, 1000000000,
];

// -------------------- Segmented Scale Helpers --------------------
const SLIDER_SCALE = 1000;

type Segment = { min: number; max: number; weight: number };

const buildSegments = (
  options: number[],
  type: "rental" | "resale"
): Segment[] => {
  if (type === "rental") {
    return [
      { min: 5000, max: 50000, weight: 8 },
      { min: 50000, max: 200000, weight: 3 },
      { min: 200000, max: 1000000, weight: 1 },
    ];
  }
  return [
    { min: 100000, max: 5000000, weight: 8 },
    { min: 6000000, max: 10000000, weight: 5 },
    { min: 12500000, max: 50000000, weight: 3 },
    { min: 55000000, max: 1000000000, weight: 1 },
  ];
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const buildScale = (options: number[], segments: Segment[]) => {
  const segInfo = segments.map((seg) => {
    const segOptions = options.filter((v) => v >= seg.min && v <= seg.max);
    const steps = Math.max(1, segOptions.length - 1);
    const weighted = steps * Math.max(0.0001, seg.weight);
    return { ...seg, steps, weighted, options: segOptions };
  });

  const totalWeighted = segInfo.reduce((s, x) => s + x.weighted, 0);
  let acc = 0;
  const cumulative = segInfo.map((x) => {
    const start = acc / totalWeighted;
    acc += x.weighted;
    const end = acc / totalWeighted;
    return { ...x, start, end };
  });

  const valueToPosition = (value: number): number => {
    const v = clamp(value, options[0], options[options.length - 1]);
    const seg =
      cumulative.find((s) => v >= s.min && v <= s.max) ||
      cumulative[cumulative.length - 1];
    const idx = seg.options.findIndex(
      (o) =>
        o ===
        seg.options.reduce((prev, curr) =>
          Math.abs(curr - v) < Math.abs(prev - v) ? curr : prev
        )
    );
    const t = seg.steps === 0 ? 0 : idx / seg.steps;
    const pos = seg.start + t * (seg.end - seg.start);
    return Math.round(pos * SLIDER_SCALE);
  };

  const positionToValue = (pos: number): number => {
    const p = clamp(pos / SLIDER_SCALE, 0, 1);
    const seg =
      cumulative.find((s) => p >= s.start && p <= s.end) ||
      cumulative[cumulative.length - 1];
    const localT =
      seg.end === seg.start ? 0 : (p - seg.start) / (seg.end - seg.start);
    const approxIndex = Math.round(localT * seg.steps);
    const index = clamp(approxIndex, 0, seg.options.length - 1);
    return seg.options[index];
  };

  return { valueToPosition, positionToValue };
};

const formatBudget = (value: number): string => {
  if (value >= 10000000) {
    const crores = value / 10000000;
    return `₹${crores} Cr`;
  } else if (value >= 100000) {
    const lakhs = value / 100000;
    return `₹${lakhs} L`;
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
  type = "rental",
}) => {
  const budgetOptions = type === "rental" ? RENTAL_OPTIONS : RESALE_OPTIONS;

  const { valueToPosition, positionToValue } = useMemo(() => {
    return buildScale(budgetOptions, buildSegments(budgetOptions, type));
  }, [type]);

  const budgetDropdownOptions: DropdownOption[] = useMemo(
    () =>
      budgetOptions.map((val) => ({
        label: formatBudget(val),
        value: val.toString(),
      })),
    [budgetOptions]
  );

  // Initial/default values
  const initialPair = useMemo<[string, string]>(() => {
    const raw = (localFilters?.[attribute as keyof SearchFilters] as
      | string[]
      | undefined) ?? ["", ""];
    return [raw?.[0] || "", raw?.[1] || ""];
  }, [attribute, localFilters]);

  const defaultMin = Number(initialPair[0]) || budgetOptions[0];
  const defaultMax = Number(initialPair[1]) || budgetOptions[budgetOptions.length - 1];

  const [min, setMin] = useState<number>(defaultMin);
  const [max, setMax] = useState<number>(defaultMax);
  const [sliderMin, setSliderMin] = useState<number>(valueToPosition(defaultMin));
  const [sliderMax, setSliderMax] = useState<number>(valueToPosition(defaultMax));
  const [isDragging, setIsDragging] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      setSliderMin(valueToPosition(min));
      setSliderMax(valueToPosition(max));
    }
  }, [min, max, isDragging, valueToPosition]);

  useEffect(() => {
    if (!isDragging && hasChanged) {
      onChangeRange(attribute, [min.toString(), max.toString()]);
    }
  }, [min, max, isDragging, hasChanged, attribute]);

  const snapToNearest = (val: number) => {
    return budgetOptions.reduce((prev, curr) =>
      Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
    );
  };

  const handleMinDropdownChange = (val: string) => {
    if (!val) return;
    const numVal = Number(val);
    if (numVal <= max) {
      setMin(numVal);
      setHasChanged(true);
    }
  };

  const handleMaxDropdownChange = (val: string) => {
    if (!val) return;
    const numVal = Number(val);
    if (numVal >= min) {
      setMax(numVal);
      setHasChanged(true);
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
          min={0}
          max={SLIDER_SCALE}
          step={1}
          low={sliderMin}
          high={sliderMax}
          renderThumb={() => (
            <View
              style={{
                height: 20,
                width: 20,
                borderRadius: 10,
                backgroundColor: "white",
                borderWidth: 2,
                borderColor: "#F2F2F2",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.36,
                shadowRadius: 6,
                elevation: 6,
              }}
            />
          )}
          renderRail={() => (
            <View
              style={{
                flex: 1,
                height: 4,
                flexShrink: 0,
                backgroundColor: "#E1E1E1",
                borderRadius: 2,
              }}
            />
          )}
          renderRailSelected={() => (
            <View
              style={{
                flex: 1,
                height: 4,
                flexShrink: 0,
                backgroundColor: "#153E3B",
                borderRadius: 2,
              }}
            />
          )}
          onValueChanged={(low, high, fromUser) => {
            if (fromUser) {
              setIsDragging(true);
              setSliderMin(low);
              setSliderMax(high);
              const liveMin = snapToNearest(positionToValue(low));
              const liveMax = snapToNearest(positionToValue(high));
              setMin(liveMin);
              setMax(liveMax);
              setHasChanged(true);
              onChangeRange(attribute, [String(liveMin), String(liveMax)]);
            }
          }}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => {
            const snappedMin = snapToNearest(positionToValue(sliderMin));
            const snappedMax = snapToNearest(positionToValue(sliderMax));
            setMin(snappedMin);
            setMax(snappedMax);
            setIsDragging(false);
          }}
        />
      </View>
    </View>
  );
};

export default BudgetRangeFilter;

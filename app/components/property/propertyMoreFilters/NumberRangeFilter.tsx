import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput } from "react-native";
import type { SearchFilters } from "@/app/services/property_services/propertyAlgoliaService";

export interface NumberRangeFilterProps {
  attribute: string; // e.g. "sbua" | "price"
  localFilters: SearchFilters; // expects string[] at this key, like ["1000","5000"] or ["",""]
  onChangeRange: (attribute: string, range: string[]) => void;

  // UI
  title?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  separatorText?: string;

  // Styling (NativeWind / Tailwind)
  containerClassName?: string;
  titleClassName?: string;
  inputsWrapperClassName?: string;
  inputClassName?: string;
  separatorClassName?: string;
  errorClassName?: string;

  // Validation
  allowedMin?: number; // optional lower bound
  allowedMax?: number; // optional upper bound
}

const NumberRangeFilter: React.FC<NumberRangeFilterProps> = ({
  attribute,
  localFilters,
  onChangeRange,

  title,
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
  separatorText = "to",

  containerClassName = "",
  titleClassName = "",
  inputsWrapperClassName = "",
  inputClassName = "",
  separatorClassName = "",
  errorClassName = "",

  allowedMin,
  allowedMax,
}) => {
  // read initial values safely from localFilters
  const initialPair = useMemo<[string, string]>(() => {
    const raw = (localFilters?.[attribute as keyof SearchFilters] as string[] | undefined) ?? ["", ""];
    const a = Array.isArray(raw) ? raw[0] ?? "" : "";
    const b = Array.isArray(raw) ? raw[1] ?? "" : "";
    return [String(a), String(b)];
  }, [attribute, localFilters]);

  const [min, setMin] = useState<string>(initialPair[0]);
  const [max, setMax] = useState<string>(initialPair[1]);
  const [error, setError] = useState<string | null>(null);

  // keep inputs in sync if parent updates localFilters externally
  useEffect(() => {
    if (initialPair[0] !== min) setMin(initialPair[0]);
    if (initialPair[1] !== max) setMax(initialPair[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPair[0], initialPair[1]]);

  const validate = (minStr: string, maxStr: string): string | null => {
    // empty is fine (open range); we still validate bounds if a value exists
    const minNum = minStr !== "" ? Number(minStr) : null;
    const maxNum = maxStr !== "" ? Number(maxStr) : null;

    // numeric-only check (defensive; inputs already filtered)
    if ((minStr !== "" && Number.isNaN(minNum)) || (maxStr !== "" && Number.isNaN(maxNum))) {
      return "Only numbers are allowed.";
    }

    // no negatives
    if ((minNum !== null && minNum < 0) || (maxNum !== null && maxNum < 0)) {
      return "Values cannot be negative.";
    }

    // allowed bounds (only if provided)
    if (allowedMin !== undefined && minNum !== null && minNum < allowedMin) {
      return `Minimum cannot be less than ${allowedMin}.`;
    }
    if (allowedMax !== undefined && maxNum !== null && maxNum > allowedMax) {
      return `Maximum cannot be greater than ${allowedMax}.`;
    }

    // order (only when both present)
    if (minNum !== null && maxNum !== null && maxNum < minNum) {
      return "Maximum must be greater than or equal to minimum.";
    }

    return null;
  };

  // push upstream only when valid; always allow clearing (["",""])
  useEffect(() => {
    const msg = validate(min, max);
    setError(msg);

    if (!msg) {
      // valid → notify parent
      onChangeRange(attribute, [min, max]);
    } else if (min === "" && max === "") {
      // both empty → clear in parent too
      onChangeRange(attribute, ["", ""]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max, attribute]);

  const handleMinChange = (txt: string) => {
    // allow only digits
    const cleaned = txt.replace(/[^0-9]/g, "");
    setMin(cleaned);
  };

  const handleMaxChange = (txt: string) => {
    const cleaned = txt.replace(/[^0-9]/g, "");
    setMax(cleaned);
  };

  const inputBorderClass = error ? "border-red-500" : "border-[#B5B3B3]";

  return (
    <View className={`w-full mb-5 ${containerClassName}`}>
      {title ? (
        <Text
          style={{ fontFamily: "Montserrat_600SemiBold" }}
          className={`text-base text-gray-800 mb-1 ${titleClassName}`}
        >
          {title}
        </Text>
      ) : null}

      <View className={`flex-row items-center space-x-2 ${inputsWrapperClassName}`}>
        <TextInput
          keyboardType="numeric"
          value={min}
          onChangeText={handleMinChange}
          placeholder={minPlaceholder}
          className={`flex-1 border rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white ${inputBorderClass} ${inputClassName}`}
          style={{ fontFamily: "Lato_400Regular" }}
          maxLength={12}
        />
        <Text className={`text-gray-900 text-sm font-medium ${separatorClassName}`} style={{ fontFamily: "Lato_400Regular" }}>{separatorText}</Text>
        <TextInput
          keyboardType="numeric"
          value={max}
          onChangeText={handleMaxChange}
          placeholder={maxPlaceholder}
          className={`flex-1 border rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white ${inputBorderClass} ${inputClassName}`}
          style={{ fontFamily: "Lato_400Regular" }}
          maxLength={12}
        />
      </View>

      {error ? <Text className={`text-red-500 text-xs mt-1 ${errorClassName}`}>{error}</Text> : null}
    </View>
  );
};

export default NumberRangeFilter;

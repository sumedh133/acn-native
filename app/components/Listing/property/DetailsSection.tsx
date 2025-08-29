import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Property } from "@/app/types";
import { getIcon } from "../../../../utils/iconUtils";
import {
  formatUnixDate,
  getDaysDifference,
  getDaysFrom,
  formatPrice,
} from "../../../helpers/format/format";
import { ChevronIcon } from "../../../../assets/icons/svg/PropertyListing/ViewToggle";

type UIProperty = Omit<Property, "handOverDate"> & {
  handOverDate?: string;
};

interface DetailsSectionProps {
  title: string;
  stepValues: Array<{ id: string; label: string }>;
  data: Partial<UIProperty>;
  defaultVisible?: number;
  displayType?: "list" | "tags";
}

export const DetailsSection: React.FC<DetailsSectionProps> = ({
  title,
  stepValues,
  data,
  defaultVisible = 4,
  displayType = "list",
}) => {
  const [showAll, setShowAll] = useState(false);

  const getFieldValue = (obj: any, path: string) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  const formatValue = (value: any): string => {
    if (!value) return "N/A";
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : "N/A";
    }
    return String(value);
  };

  if (displayType === "tags") {
    const tags: string[] = [];
    stepValues.forEach((field) => {
      const value = getFieldValue(data, field.id);
      if (value) {
        if (Array.isArray(value)) {
          tags.push(...value.filter(Boolean));
        } else if (String(value).trim()) {
          tags.push(String(value));
        }
      }
    });

    if (tags.length === 0) return null;
    const visibleTags = showAll ? tags : tags.slice(0, 8);

    return (
      <View className="bg-white px-4 py-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          {title}
        </Text>
        <View className="flex-row flex-wrap -m-1">
          {visibleTags.map((tag, i) => (
            <View
              key={i}
              className="bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg m-1"
            >
              <Text className="text-emerald-700 text-sm font-medium">
                {tag}
              </Text>
            </View>
          ))}
        </View>
        {tags.length > 8 && (
          <TouchableOpacity onPress={() => setShowAll(!showAll)} className="mt-1">
          <View className="flex-row items-center">
            {/* Text + custom underline */}
            <View className="mr-1 self-start">
              <Text className="text-[#10302D] text-[12px] font-bold font-[Lato] leading-[18px] text-center">
                {showAll ? "View Less" : "View More"}
              </Text>
              {/* The underline with adjustable gap */}
              <View className="h-[1px] bg-[#10302D] mt-[2px]" />
              {/* tweak mt-[2px] to mt-[3px]/mt-[4px] for more gap */}
            </View>

            {/* Keep chevron direction consistent */}
            <ChevronIcon direction={showAll ? "up" : "down"} />
          </View>
        </TouchableOpacity>
        )}
      </View>
    );
  }

  // Grid view for Property Details and Pricing Details
  const fieldsWithValues = stepValues
    .map((field) => {
      const value = getFieldValue(data, field.id);
      return {
        ...field,
        value: formatValue(value),
        hasValue:
          value &&
          (Array.isArray(value)
            ? value.length > 0
            : String(value).trim() !== ""),
      };
    })
    .filter((field) => field.hasValue);

  if (fieldsWithValues.length === 0) return null;

  const visibleFields = showAll
    ? fieldsWithValues
    : fieldsWithValues.slice(0, defaultVisible);

  return (
    <View className="bg-white px-5 py-4">
      <Text className="text-[14px] leading-[21px] font-bold text-black font-[Montserrat] mb-4">
        {title}
      </Text>

      {/* Grid Layout - 2 columns */}
      <View className="flex-row flex-wrap -mx-1.5">
        {visibleFields.map((field, index) => (
          <View key={field.id} className="w-1/2 px-1 mb-4">
            <View className="flex-row items-start">
              {/* Icon Container */}
              <View className="inline-flex p-[4px] items-center justify-center rounded-[6px]  mt-1 mr-2">
               {getIcon(field.id)}
              </View>

              {/* Content */}
              <View className="flex-1">
                <Text className="text-[14px] leading-[21px] font-medium text-[#5A5555] font-[Lato]">
                  {field.label}
                </Text>
                <Text className="text-[15px] leading-[24px] font-bold text-black font-[Lato]">
                  {field.value}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Show More/Less Button */}
      {fieldsWithValues.length > defaultVisible && (
        <TouchableOpacity onPress={() => setShowAll(!showAll)} className="mt-1">
          <View className="flex-row items-center">
            {/* Text + custom underline */}
            <View className="mr-1 self-start">
              <Text className="text-[#10302D] text-[12px] font-bold font-[Lato] leading-[18px] text-center">
                {showAll ? "View Less" : "View More"}
              </Text>
              {/* The underline with adjustable gap */}
              <View className="h-[1px] bg-[#10302D] mt-[2px]" />
              {/* tweak mt-[2px] to mt-[3px]/mt-[4px] for more gap */}
            </View>

            {/* Keep chevron direction consistent */}
            <ChevronIcon direction={showAll ? "up" : "down"} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

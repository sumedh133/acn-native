import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Property } from "@/app/types";
import { getIcon } from "../../../../utils/iconUtils";
import {
  formatUnixDate,
  getDaysDifference,
  getDaysFrom,
  formatPrice,
  toCapitalize,
  convertMonthYearToUnix,
} from "../../../helpers/format/format";
import { ChevronIcon } from "../../../../assets/icons/svg/PropertyListing/ViewToggle";

type UIProperty = Omit<Property, "handOverDate"> & {
  handOverDate?: string;
};

interface DetailsSectionProps {
  title: string;
  stepValues: Array<{
    id: string;
    label: string;
    suffix: string;
    prefix: string;
  }>;
  data: Partial<UIProperty>;
  defaultVisible?: number;
  displayType?: "list" | "tags" | "mixed";
}

export const DetailsSection: React.FC<DetailsSectionProps> = ({
  title,
  stepValues,
  data,
  defaultVisible = 4,
  displayType = "list",
}) => {
  const [showAll, setShowAll] = useState(false);

  const excludedFields = new Set([
    "propertyName",
    "noOfBedrooms",
    "noOfBathrooms",
    "noOfBalconies",
    "readyToMove",
    "rentalInfo.maintenanceAmount",
    "possession",
    "availableFrom",
    "handoverDate",
    "handOverDate",
    "isPreLeased",
    
  ]);

  // Remove excluded fields right at the start
  const filteredStepValues = stepValues.filter(
    (field) => !excludedFields.has(field.id)
  );

  const getFieldValue = (obj: any, path: string) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  const formatValue = (value: any, field?: any): string => {
    if (!value) return "N/A";
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : "N/A";
    }
    let formatted = String(value).trim();
    if (field.id === "structure") {
      formatted = `G+ ${formatted}`;
    }
    if (field?.id === "availableFrom" || field?.id === "handOverDate") {
      if (typeof value === "number" || /^\d+$/.test(String(value))) {
        return formatUnixDate(Number(value));
      } else {
        return formatted;
      }
    }
    if (field?.prefix) {
      if (field.prefix === "₹ " || field.prefix === "₹") {
        formatted = formatPrice(value);
        formatted = `${formatted}`;
      } else {
        formatted = `${formatted}`;
      }
    }
    if (field?.suffix) {
      formatted = `${formatted} ${field.suffix}`;
    }

    return toCapitalize(formatted);
  };

  // Helper function to determine if a field should be displayed as a pill
  const shouldDisplayAsPill = (field: any, value: any): boolean => {
    // If it's amenities or similar array fields, show as pills
    if (Array.isArray(value) && value.length > 0) return true;

    // If it's a boolean field that's true, show as pill
    if (typeof value === "boolean" && value === true) return true;

    // If it's a string that represents a boolean-like value
    if (
      typeof value === "string" &&
      ["yes", "true", "approved", "available", "received"].some((keyword) =>
        value.toLowerCase().includes(keyword)
      )
    )
      return true;

    return false;
  };

  if (displayType === "tags") {
    const tags: string[] = [];
    filteredStepValues.forEach((field) => {
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
                {toCapitalize(tag)}
              </Text>
            </View>
          ))}
        </View>
        {tags.length > 8 && (
          <TouchableOpacity
            onPress={() => setShowAll(!showAll)}
            className="mt-1"
          >
            <View className="flex-row items-center">
              <View className="mr-1 self-start">
                <Text className="text-[#10302D] text-[12px] font-bold font-[Lato] leading-[18px] text-center">
                  {showAll ? "View Less" : "View More"}
                </Text>
                <View className="h-[1px] bg-[#10302D] mt-[2px]" />
              </View>
              <ChevronIcon direction={showAll ? "down" : "up"} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Mixed display for "More Details" - pills for booleans/amenities, grid for others
  if (displayType === "mixed") {
    const fieldsWithValues = filteredStepValues
      .map((field) => {
        const value = getFieldValue(data, field.id);
        return {
          ...field,
          value,
          formattedValue: formatValue(value, field),
          hasValue:
            value &&
            (Array.isArray(value)
              ? value.length > 0
              : typeof value === "boolean"
              ? value
              : String(value).trim() !== ""),
        };
      })
      .filter((field) => field.hasValue)
      .filter((field) => field.id !== "extraDetails");

    console.log(fieldsWithValues);

    if (fieldsWithValues.length === 0) return null;

    // Separate fields into different categories
    const gridFields: any[] = [];
    const booleanFields: any[] = [];
    const arrayFields: any[] = [];

    fieldsWithValues.forEach((field) => {
      if (Array.isArray(field.value) && field.value.length > 0) {
        // For arrays, keep the field info with label
        arrayFields.push({
          ...field,
          items: field.value,
        });
      } else if (typeof field.value === "boolean" && field.value === true) {
        // For boolean fields
        booleanFields.push(field);
      } else if (
        typeof field.value === "string" &&
        ["yes", "true", "approved", "available", "received"].some((keyword) =>
          field.value.toLowerCase().includes(keyword)
        )
      ) {
        // For string boolean-like fields
        booleanFields.push(field);
      } else {
        // Regular grid fields
        gridFields.push(field);
      }
    });

    // Combine all fields and limit to 4 total initially
    const allFieldsCombined = [...gridFields, ...booleanFields, ...arrayFields];
    const visibleAllFields = showAll
      ? allFieldsCombined
      : allFieldsCombined.slice(0, 4);

    // Separate back into types from visible fields
    const visibleGridFields = visibleAllFields.filter((field) =>
      gridFields.includes(field)
    );
    const visibleBooleanFields = visibleAllFields.filter((field) =>
      booleanFields.includes(field)
    );
    const visibleArrayFields = visibleAllFields.filter((field) =>
      arrayFields.includes(field)
    );

    return (
      <View className="bg-white px-5 py-4">
        <Text className="text-[14px] leading-[150%] font-bold text-black font-montserrat mb-4">
          {title}
        </Text>

        {/* 1. Grid Layout for normal label/value fields */}
        {visibleGridFields.length > 0 && (
          <View className="flex-row flex-wrap -mx-1.5 ">
            {visibleGridFields.map((field, index) => (
              <View key={field.id} className="w-1/2 px-1 mb-2">
                <View className="flex-row items-start">
                  <View className="inline-flex p-[4px] items-center justify-center rounded-[6px] mt-1 mr-2">
                    {getIcon(field.id)}
                  </View>
                  <View className="flex-1">
                    <Text className="text-[14px] leading-[21px] font-medium text-[#5A5555] font-[Lato]">
                      {field.label}
                    </Text>
                    <Text className="text-[15px] leading-[24px] font-bold text-black font-[Lato]">
                      {toCapitalize(field.formattedValue)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 2. Boolean Pills */}
        {visibleBooleanFields.length > 0 && (
          <View className="mb-2">
            <View className="flex-row flex-wrap -m-1">
              {visibleBooleanFields.map((field, i) => (
                <View
                  key={i}
                  className="bg-white border border-[#2B2928] px-3 py-2 rounded-[28px] m-1"
                >
                  <Text className="text-[#333333] text-sm font-medium leading-[150%]">
                    {toCapitalize(field.label)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 3. Array Fields with Headings */}
        {visibleArrayFields.map((field, index) => (
          <View key={field.id} className="mb-2">
            <Text className="text-[14px] leading-[21px] font-bold text-[#5A5555] font-[Montserrat] mb-3">
              {field.label}
            </Text>
            <View className="flex-row flex-wrap -m-1">
              {field.items.map((item: string, i: number) => (
                <View
                  key={i}
                  className="bg-[#E6F7F4] px-3 py-2 rounded-[28px] m-1"
                >
                  <Text className="text-black text-sm font-medium leading-[150%]">
                    {toCapitalize(item)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Show More/Less Button */}
        {allFieldsCombined.length > 4 && (
          <TouchableOpacity
            onPress={() => setShowAll(!showAll)}
            className="mt-1"
          >
            <View className="flex-row items-center">
              <View className="mr-1 self-start">
                <Text className="text-[#10302D] text-[12px] font-bold font-[Lato] leading-[18px] text-center">
                  {showAll ? "View Less" : "View More"}
                </Text>
                <View className="h-[1px] bg-[#10302D] mt-[2px]" />
              </View>
              <ChevronIcon direction={showAll ? "down" : "up"} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Original grid view for other sections
  const fieldsWithValues = filteredStepValues
    .map((field) => {
      const value = getFieldValue(data, field.id);
      return {
        ...field,
        value: formatValue(value, field),
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
    <View className="bg-white px-5 py-4 pb-0">
      <Text className="text-[14px] leading-[21px] font-bold text-black font-[Montserrat] mb-4">
        {title}
      </Text>

      <View className="flex-row flex-wrap -mx-1.5">
        {visibleFields.map((field, index) => (
          <View key={field.id} className="w-1/2 px-1 mb-4">
            <View className="flex-row items-start">
              <View className="inline-flex p-[4px] items-center justify-center rounded-[6px] mt-1 mr-2">
                {getIcon(field.id)}
              </View>
              <View className="flex-1">
                <Text className="text-[14px] leading-[21px] font-medium text-[#5A5555] font-[Lato]">
                  {field.label}
                </Text>
                <Text className="text-[16px] leading-[24px] font-bold text-black font-[Lato]">
                  {field.id === "rentalInfo" && data?.rentalInfo
                    ? (() => {
                        const { startDate = "", endDate = "" } =
                          data.rentalInfo;

                        // Helper to normalize any input (string or number) into unix timestamp
                        const normalizeToUnix = (
                          val: string | number
                        ): number => {
                          if (!val) return 0;
                          if (typeof val === "number") return val; // already timestamp
                          return convertMonthYearToUnix(val); // convert from "MM/YYYY"
                        };

                        const startUnix = normalizeToUnix(startDate);
                        const endUnix = normalizeToUnix(endDate);

                        if (!startUnix && !endUnix) return "-";

                        return `${startUnix ? formatUnixDate(startUnix) : ""}${
                          startUnix && endUnix ? " - " : ""
                        }${endUnix ? formatUnixDate(endUnix) : ""}`;
                      })()
                    : field.label.toLowerCase() === "maintenance" &&
                      field.value &&
                      String(field.value).toLowerCase() !== "included"
                    ? // Show maintenanceAmount if maintenance is not included
                      formatValue(
                        getFieldValue(data, "rentalInfo.maintenanceAmount"),
                        stepValues.find(
                          (f) => f.id === "rentalInfo.maintenanceAmount"
                        )
                      )
                    : toCapitalize(field.value)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {fieldsWithValues.length > defaultVisible && (
        <TouchableOpacity onPress={() => setShowAll(!showAll)} className="mt-1">
          <View className="flex-row items-center">
            <View className="mr-1 self-start">
              <Text className="text-[#10302D] text-[12px] font-bold font-[Lato] leading-[18px] text-center">
                {showAll ? "View Less" : "View More"}
              </Text>
              <View className="h-[1px] bg-[#10302D] mt-[2px]" />
            </View>
            <ChevronIcon direction={showAll ? "down" : "up"} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

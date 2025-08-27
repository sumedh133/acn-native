import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Property } from "@/app/types";
import { getIcon } from "../../../../utils/iconUtils";

interface DetailsSectionProps {
  title: string;
  stepValues: Array<{ id: string; label: string }>;
  data: Partial<Property>;
  defaultVisible?: number;
  displayType?: "list" | "tags";
}

export const DetailsSection: React.FC<DetailsSectionProps> = ({
  title,
  stepValues,
  data,
  defaultVisible = 6,
  displayType = "list",
}) => {
  const [showAll, setShowAll] = useState(false);

  const getFieldValue = (obj: any, path: string) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  const formatValue = (value: any): string => {
    if (!value) return 'N/A';
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : 'N/A';
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
        <Text className="text-lg font-semibold text-gray-900 mb-3">{title}</Text>
        <View className="flex-row flex-wrap -m-1">
          {visibleTags.map((tag, i) => (
            <View key={i} className="bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg m-1">
              <Text className="text-emerald-700 text-sm font-medium">{tag}</Text>
            </View>
          ))}
        </View>
        {tags.length > 8 && (
          <TouchableOpacity onPress={() => setShowAll(!showAll)} className="mt-3 py-2">
            <Text className="text-emerald-600 font-medium">
              {showAll ? "Show Less" : `+${tags.length - 8} More`}
            </Text>
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
        hasValue: value && (Array.isArray(value) ? value.length > 0 : String(value).trim() !== '')
      };
    })
    .filter(field => field.hasValue);

  if (fieldsWithValues.length === 0) return null;

  const visibleFields = showAll ? fieldsWithValues : fieldsWithValues.slice(0, defaultVisible);

  return (
    <View className="bg-white px-4 py-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">{title}</Text>
      
      {/* Grid Layout - 2 columns */}
      <View className="flex-row flex-wrap -mx-1">
        {visibleFields.map((field, index) => (
          <View key={field.id} className="w-1/2 px-1 mb-4">
            <View className="flex-row items-start">
              {/* Icon Container */}
              <View className="w-10 h-10 bg-teal-50 rounded-lg items-center justify-center mr-3">
                <Text className="text-base">{getIcon(field.label)}</Text>
              </View>
              
              {/* Content */}
              <View className="flex-1">
                <Text className="text-gray-500 text-sm mb-1">
                  {field.label}
                </Text>
                <Text className="text-gray-900 font-semibold text-base">
                  {field.value}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Show More/Less Button */}
      {fieldsWithValues.length > defaultVisible && (
        <TouchableOpacity onPress={() => setShowAll(!showAll)} className="mt-2">
          <Text className="text-teal-600 font-medium">
            {showAll ? "View Less ↑" : "View More ↓"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// LocationSection Component
interface LocationSectionProps {
  data: Partial<Property>;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ data }) => {
  const getFieldValue = (obj: any, path: string) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  // Sample data or from props
  const area = getFieldValue(data, "area") || "East Bangalore";
  const address = getFieldValue(data, "address") || "CRL Layout A Block, Judicial Layout, RT Nagar, Bangalore, Karnataka 560044";
  
  return (
    <View className="bg-white px-4 py-4">
      {/* Area */}
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 bg-teal-50 rounded-lg items-center justify-center mr-3">
          <Text className="text-base">📍</Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 text-sm mb-1">Area</Text>
          <Text className="text-gray-900 font-semibold text-base">{area}</Text>
        </View>
      </View>

      {/* Address */}
      <View className="flex-row items-start mb-4">
        <View className="w-10 h-10 bg-teal-50 rounded-lg items-center justify-center mr-3">
          <Text className="text-base">🏠</Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 text-sm mb-1">Address</Text>
          <Text className="text-gray-900 text-base leading-5">{address}</Text>
        </View>
      </View>

      {/* Open in Google Maps Button */}
      <TouchableOpacity className="flex-row items-center justify-center py-3 border border-teal-600 rounded-lg">
        <Text className="text-base mr-2">🗺️</Text>
        <Text className="text-teal-600 font-medium">Open in Google Maps</Text>
        <Text className="text-teal-600 ml-2">→</Text>
      </TouchableOpacity>
    </View>
  );
};
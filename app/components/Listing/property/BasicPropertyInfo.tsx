import React from "react";
import { View, Text } from "react-native";
import { Property } from "@/app/types";

export const BasicPropertyInfo: React.FC<{ data: Partial<Property> }> = ({ data }) => {
  const getFieldValue = (obj: any, path: string) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  // Use data from props or fallback to sample data
  const title = "Independent Apartment in HSR Layout";
  const price =  "1.34 Lakh";
  const updatedTime = "2 days ago";
  
  // Basic info items in 2x2 grid
  const basicInfo = [
    {
      icon: "📍",
      label: getFieldValue(data, "location") || "Micromarket"
    },
    {
      icon: "🏢",
      label: getFieldValue(data, "propertyType") || "Apartment"
    },
    {
      icon: "🕐",
      label: getFieldValue(data, "possession") || "Handover"
    },
    {
      icon: "🛏️",
      label: getFieldValue(data, "configuration") || "3BHK + 3T + 2B"
    }
  ];

  return (
    <View className="px-4 py-4 bg-white border-b border-gray-100">
      {/* Property Title */}
      <Text className="text-xl font-bold text-gray-900 mb-3">
        {title}
      </Text>

      {/* Price and Updated Time */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold text-gray-900">
          ₹ {price}
        </Text>
        <Text className="text-gray-500 text-sm">
          Updated {updatedTime}
        </Text>
      </View>

      {/* Basic Info Grid - 2x2 */}
      <View className="flex-row flex-wrap">
        {basicInfo.map((item, index) => (
          <View key={index} className="w-1/2 flex-row items-center mb-3">
            <Text className="text-lg mr-3">{item.icon}</Text>
            <Text className="text-gray-700 text-base flex-1">
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
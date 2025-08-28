import React from "react";
import { View, Text } from "react-native";
import { Property } from "@/app/types";

export const BasicPropertyInfo: React.FC<{ data: Partial<Property> }> = ({ data }) => {
  const getFieldValue = (obj: any, path: string) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  const title = "Independent Apartment in HSR Layout";
  const price = "1.34 Lakh";
  const updatedTime = "2 days ago";

  const basicInfo = [
    {
      icon: "📍",
      label: getFieldValue(data, "location") || "Micromarket",
    },
    {
      icon: "🏢",
      label: getFieldValue(data, "propertyType") || "Apartment",
    },
    {
      icon: "🕐",
      label: getFieldValue(data, "possession") || "Handover",
    },
    {
      icon: "🛏️",
      label: getFieldValue(data, "configuration") || "3BHK + 3T + 2B",
    },
  ];

  return (
    <View className="px-4 py-4 bg-white border-b border-gray-100">
      {/* Property Title */}
      <Text className="text-xl font-bold text-gray-900 mb-3">
        {title}
      </Text>

      {/* Price + Updated Time */}
      <View className="flex-row justify-between items-center mb-4">
        {/* Price */}
        <Text className="text-[20px] leading-6 font-bold text-[#153E3B] font-[Montserrat]">
          ₹ {price}
        </Text>

        {/* Updated Time */}
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="text-[12px] leading-[18px] font-medium font-[Lato] text-brand-tertiary"
        >
          Updated {updatedTime}
        </Text>
      </View>

      {/* Basic Info Grid */}
      <View className="flex-row flex-wrap">
        {basicInfo.map((item, index) => (
          <View key={index} className="w-1/2 flex-row items-center mb-3">
            <Text className="text-lg mr-3">{item.icon}</Text>
            <Text className="text-[12px] leading-[18px] font-medium text-[#433F3E] font-[Lato]">
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

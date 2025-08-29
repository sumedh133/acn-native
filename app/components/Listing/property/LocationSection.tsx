import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Property } from "@/app/types";

type UIProperty = Omit<Property, "handOverDate"> & {
  handOverDate?: string;
};

interface LocationSectionProps {
  data: Partial<UIProperty>;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ data }) => {
  const getFieldValue = (obj: any, path: string) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  // Sample data or from props
  const area =
    getFieldValue(data, "area") || "East Bangalore";
  const address =
    getFieldValue(data, "address") ||
    "CIL Layout A Block, Judicial Colony, Raj Mahal Vilas 2nd Stage, Sanjayanagara, Bengaluru, Karnataka 560094";

  return (
     <View className="px-3 py-3 border border-gray-200 rounded-lg">
      {/* Area */}
      <View className="flex-row mb-3">
        <Text className="w-[104px] text-[14px] leading-[21px] font-medium tracking-[0.25px] text-[#5A5555] font-[Montserrat]">
          Area
        </Text>
        <Text className="flex-1 text-[16px] leading-[24px] font-bold text-[#2B2928] font-[Lato]">
          {area}
        </Text>
      </View>

      {/* Address */}
      <View className="flex-row mb-4">
        <Text className="w-[104px] text-[14px] leading-[21px] font-medium tracking-[0.25px] text-[#5A5555] font-[Montserrat]">
          Address
        </Text>
        <Text className="flex-1 text-[16px] leading-[24px] font-bold text-[#2B2928] font-[Lato]">
          {address}
        </Text>
      </View>

      {/* Button */}
      <TouchableOpacity className="flex-row items-center justify-center py-2 border border-teal-700 rounded-md">
        <Text className="text-[#10302D] text-center text-[12px] leading-[18px] font-bold font-[Lato]">
          Open in Google Maps
        </Text>
        <Text className="text-[#10302D] text-[12px] font-bold">→</Text>
      </TouchableOpacity>
    </View>
  );
};

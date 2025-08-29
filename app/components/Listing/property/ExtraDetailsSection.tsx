import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

// Extra Details Component (place this right after the imports, before FormPreview component)
export const ExtraDetailsSection: React.FC<{ extraDetails?: string }> = ({ 
  extraDetails 
}) => {
  if (!extraDetails || !extraDetails.trim()) return null;

  return (
    <View className="bg-white mx-4 rounded-lg p-4 mb-3">
      <Text className="text-[16px] leading-[24px] font-bold text-black font-[Montserrat] mb-2">
        Extra Details
      </Text>
      
      <View className="bg-gray-50 p-4 rounded-lg">
        <Text className="text-[14px] leading-[21px] text-gray-700 font-[Lato]">
          {extraDetails.trim()}
        </Text>
      </View>
    </View>
  );
};
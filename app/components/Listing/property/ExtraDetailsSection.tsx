import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

// Extra Details Component (place this right after the imports, before FormPreview component)
export const ExtraDetailsSection: React.FC<{ extraDetails?: string }> = ({ 
  extraDetails 
}) => {
  if (!extraDetails || !extraDetails.trim()) return null;

  return (
    <View className="bg-[#F5F6F7] mx-4 rounded-lg p-4 mb-3">
      <Text className="text-[16px] leading-[24px] font-bold text-black font-[Montserrat] mb-2">
        Extra Details
      </Text>
      
      <View className="bg-[#FFFFFF] p-4 rounded-[10px]">
        <Text className="text-[14px] leading-[21px] text-[#2B2928] font-[Lato] font-bold">
          {extraDetails.trim()}
        </Text>
      </View>
    </View>
  );
};
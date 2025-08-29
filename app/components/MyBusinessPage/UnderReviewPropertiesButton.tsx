import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import HourglassIcon from "@/assets/icons/MyBusinessPage/hourglass.svg"
import RightArrow from "@/assets/icons/arrowRightt.svg"
import { router } from "expo-router";


const PropertiesUnderReviewCard = () => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => {router.push("/(pages)/UnderReviewProperties")}} className="mx-4 my-3">
      <LinearGradient
        colors={["#E6FAF7", "#DFF7F5"]} // light teal gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="flex-row items-center justify-between rounded-xl px-4 py-3"
      >
        {/* Left Icon */}
        <View className="bg-white/30 p-2 rounded-md">
          <HourglassIcon height={24}  width={24}/>
        </View>

        {/* Text */}
        <Text className="flex-1 text-base font-medium text-black mx-3">
          3 properties under review
        </Text>

        {/* Arrow */}
        <RightArrow height={24}  width={24} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default PropertiesUnderReviewCard;

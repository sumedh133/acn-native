import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import HourglassIcon from "@/assets/icons/MyBusinessPage/hourglass.svg";
import RightArrow from "@/assets/icons/arrowRightt.svg";
import { router } from "expo-router";

const PropertiesUnderReviewCard = () => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        router.push("/(pages)/UnderReviewProperties");
      }}
      className="mx-4 my-3"
    >
      <LinearGradient
        colors={["#A6E5E0", "#BCEBE8", "#D5F2F0"]} // light teal gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="flex-row items-center justify-between rounded-xl px-4 py-3"
      >
        {/* Left Icon */}
        <View className=" p-2 rounded-full border border-[#10302D]">
          <HourglassIcon height={24} width={24} />
        </View>

        {/* Text */}
        <Text
          className="flex-1 text-base font-medium text-black mx-3"
          style={{ fontFamily: "Lato_700Bold" }}
        >
          3 properties under review{/* Count here needs to be fetched */}
        </Text>

        {/* Arrow */}
        <RightArrow height={24} width={24} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default PropertiesUnderReviewCard;

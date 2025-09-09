import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import HourglassIcon from "@/assets/icons/MyBusinessPage/hourglass.svg";
import RightArrow from "@/assets/icons/arrowRightt.svg";
import { router } from "expo-router";
import { trackEvent } from "@/app/services/logAnalyticsService";

interface PropertiesUnderReviewCardProps {
  count: number;
}

const PropertiesUnderReviewCard = ({ count }: PropertiesUnderReviewCardProps) => {
  const handleRightArrowPress = () => {
    try {
      trackEvent("qc_review_banner_click").catch((error) => {
        console.error(`Error logging event: ${error}`);
      });
    } catch (error) {
      console.error(`Unexpected error: ${error}`);
    }

    router.push("/(pages)/UnderReviewProperties");
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleRightArrowPress} // ✅ Use the function here
      className="mx-4 mb-3"
    >
      <LinearGradient
        colors={["#A6E5E0", "#BCEBE8", "#D5F2F0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="flex-row items-center justify-between rounded-xl px-4 py-3"
      >
        <View className="p-2 rounded-full border border-[#10302D]">
          <HourglassIcon height={24} width={24} />
        </View>

        <Text
          className="flex-1 text-base font-medium text-black mx-3"
          style={{ fontFamily: "Lato_700Bold" }}
        >
          {count} properties under review
        </Text>

        <RightArrow height={24} width={24} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default PropertiesUnderReviewCard;

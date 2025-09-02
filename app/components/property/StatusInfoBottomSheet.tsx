import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styled } from "nativewind";

type StatusInfoBottomSheetProps = {
  visible: boolean;
  status: string | undefined | null;
  onClose: () => void;
};

interface StatusContent<T extends "pointer" | "string"> {
  title: string;
  description: T extends "pointer"
    ? { title: string; description: string }[]
    : string;
  type?: T;
  bgColour?: string;
  textColour?: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const statusContentMap: Record<string, StatusContent<"pointer" | "string">> = {
  "commission-type": {
    title: "Commission Type",
    type: "pointer",
    description: [
      {
        title: "Side by Side",
        description:
          "Agents representing the landlord and tenant will take commission only from their respective clients.",
      },
      {
        title: "Commission sharing",
        description:
          "Commission will be shared by both agents on a mutual agreement.",
      },
    ],
  },
  "de-listed": {
    title: "Delisted",
    bgColour: "#FFF0F0",
    textColour: "#E93B3E",
    description: `Your inventory is currently hidden from other agents because its status hasn’t been updated in the last 14 days. 
      
ACN automatically delists properties 14 days after the last status check to keep listings fresh and available.`,
  },
  "pre-leased": {
    title: "Pre-Leased",
    description:
      "The property is already leased or rented out at the time of sale.",
  },
  "search-radius": {
    title: "Search Radius",
    description:
      "The radius within which the search results are filtered based on the specified landmark.",
  },
  "side-by-side": {
    title: "Side by Side",
    description:
      "Agents representing the landlord and tenant will take commission only from their respective clients.",
  },
  "commission-sharing": {
    title: "Commission Sharing",
    description:
      "Commission will be shared by both agents on a mutual agreement.",
  },
};

const StatusInfoBottomSheet = ({
  visible,
  status,
  onClose,
}: StatusInfoBottomSheetProps) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const content = useMemo(() => {
    const key = (status || "").toLowerCase();
    return (
      statusContentMap[key] || {
        title: (status || "Info").toString(),
        description: "",
      }
    );
  }, [status]);

  useEffect(() => {
    const slideTo = visible ? 0 : SCREEN_HEIGHT;
    const fadeTo = visible ? 1 : 0;

    const slideAnim = Animated.timing(translateY, {
      toValue: slideTo,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    const fadeAnim = Animated.timing(backdropOpacity, {
      toValue: fadeTo,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    Animated.parallel([slideAnim, fadeAnim]).start();
  }, [visible, translateY, backdropOpacity]);

  if (!visible) return null;

  const AView = styled(Animated.View);

  return (
    <View
      className={`absolute inset-0 z-[200] `}
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <AView
        className="absolute inset-0 bg-black/40"
        style={{
          opacity: backdropOpacity,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1"
          onPress={onClose}
        />
      </AView>

      <AView
        className="absolute left-0 right-0 bottom-0 w-full rounded-t-2xl px-4 pt-3 pb-6 shadow-lg"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          transform: [{ translateY }],
          elevation: 12,
          backgroundColor: content.bgColour || "#FFFFFF",
        }}
      >
        <View className="self-center w-10 h-[6px] rounded-full bg-gray-300 mb-3" />
        <Text
          className="text-base text-center mb-2 font-montserrat-bold"
          style={{ color: content.textColour || "#2B2928" }}
        >
          {content.title}
        </Text>
        {!!content.description &&
          (Array.isArray(content.description) ? (
            <View className="mt-1">
              {content.description.map(
                (item: { title: string; description: string }) => (
                  <View key={item.title} className="mb-2">
                    <Text className="text-[13px] leading-[18px] text-[#2B2928] font-montserrat-bold">
                      {item.title}
                    </Text>
                    <Text className="text-[13px] leading-[18px] text-[#5A5555] font-lato-regular">
                      {item.description}
                    </Text>
                  </View>
                )
              )}
            </View>
          ) : (
            <Text className="text-[13px] leading-[18px] text-[#5A5555] font-lato-regular">
              {content.description}
            </Text>
          ))}
        <TouchableOpacity
          className="mt-4 self-end bg-[#153E3B] px-4 py-2 rounded-lg"
          onPress={onClose}
        >
          <Text className="text-white font-lato-semibold">Close</Text>
        </TouchableOpacity>
      </AView>
    </View>
  );
};

export default StatusInfoBottomSheet;

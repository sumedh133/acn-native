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
import { Ionicons } from "@expo/vector-icons";

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
      className={`absolute inset-0 z-[9999] `}
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
        className="absolute left-0 right-0 bottom-0 w-full"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          transform: [{ translateY }],
        }}
      >
        {/* Close button positioned above the modal */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: "absolute",
            top: -60, // Position above the modal content
            left: "50%",
            transform: [{ translateX: -20 }],
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#FFFFFF",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 201,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>

        {/* Modal content */}
        <View
          className="rounded-t-2xl pt-5 shadow-lg px-6"
          style={{
            elevation: 12,
            backgroundColor: content.bgColour || "#FFFFFF",
          }}
        >
          <Text
            className="text-base text-center mb-2 font-montserrat-bold"
            style={{ color: content.textColour || "#2B2928" }}
          >
            {content.title}
          </Text>
          {!!content.description &&
            (Array.isArray(content.description) ? (
              <View className="pt-6 pb-12">
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
              <Text className="text-[13px] leading-[18px] text-[#5A5555] font-lato-regular pt-6 pb-12">
                {content.description}
              </Text>
            ))}
        </View>
      </AView>
    </View>
  );
};

export default StatusInfoBottomSheet;

import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // or 'react-native-linear-gradient'
import { styled } from "nativewind";
import ListingsIcon from "@/assets/icons/listingWithGradient.svg";

type NewEnquiriesModalProps = {
  visible: boolean;
  onClose: () => void;
  onCheckNow: () => void;
  enquiryCount?: number;
};

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const NewEnquiriesModal = ({
  visible,
  onClose,
  onCheckNow,
  enquiryCount = 5,
}: NewEnquiriesModalProps) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

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

  const AView = styled(Animated.View);

  // Don't return null immediately - let animations complete
  return (
    <View
      className={`absolute inset-0 z-[200]`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: visible ? "auto" : "none", // Prevent interaction when not visible
      }}
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
      {/* Close button - Moved outside modal content to prevent clipping */}
      <AView
        style={{
          position: "absolute",
          alignSelf: "center",
          bottom: "29%", // Position relative to screen instead of modal
          zIndex: 30,
          transform: [
            {
              translateY: translateY.interpolate({
                inputRange: [0, SCREEN_HEIGHT],
                outputRange: [-55, SCREEN_HEIGHT],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          className="bg-white rounded-full items-center justify-center h-12 w-12"
          onPress={onClose}
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text className="text-black font-bold text-[24px]">×</Text>
        </TouchableOpacity>
      </AView>

      <AView
        className="absolute left-0 right-0 bottom-0 w-full rounded-t-[24px] pt-[40px] pb-6 shadow-lg"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          transform: [{ translateY }],
          elevation: 12,
          overflow: "hidden", // Important for rounded corners with gradient
        }}
      >
        {/* Gradient Background */}
        <LinearGradient
          colors={["#FFFFFF", "#A0E2DD"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
        />

        {/* Content */}
        <View className="items-center px-5 mt-2">
          <View className="mb-[15px]">
            <ListingsIcon />
          </View>

          <Text className="text-center font-bold text-[18px] text-[#10302D]">
            You've Received
          </Text>
          <Text className="text-center font-bold text-[24px] text-[#10302D] mb-8">
            {enquiryCount} New Enquiries!
          </Text>
          <TouchableOpacity
            className="bg-[#153E3B] w-full py-2 px-5 rounded-[4px] items-center"
            onPress={onCheckNow}
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 3,
            }}
          >
            <Text className="text-white font-bold text-base">Check Now</Text>
          </TouchableOpacity>
        </View>
      </AView>
    </View>
  );
};

export default NewEnquiriesModal;

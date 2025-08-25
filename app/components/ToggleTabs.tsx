import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";

interface Tab {
  label: string;
  value: string;
}

interface ToggleTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (value: string) => void;
  sliderHeight?: number | `${number}%` | "auto";

  /** Class overrides (appended) */
  containerClassName?: string;
  sliderClassName?: string;
  tabClassName?: string;
  activeTextClassName?: string;
  inactiveTextClassName?: string;
}

const ToggleTabs: React.FC<ToggleTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  sliderHeight="100%" as `${number}%`,
  containerClassName = "",
  sliderClassName = "",
  tabClassName = "",
  activeTextClassName = "",
  inactiveTextClassName = "",
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const index = tabs.findIndex((tab) => tab.value === activeTab);
    Animated.timing(slideAnim, {
      toValue: index,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  // Defaults
  const defaultContainer =
    "flex-row w-full rounded-full border border-[#153E3B] overflow-hidden p-1 relative ";
  const defaultSlider =
    "absolute top-1 bottom-1 bg-[#153E3B] rounded-full z-0";
  const defaultTab =
    "flex-1 py-3 items-center justify-center rounded-full z-10";
  const defaultActiveText = "text-white";
  const defaultInactiveText = "text-gray-700";

  return (
    <View className={`${defaultContainer} ${containerClassName}`}>
      {/* Sliding Background */}
      <Animated.View
        
        style={{
          width: `${100 / tabs.length - 1.5}%`,
          left: slideAnim.interpolate({
            inputRange: tabs.map((_, i) => i),
            outputRange: tabs.map(
              (_, i) => `${(100 / tabs.length) * i + 1.5}%`
            ),
          }),
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 4,
          height: sliderHeight,
        }}
        className={`${defaultSlider} ${sliderClassName}`}
      />

      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.value}
          className={`${defaultTab} ${tabClassName}`}
          onPress={() => onChange(tab.value)}
        >
          <Text
            className={`text-sm ${
              activeTab === tab.value
                ? `${defaultActiveText} ${activeTextClassName}`
                : `${defaultInactiveText} ${inactiveTextClassName}`
            }`}
            style={{ fontFamily: "Montserrat_600SemiBold" }}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ToggleTabs;

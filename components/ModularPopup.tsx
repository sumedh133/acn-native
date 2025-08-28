import React, { ReactNode, useRef } from "react";
import {
  Animated,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import FreeIcon from "@/assets/icons/free.svg";

interface PopupItem {
  id: string | number;
  text: string;
  subText?: string; // Optional
  icon?: ReactNode; // Optional
  colors?: string[]; // Optional, defaults to white
  iconColor?: string; // Optional, only used if icon is provided
  onPress: () => void; // Custom functionality instead of just linking
  free?: boolean; // Optional, if true shows "Free" badge
  selected?: boolean; // Optional, if true shows "Selected" badge
}

interface ModularPopupProps {
  items: PopupItem[];
  slideAnimation: Animated.Value;
  onDragDown: () => void;
  onItemPress?: (item: PopupItem) => void; // Optional global handler
  dragThreshold?: number; // Optional, defaults to 10
}

const ModularPopup = ({
  items,
  slideAnimation,
  onDragDown,
  onItemPress,
  dragThreshold = 10,
}: ModularPopupProps) => {
  const dragY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (evt, gestureState) => {
        // Only allow downward dragging
        if (gestureState.dy > 0) {
          dragY.setValue(gestureState.dy);
        }
      },

      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > dragThreshold) {
          onDragDown && onDragDown();
        } else {
          // Snap back to original position if drag wasn't enough
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const handleItemPress = (item: PopupItem) => {
    // Call global handler if provided
    onItemPress && onItemPress(item);
    // Call item's specific handler
    item.onPress();
  };

  return (
    <TouchableOpacity
      onPress={(e) => {
        e.stopPropagation();
      }}
      activeOpacity={1}
      className="w-full"
    >
      <Animated.View
        className="w-full bg-[#FBFCFB] rounded-t-3xl pb-9"
        style={{
          transform: [{ translateY: slideAnimation }, { translateY: dragY }],
        }}
        {...panResponder.panHandlers} // 👈 attach here
      >
        {/* Drag Handle */}
        <View className="pt-3 w-full mb-4 flex items-center justify-center">
          <View className="w-32 h-1 rounded bg-black/60" />
        </View>

        {/* Menu Items */}
        <View className="px-3 gap-2 relative">
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  item.selected
                    ? ["#E6F4EA", "#C8E6C9"] // light green gradient for selected
                    : item.colors || ["#FFFFFF", "#FFFFFF"] // default
                } // Default to white
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-4 py-3 rounded-2xl border border-[#F2F2F2]"
              >
                <View className="flex flex-row items-center gap-4">
                  {/* Optional Icon */}
                  {item.icon && (
                    <View
                      className="p-3.5 rounded-full"
                      style={{
                        backgroundColor: item.iconColor || "#E5E5E5", // Default gray if no color
                      }}
                    >
                      {item.icon}
                    </View>
                  )}

                  {/* Text Content */}
                  <View className="flex-1 flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text
                        className="text-[#0C0C0C] text-sm font-bold leading-5"
                        style={{
                          fontFamily: "Lato_700Bold",
                          marginBottom: item.subText ? 2 : 0,
                        }}
                      >
                        {item.text}
                      </Text>
                      {item.subText && (
                        <Text
                          className="text-[#575757] text-sm font-medium leading-5"
                          style={{ fontFamily: "Lato_400Regular" }}
                        >
                          {item.subText}
                        </Text>
                      )}
                    </View>

                    {/* Free Badge */}
                    {/* {item.free && (
                      <View className="absolute top-0 right-0 bg-[#FFB800] px-3 py-1 rounded-full ml-2">
                        <Text>Free</Text>
                      </View>
                    )} */}
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ModularPopup;

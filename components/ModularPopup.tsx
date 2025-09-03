import React, { ReactNode, useRef } from "react";
import {
  Animated,
  Easing,
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
  dragThreshold?: number; // Optional, defaults to 100 (pixels)
  velocityThreshold?: number; // Optional, defaults to 0.5 (velocity)
}

const ModularPopup = ({
  items,
  slideAnimation,
  onDragDown,
  onItemPress,
  dragThreshold = 100,
  velocityThreshold = 0.5,
}: ModularPopupProps) => {
  const dragY = useRef(new Animated.Value(0)).current;
  const fadeOpacity = useRef(new Animated.Value(1)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Only start pan responder for vertical movements
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Require minimum movement to start gesture (prevents accidental triggers)
        return Math.abs(gestureState.dy) > 5;
      },

      onPanResponderGrant: () => {
        // Set offset when starting drag
        dragY.setOffset((dragY as any)._value);
      },

      onPanResponderMove: (evt, gestureState) => {
        // Only allow downward dragging
        if (gestureState.dy > 0) {
          dragY.setValue(gestureState.dy);
        }
      },

      onPanResponderRelease: (evt, gestureState) => {
        dragY.flattenOffset();

        // Enhanced threshold check: distance OR velocity
        if (
          gestureState.dy > dragThreshold ||
          gestureState.vy > velocityThreshold
        ) {
          // Calculate dynamic duration based on velocity and remaining distance
          const remainingDistance = 300 - gestureState.dy; // Assume 300px total dismiss distance
          const baseVelocity = Math.max(Math.abs(gestureState.vy), 0.5); // Minimum velocity
          const dynamicDuration = Math.max(
            150,
            Math.min(400, remainingDistance / baseVelocity)
          );

          // Animate close with improved easing, dynamic duration, fade and scale effects
          Animated.parallel([
            Animated.timing(dragY, {
              toValue: 300, // Animate further down for smoother exit
              duration: dynamicDuration,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(fadeOpacity, {
              toValue: 0, // Fade out during dismiss
              duration: dynamicDuration * 0.8, // Fade slightly faster than slide
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 0.95, // Subtle scale down for natural feel
              duration: dynamicDuration,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Reset values for next use
            dragY.setValue(0);
            fadeOpacity.setValue(1);
            scaleValue.setValue(1);
            onDragDown && onDragDown();
          });
        } else {
          // Snap back to original position with improved spring animation
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 120,
            friction: 7,
            velocity: -gestureState.vy, // Use release velocity for more natural feel
          }).start();
        }
      },

      onPanResponderTerminate: () => {
        // Handle gesture termination (e.g., when another gesture takes over)
        dragY.flattenOffset();
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 120,
          friction: 7,
        }).start();
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
          transform: [
            { translateY: slideAnimation },
            { translateY: dragY },
            { scale: scaleValue },
          ],
          opacity: fadeOpacity,
        }}
        {...panResponder.panHandlers}
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
                    ? ["#C8E6C9", "#E6F4EA"] // light green gradient for selected
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

import React, { createContext, useRef } from "react";
import { Animated } from "react-native";

interface ScrollContextType {
  scrollY: Animated.Value;
  footerTranslateY: Animated.AnimatedInterpolation<number>;
}

export const ScrollContext = createContext<ScrollContextType>({
  scrollY: new Animated.Value(0),
  footerTranslateY: new Animated.Value(0),
});

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  // Smooth clamp: footer moves between 0 → 59 depending on scroll direction
  const footerTranslateY = Animated.diffClamp(scrollY, 0, 59).interpolate({
    inputRange: [0, 59],
    outputRange: [0, 77],
    extrapolate: "clamp",
  });

  return (
    <ScrollContext.Provider value={{ scrollY, footerTranslateY }}>
      {children}
    </ScrollContext.Provider>
  );
};

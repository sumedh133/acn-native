import React, { createContext, useCallback, useRef } from "react";
import { Animated } from "react-native";

interface ScrollContextType {
  scrollY: Animated.Value;
  footerTranslateY: Animated.AnimatedInterpolation<number>;
  resetFooterPosition: () => void;
}

export const ScrollContext = createContext<ScrollContextType>({
  scrollY: new Animated.Value(0),
  footerTranslateY: new Animated.Value(0),
  resetFooterPosition: () => {},
});

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  // Smooth clamp: footer moves between 0 → 59 depending on scroll direction
  const footerTranslateY = Animated.diffClamp(scrollY, 0, 59).interpolate({
    inputRange: [0, 59],
    outputRange: [0, 77],
    extrapolate: "clamp",
  });

  const resetFooterPosition = useCallback(() => {
    // Reset the underlying scrollY value to 0, which will reset the footer position
    scrollY.setValue(0);
  }, [scrollY]);

  return (
    <ScrollContext.Provider value={{ scrollY, footerTranslateY, resetFooterPosition }}>
      {children}
    </ScrollContext.Provider>
  );
};
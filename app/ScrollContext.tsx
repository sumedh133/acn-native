import React, { createContext, useCallback, useRef } from "react";
import { Animated } from "react-native";

interface ScrollContextType {
  scrollY: Animated.Value;
  footerTranslateY: Animated.AnimatedInterpolation<number>;
  resetFooterPosition: () => void;
  onScrollEndDrag: () => void;
  onMomentumScrollEnd: () => void;

  // New sort popup state
  showSortPopup: boolean;
  selectedSort: string | null;
  openSortPopup: () => void;
  closeSortPopup: () => void;
  setSelectedSort: (value: string) => void;
}

const FOOTER_HEIGHT = 100;

export const ScrollContext = createContext<ScrollContextType>({
  scrollY: new Animated.Value(0),
  footerTranslateY: new Animated.Value(0),
  resetFooterPosition: () => {},
  onScrollEndDrag: () => {},
  onMomentumScrollEnd: () => {},

  // New sort popup state
  showSortPopup: false,
  selectedSort: null,
  openSortPopup: () => {},
  closeSortPopup: () => {},
  setSelectedSort: (value: string) => {},
});

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const clampedScrollY = useRef(new Animated.Value(0)).current;
  const lastScrollValue = useRef(0);
  const currentClampedValue = useRef(0);
  const scrollDirection = useRef<"up" | "down">("down");

  const [showSortPopup, setShowSortPopup] = React.useState(false);
  const [selectedSort, setSelectedSort] = React.useState<string | null>("relevance");

  const openSortPopup = () => setShowSortPopup(true);
  const closeSortPopup = () => setShowSortPopup(false);

  const footerTranslateY = clampedScrollY.interpolate({
    inputRange: [0, FOOTER_HEIGHT],
    outputRange: [0, FOOTER_HEIGHT],
    extrapolate: "clamp",
  });

  const updateClampedValue = useCallback(
    (currentScroll: number) => {
      const diff = currentScroll - lastScrollValue.current;

      if (Math.abs(diff) > 0.5) {
        scrollDirection.current = diff > 0 ? "down" : "up";

        // Damping factor - reduce sensitivity
        const dampingFactor = 0.3; // Adjust this: 0.5 = half speed, 0.3 = very slow, 0.8 = faster
        const dampedDiff = Math.abs(diff) * dampingFactor;

        let newClampedValue;
        if (scrollDirection.current === "down") {
          newClampedValue = Math.min(
            FOOTER_HEIGHT,
            currentClampedValue.current + dampedDiff
          );
        } else {
          newClampedValue = Math.max(
            0,
            currentClampedValue.current - dampedDiff
          );
        }

        currentClampedValue.current = newClampedValue;
        clampedScrollY.setValue(newClampedValue);
      }

      lastScrollValue.current = currentScroll;
    },
    [clampedScrollY]
  );

  React.useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      updateClampedValue(value);
    });

    return () => scrollY.removeListener(listener);
  }, [scrollY, updateClampedValue]);

  const snapToNearest = useCallback(() => {
    const currentValue = currentClampedValue.current;
    const thresholdShow = 0.15 * FOOTER_HEIGHT; // 11.55 - very easy to show (just a tiny scroll up)
    const thresholdHide = 0.8 * FOOTER_HEIGHT; // 61.6 - much harder to hide (need significant scroll down)

    let targetValue: number;

    // Biased toward showing:
    // 0 to 11.55: Always show
    // 11.55 to 61.6: Show unless user was scrolling down aggressively
    // 61.6 to 77: Hide only when mostly sure

    if (currentValue <= thresholdShow) {
      // Footer barely moved - always show
      targetValue = 0;
    } else if (currentValue >= thresholdHide) {
      // Footer almost completely hidden - hide it
      targetValue = FOOTER_HEIGHT;
    } else {
      // Large middle zone - bias toward showing
      if (scrollDirection.current === "up") {
        // Any upward scroll in middle zone = show
        targetValue = 0;
      } else {
        // Downward scroll in middle zone - only hide if past 50%
        targetValue = currentValue > 0.5 * FOOTER_HEIGHT ? FOOTER_HEIGHT : 0;
      }
    }

    currentClampedValue.current = targetValue;
    Animated.timing(clampedScrollY, {
      toValue: targetValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [clampedScrollY]);

  const onScrollEndDrag = useCallback(() => {
    snapToNearest();
  }, [snapToNearest]);

  const onMomentumScrollEnd = useCallback(() => {
    snapToNearest();
  }, [snapToNearest]);

  const resetFooterPosition = useCallback(() => {
    scrollY.setValue(0);
    clampedScrollY.setValue(0);
    currentClampedValue.current = 0;
    lastScrollValue.current = 0;
  }, [scrollY, clampedScrollY]);

  return (
    <ScrollContext.Provider
      value={{
        scrollY,
        footerTranslateY,
        resetFooterPosition,
        onScrollEndDrag,
        onMomentumScrollEnd,

        // sort popup state
        showSortPopup,
        selectedSort,
        openSortPopup,
        closeSortPopup,
        setSelectedSort,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
};

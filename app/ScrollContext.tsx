import React, { createContext, useCallback, useRef } from "react";
import { Animated } from "react-native";

interface ScrollContextType {
  scrollY: Animated.Value;
  footerTranslateY: Animated.AnimatedInterpolation<number>;
  resetFooterPosition: () => void;
  onScrollEndDrag: () => void;
  onMomentumScrollEnd: () => void;
  setFooterHeight: (h: number) => void;
  footerHeight: number | null;
  notificationHeight: Animated.AnimatedInterpolation<number>;

  // Sort popup state
  showSortPopup: boolean;
  selectedSort: string | null;
  openSortPopup: () => void;
  closeSortPopup: () => void;
  setSelectedSort: (value: string) => void;
}

const NOTIFICATION_HEIGHT = 80;

export const ScrollContext = createContext<ScrollContextType>({
  scrollY: new Animated.Value(0),
  footerTranslateY: new Animated.Value(0),
  resetFooterPosition: () => {},
  onScrollEndDrag: () => {},
  onMomentumScrollEnd: () => {},
  setFooterHeight: () => {},
  footerHeight: null,
  notificationHeight: new Animated.Value(0),
  showSortPopup: false,
  selectedSort: null,
  openSortPopup: () => {},
  closeSortPopup: () => {},
  setSelectedSort: () => {},
});

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const clampedScrollY = useRef(new Animated.Value(0)).current;
  const lastScrollValue = useRef(0);
  const currentClampedValue = useRef(0);
  const scrollDirection = useRef<"up" | "down">("down");

  const [footerHeight, setFooterHeight] = React.useState<number | null>(null);

  // sort popup
  const [showSortPopup, setShowSortPopup] = React.useState(false);
  const [selectedSort, setSelectedSort] = React.useState<string | null>("relevance");

  const openSortPopup = () => setShowSortPopup(true);
  const closeSortPopup = () => setShowSortPopup(false);

  // Use a safe fallback so animations don’t break before layout
  const safeFooterHeight = footerHeight ?? 60;

  const footerTranslateY = clampedScrollY.interpolate({
    inputRange: [0, safeFooterHeight],
    outputRange: [0, safeFooterHeight],
    extrapolate: "clamp",
  });

  const notificationHeight = clampedScrollY.interpolate({
    inputRange: [0, safeFooterHeight],
    outputRange: [NOTIFICATION_HEIGHT, 0],
    extrapolate: "clamp",
  });

  const updateClampedValue = useCallback(
    (currentScroll: number) => {
      const diff = currentScroll - lastScrollValue.current;

      if (Math.abs(diff) > 0.5) {
        scrollDirection.current = diff > 0 ? "down" : "up";

        const dampingFactor = 0.3;
        const dampedDiff = Math.abs(diff) * dampingFactor;

        let newClampedValue;
        if (scrollDirection.current === "down") {
          newClampedValue = Math.min(
            safeFooterHeight,
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
    [clampedScrollY, safeFooterHeight] // include footer height
  );

  React.useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      updateClampedValue(value);
    });

    return () => scrollY.removeListener(listener);
  }, [scrollY, updateClampedValue]);

  const snapToNearest = useCallback(() => {
    const currentValue = currentClampedValue.current;
    const thresholdShow = 0.15 * safeFooterHeight;
    const thresholdHide = 0.8 * safeFooterHeight;

    let targetValue: number;

    if (currentValue <= thresholdShow) {
      targetValue = 0;
    } else if (currentValue >= thresholdHide) {
      targetValue = safeFooterHeight;
    } else {
      if (scrollDirection.current === "up") {
        targetValue = 0;
      } else {
        targetValue = currentValue > 0.5 * safeFooterHeight ? safeFooterHeight : 0;
      }
    }

    currentClampedValue.current = targetValue;
    Animated.timing(clampedScrollY, {
      toValue: targetValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [clampedScrollY, safeFooterHeight]);

  const onScrollEndDrag = useCallback(snapToNearest, [snapToNearest]);
  const onMomentumScrollEnd = useCallback(snapToNearest, [snapToNearest]);

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
        setFooterHeight,
        footerHeight,
        notificationHeight,
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

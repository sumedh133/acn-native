import React, {
  createContext,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import { Animated } from "react-native";

interface ScrollContextType {
  scrollY: Animated.Value;

  // Footer
  footerTranslateY: Animated.AnimatedInterpolation<number>;
  resetFooterPosition: () => void;
  onScrollEndDrag: () => void;
  onMomentumScrollEnd: () => void;
  setFooterHeight: (h: number) => void;
  footerHeight: number | null;

  // Header
  setHeaderHeight: (h: number) => void;
  headerHeightValue: number | null;
  headerHeight: Animated.AnimatedInterpolation<number>;

  // Secondary Header
  setSecondaryHeaderHeight: (h: number) => void;
  secondaryHeaderHeightValue: number | null;
  secondaryHeaderHeight: Animated.AnimatedInterpolation<number>;

  // Notification
  setNotificationHeight: (h: number) => void;
  notificationHeightValue: number | null;
  notificationHeight: Animated.AnimatedInterpolation<number>;

  // Sort popup
  showSortPopup: boolean;
  selectedSort: string | null;
  // Context type
  openSortPopup: (propertyType?: string) => void;
  propertyType: string;
  closeSortPopup: () => void;
  setSelectedSort: (value: string) => void;

  // Status filter popup
  showStatusPopup: boolean;
  selectedStatus: string | null;
  openStatusPopup: () => void;
  closeStatusPopup: () => void;
  setSelectedStatus: (value: string) => void;

  // New Enquiry Popup
  showNewEnquiryPopup: boolean;
  openNewEnquiryPopup: () => void;
  closeNewEnquiryPopup: () => void;

  // Category filter popup
  showCategoryPopup: boolean;
  selectedCategory: string | null;
  openCategoryPopup: () => void;
  closeCategoryPopup: () => void;
  setSelectedCategory: (value: string) => void;

  // Status info bottom sheet
  isStatusInfoOpen: boolean;
  currentStatusInfo: string | null;
  openStatusInfo: (status: string | null) => void;
  closeStatusInfo: () => void;
}

export const ScrollContext = createContext<ScrollContextType>({
  scrollY: new Animated.Value(0),

  footerTranslateY: new Animated.Value(0),
  resetFooterPosition: () => {},
  onScrollEndDrag: () => {},
  onMomentumScrollEnd: () => {},
  setFooterHeight: () => {},
  footerHeight: null,

  setHeaderHeight: () => {},
  headerHeightValue: null,
  headerHeight: new Animated.Value(0),

  setSecondaryHeaderHeight: () => {},
  secondaryHeaderHeightValue: null,
  secondaryHeaderHeight: new Animated.Value(0),

  setNotificationHeight: () => {},
  notificationHeightValue: null,
  notificationHeight: new Animated.Value(0),

  showSortPopup: false,
  selectedSort: null,
  openSortPopup: () => {},
  propertyType: "",
  closeSortPopup: () => {},
  setSelectedSort: () => {},

  showStatusPopup: false,
  selectedStatus: null,
  openStatusPopup: () => {},
  closeStatusPopup: () => {},
  setSelectedStatus: () => {},

  showNewEnquiryPopup: false,
  openNewEnquiryPopup: () => {},
  closeNewEnquiryPopup: () => {},

  showCategoryPopup: false,
  selectedCategory: null,
  openCategoryPopup: () => {},
  closeCategoryPopup: () => {},
  setSelectedCategory: () => {},

  // Status info bottom sheet
  isStatusInfoOpen: false,
  currentStatusInfo: null,
  openStatusInfo: () => {},
  closeStatusInfo: () => {},
});

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  // Footer state
  const clampedFooterY = useRef(new Animated.Value(0)).current;
  const currentClampedFooter = useRef(0);

  // Header state
  const clampedHeaderY = useRef(new Animated.Value(0)).current;
  const currentClampedHeader = useRef(0);

  // Secondary Header state
  const clampedSecondaryHeaderY = useRef(new Animated.Value(0)).current;
  const currentClampedSecondaryHeader = useRef(0);

  // Notification state
  const clampedNotificationY = useRef(new Animated.Value(0)).current;
  const currentClampedNotification = useRef(0);

  const lastScrollValue = useRef(0);
  const scrollDirection = useRef<"up" | "down">("down");

  const [footerHeight, setFooterHeight] = useState<number | null>(null);
  const [headerHeightValue, setHeaderHeight] = useState<number | null>(null);
  const [secondaryHeaderHeightValue, setSecondaryHeaderHeight] = useState<
    number | null
  >(null);
  const [notificationHeightValue, setNotificationHeight] = useState<
    number | null
  >(null);

  // Sort popup state
  const [showSortPopup, setShowSortPopup] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string | null>("relevance");

  // Status filter popup state
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Category filter popup state
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Status info bottom sheet state
  const [isStatusInfoOpen, setIsStatusInfoOpen] = useState<boolean>(false);
  const [currentStatusInfo, setCurrentStatusInfo] = useState<string | null>(
    null
  );

  // New Enquiry info bottom sheet state
  const [showNewEnquiryPopup, setShowNewEnquiryPopup] =
    useState<boolean>(false);

  // Popup methods
  const [currentPropertyType, setCurrentPropertyType] = useState<string>("");

  const openSortPopup = (propertyType?: string) => {
    if (propertyType) {
      setCurrentPropertyType(propertyType);
    }
    setShowSortPopup(true);
  };
  const closeSortPopup = () => setShowSortPopup(false);
  const openStatusPopup = () => setShowStatusPopup(true);
  const closeStatusPopup = () => setShowStatusPopup(false);
  const openNewEnquiryPopup = () => setShowNewEnquiryPopup(true);
  const closeNewEnquiryPopup = () => setShowNewEnquiryPopup(false);

  const openCategoryPopup = () => setShowCategoryPopup(true);
  const closeCategoryPopup = () => setShowCategoryPopup(false);

  // Safe fallbacks
  const safeFooterHeight = footerHeight ?? 60;
  const safeHeaderHeight = headerHeightValue ?? 56;
  const safeSecondaryHeaderHeight = secondaryHeaderHeightValue ?? 48;
  const safeNotificationHeight = notificationHeightValue ?? 80;

  // Interpolations
  const footerTranslateY = clampedFooterY.interpolate({
    inputRange: [0, safeFooterHeight],
    outputRange: [0, safeFooterHeight + 30],
    extrapolate: "clamp",
  });

  const headerHeight = clampedHeaderY.interpolate({
    inputRange: [0, safeHeaderHeight],
    outputRange: [safeHeaderHeight, 0], // collapse/expand
    extrapolate: "clamp",
  });

  const secondaryHeaderHeight = clampedSecondaryHeaderY.interpolate({
    inputRange: [0, safeSecondaryHeaderHeight],
    outputRange: [safeSecondaryHeaderHeight, 0], // collapse/expand
    extrapolate: "clamp",
  });

  const notificationHeight = clampedNotificationY.interpolate({
    inputRange: [0, safeNotificationHeight],
    outputRange: [safeNotificationHeight, 0], // collapse/expand
    extrapolate: "clamp",
  });

  // Add a ref to track if we're already animating to avoid multiple concurrent animations
  const isAnimatingToTop = useRef(false);

  // Update clamps on scroll
  const updateClampedValue = useCallback(
    (currentScroll: number) => {
      // Edge case: If at the top of scroll, force all elements to be visible
      if (currentScroll <= 0) {
        // Prevent multiple concurrent animations
        if (isAnimatingToTop.current) return;

        // Check if any element needs to be shown
        const needsAnimation =
          currentClampedFooter.current > 0 ||
          currentClampedHeader.current > 0 ||
          currentClampedSecondaryHeader.current > 0 ||
          currentClampedNotification.current > 0;

        if (needsAnimation) {
          isAnimatingToTop.current = true;

          // Update ref values immediately for consistency
          currentClampedFooter.current = 0;
          currentClampedHeader.current = 0;
          currentClampedSecondaryHeader.current = 0;
          currentClampedNotification.current = 0;

          // Animate all elements simultaneously for efficiency
          Animated.parallel([
            Animated.timing(clampedFooterY, {
              toValue: 0,
              duration: 150, // Slightly faster for snappier feel
              useNativeDriver: false,
            }),
            Animated.timing(clampedHeaderY, {
              toValue: 0,
              duration: 150,
              useNativeDriver: false,
            }),
            Animated.timing(clampedSecondaryHeaderY, {
              toValue: 0,
              duration: 150,
              useNativeDriver: false,
            }),
            Animated.timing(clampedNotificationY, {
              toValue: 0,
              duration: 150,
              useNativeDriver: false,
            }),
          ]).start(() => {
            isAnimatingToTop.current = false;
          });
        }

        lastScrollValue.current = currentScroll;
        return;
      }

      // Reset animation flag when not at top
      isAnimatingToTop.current = false;

      // Only process if there's meaningful movement
      const diff = currentScroll - lastScrollValue.current;
      if (Math.abs(diff) <= 0.5) {
        return; // Early exit for micro-scrolls
      }

      scrollDirection.current = diff > 0 ? "down" : "up";
      const dampingFactor = 0.3;
      const dampedDiff = Math.abs(diff) * dampingFactor;

      // Batch all calculations first
      let footerValue = currentClampedFooter.current;
      let headerValue = currentClampedHeader.current;
      let secondaryHeaderValue = currentClampedSecondaryHeader.current;
      let notificationValue = currentClampedNotification.current;

      // Footer behavior
      if (scrollDirection.current === "down") {
        footerValue = Math.min(safeFooterHeight, footerValue + dampedDiff);
      } else {
        footerValue = Math.max(0, footerValue - dampedDiff);
      }

      // Header behavior
      if (scrollDirection.current === "down") {
        headerValue = Math.min(safeHeaderHeight, headerValue + dampedDiff);
      } else {
        headerValue = Math.max(0, headerValue - dampedDiff);
      }

      // Secondary Header behavior
      if (scrollDirection.current === "down") {
        secondaryHeaderValue = Math.min(
          safeSecondaryHeaderHeight,
          secondaryHeaderValue + dampedDiff
        );
      } else {
        secondaryHeaderValue = Math.max(0, secondaryHeaderValue - dampedDiff);
      }

      // Notification behavior
      if (scrollDirection.current === "down") {
        notificationValue = Math.min(
          safeNotificationHeight,
          notificationValue + dampedDiff
        );
      } else {
        notificationValue = Math.max(0, notificationValue - dampedDiff);
      }

      // Update all values efficiently
      currentClampedFooter.current = footerValue;
      currentClampedHeader.current = headerValue;
      currentClampedSecondaryHeader.current = secondaryHeaderValue;
      currentClampedNotification.current = notificationValue;

      // Batch setValue calls
      clampedFooterY.setValue(footerValue);
      clampedHeaderY.setValue(headerValue);
      clampedSecondaryHeaderY.setValue(secondaryHeaderValue);
      clampedNotificationY.setValue(notificationValue);

      lastScrollValue.current = currentScroll;
    },
    [
      clampedFooterY,
      clampedHeaderY,
      clampedSecondaryHeaderY,
      clampedNotificationY,
      safeFooterHeight,
      safeHeaderHeight,
      safeSecondaryHeaderHeight,
      safeNotificationHeight,
    ]
  );

  React.useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      updateClampedValue(value);
    });
    return () => scrollY.removeListener(listener);
  }, [scrollY, updateClampedValue]);

  const snapToNearest = useCallback(() => {
    const snapFooter = () => {
      const currentValue = currentClampedFooter.current;
      const thresholdShow = 0.15 * safeFooterHeight;
      const thresholdHide = 0.8 * safeFooterHeight;
      let targetValue: number;

      if (currentValue <= thresholdShow) {
        targetValue = 0;
      } else if (currentValue >= thresholdHide) {
        targetValue = safeFooterHeight;
      } else {
        targetValue =
          scrollDirection.current === "up"
            ? 0
            : currentValue > 0.5 * safeFooterHeight
            ? safeFooterHeight
            : 0;
      }

      currentClampedFooter.current = targetValue;
      Animated.timing(clampedFooterY, {
        toValue: targetValue,
        duration: 120,
        useNativeDriver: false,
      }).start();
    };

    const snapHeader = () => {
      const currentValue = currentClampedHeader.current;
      const thresholdShow = 0.15 * safeHeaderHeight;
      const thresholdHide = 0.8 * safeHeaderHeight;
      let targetValue: number;

      if (currentValue <= thresholdShow) {
        targetValue = 0;
      } else if (currentValue >= thresholdHide) {
        targetValue = safeHeaderHeight;
      } else {
        targetValue =
          scrollDirection.current === "up"
            ? 0
            : currentValue > 0.5 * safeHeaderHeight
            ? safeHeaderHeight
            : 0;
      }

      currentClampedHeader.current = targetValue;
      Animated.timing(clampedHeaderY, {
        toValue: targetValue,
        duration: 120,
        useNativeDriver: false,
      }).start();
    };

    const snapSecondaryHeader = () => {
      const currentValue = currentClampedSecondaryHeader.current;
      const thresholdShow = 0.15 * safeSecondaryHeaderHeight;
      const thresholdHide = 0.8 * safeSecondaryHeaderHeight;
      let targetValue: number;

      if (currentValue <= thresholdShow) {
        targetValue = 0;
      } else if (currentValue >= thresholdHide) {
        targetValue = safeSecondaryHeaderHeight;
      } else {
        targetValue =
          scrollDirection.current === "up"
            ? 0
            : currentValue > 0.5 * safeSecondaryHeaderHeight
            ? safeSecondaryHeaderHeight
            : 0;
      }

      currentClampedSecondaryHeader.current = targetValue;
      Animated.timing(clampedSecondaryHeaderY, {
        toValue: targetValue,
        duration: 120,
        useNativeDriver: false,
      }).start();
    };

    const snapNotification = () => {
      const currentValue = currentClampedNotification.current;
      const thresholdShow = 0.15 * safeNotificationHeight;
      const thresholdHide = 0.8 * safeNotificationHeight;
      let targetValue: number;

      if (currentValue <= thresholdShow) {
        targetValue = 0;
      } else if (currentValue >= thresholdHide) {
        targetValue = safeNotificationHeight;
      } else {
        targetValue =
          scrollDirection.current === "up"
            ? 0
            : currentValue > 0.5 * safeNotificationHeight
            ? safeNotificationHeight
            : 0;
      }

      currentClampedNotification.current = targetValue;
      Animated.timing(clampedNotificationY, {
        toValue: targetValue,
        duration: 120,
        useNativeDriver: false,
      }).start();
    };

    snapFooter();
    snapHeader();
    snapSecondaryHeader();
    snapNotification();
  }, [
    clampedFooterY,
    clampedHeaderY,
    clampedSecondaryHeaderY,
    clampedNotificationY,
    safeFooterHeight,
    safeHeaderHeight,
    safeSecondaryHeaderHeight,
    safeNotificationHeight,
  ]);

  const onScrollEndDrag = useCallback(snapToNearest, [snapToNearest]);
  const onMomentumScrollEnd = useCallback(snapToNearest, [snapToNearest]);

  const resetFooterPosition = useCallback(() => {
    scrollY.setValue(0);
    clampedFooterY.setValue(0);
    clampedHeaderY.setValue(0);
    clampedSecondaryHeaderY.setValue(0);
    clampedNotificationY.setValue(0);
    currentClampedFooter.current = 0;
    currentClampedHeader.current = 0;
    currentClampedSecondaryHeader.current = 0;
    currentClampedNotification.current = 0;
    lastScrollValue.current = 0;
  }, [
    scrollY,
    clampedFooterY,
    clampedHeaderY,
    clampedSecondaryHeaderY,
    clampedNotificationY,
  ]);

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
        setHeaderHeight,
        headerHeightValue,
        headerHeight,
        setSecondaryHeaderHeight,
        secondaryHeaderHeightValue,
        secondaryHeaderHeight,
        setNotificationHeight,
        notificationHeightValue,
        notificationHeight,

        // Sort popup
        showSortPopup,
        selectedSort,
        propertyType: currentPropertyType,
        openSortPopup,
        closeSortPopup,
        setSelectedSort,

        // Status filter popup
        showStatusPopup,
        selectedStatus,
        openStatusPopup,
        closeStatusPopup,
        setSelectedStatus,

        // Category filter popup
        showCategoryPopup,
        selectedCategory,
        openCategoryPopup,
        closeCategoryPopup,
        setSelectedCategory,

        //New Enquiry popup
        showNewEnquiryPopup,
        openNewEnquiryPopup,
        closeNewEnquiryPopup,

        // Status info bottom sheet
        isStatusInfoOpen,
        currentStatusInfo,
        openStatusInfo: (status: string | null) => {
          setCurrentStatusInfo(status ?? null);
          setIsStatusInfoOpen(true);
        },
        closeStatusInfo: () => {
          setIsStatusInfoOpen(false);
          setCurrentStatusInfo(null);
        },
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
};

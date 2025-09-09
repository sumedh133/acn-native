import { useNavigation, usePathname, useRouter } from "expo-router";
import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  BackHandler,
} from "react-native";
import { StyleSheet, View, Dimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { ScrollContext } from "@/app/ScrollContext";
import ModularPopup from "./ModularPopup";
import StatusInfoBottomSheet from "../app/components/property/StatusInfoBottomSheet";
import NewEnquiriesModal from "@/app/components/property/NewEnquiriesModal";
import { ModalType, getModalItems } from "@/app/constants/footerModalOptions";
import { getPopupItems, menuItems } from "@/app/constants/footerConstants";
import { trackEvent } from "@/app/services/logAnalyticsService";

const FooterNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useNavigation();
  const { height } = Dimensions.get("window");
  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";
  const [popupAnimationFlag, setPopupAnimationFlag] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const navigateAtEndOfAnimation = useRef<string | null>(null);

  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(height)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  // Unified modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const modalSlideAnimation = useRef(new Animated.Value(height)).current;
  const modalOpacityAnimation = useRef(new Animated.Value(0)).current;

  const {
    footerTranslateY,
    resetFooterPosition,

    // Sort
    showSortPopup,
    propertyType,
    selectedSort,
    closeSortPopup,
    setSelectedSort,

    // Status
    showStatusPopup,
    selectedStatus,
    closeStatusPopup,
    setSelectedStatus,

    // Category
    showCategoryPopup,
    selectedCategory,
    closeCategoryPopup,
    setSelectedCategory,

    //New Enquiry
    showNewEnquiryPopup,
    closeNewEnquiryPopup,
    openNewEnquiryPopup,

    setFooterHeight,
    footerHeight,

    // Status info sheet state
    isStatusInfoOpen,
    currentStatusInfo,
    closeStatusInfo,
  } = useContext(ScrollContext);

  const rotate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  // Unified selection handler
  const handleSelection = (type: string, value: string) => {
    try {
      logEvent(analytics, `property_${type}_change`, {
        event_category: type,
        event_label: "property",
        [`${type}_value`]: value,
        user_type: userType,
      });
    } catch (error) {
      console.error(`Error logging ${type} change:`, error);
    }

    switch (type) {
      case "sort":
        setSelectedSort(value);
        closeSortPopup();
        break;
      case "status":
        setSelectedStatus(value);
        closeStatusPopup();
        break;
      case "listingType":
        setSelectedCategory(value);
        closeCategoryPopup();
        break;
    }

    setActiveModal(null);
  };

  // Unified close handler
  const closeActiveModal = () => {
    switch (activeModal) {
      case "sort":
        closeSortPopup();
        break;
      case "status":
        closeStatusPopup();
        break;
      case "listingType":
        closeCategoryPopup();
        break;
    }
    setActiveModal(null);
  };

  const handleCardPress = (item: any) => {
    try {
      const getDestinationFromId = (id: string) => {
        switch (id) {
          case "add_inventory":
            return "(pages)/Drafts";
          case "add_requirement":
            return "(tabs)/UserRequirementForm";
          default:
            return "";
        }
      };

      if (item.id == "add_inventory") {
        try {

          trackEvent("add_inventory_initiated").catch((error) => {
            console.error(`Error logging event: ${error}`);
          });
        } catch (error) {
          console.error(`Unexpected error: ${error}`);
        }
      }
      else {
        try {

          trackEvent("add_requirement_initiated").catch((error) => {
            console.error(`Error logging event: ${error}`);
          });
        } catch (error) {
          console.error(`Unexpected error: ${error}`);
        }
      }
    } catch (error) {
      console.error("Error logging popup selection:", error);
    }
  };
  const handleNavigation = (path: string) => {
    if (popupAnimationFlag) {
      setPopupAnimationFlag(false);
      navigateAtEndOfAnimation.current = path;
      return;
    }
    if (path === pathname) return;

    try {
      logEvent(analytics, "footer_navigation", {
        event_category: "navigation",
        event_label: "footer",
        from_path: pathname,
        to_path: path,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging navigation:", error);
    }

    setTimeout(() => {
      router.replace(path as any);
    }, 0);
  };

  const handlePopupCardClick = (path: string) => {
    setPopupAnimationFlag(false);
    if (path === pathname) return;

    try {
      logEvent(analytics, "popup_card_click", {
        event_category: "navigation",
        event_label: "popup",
        selected_path: path,
        from_path: pathname,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging popup card click:", error);
    }

    navigateAtEndOfAnimation.current = path;
  };

  useEffect(() => {
    if (resetFooterPosition) {
      resetFooterPosition();
    }
  }, [pathname, resetFooterPosition]);

  const handlePopupClick = () => {


    const newState = !popupAnimationFlag;

    if (newState) {
      // Close any active modals
      closeActiveModal();
    }
    if (newState) {
      try {

        trackEvent("addition_flow_initiated").catch((error) => {
          console.error(`Error logging event: ${error}`);
        });
      } catch (error) {
        console.error(`Unexpected error: ${error}`);
      }
    }

    setPopupAnimationFlag(newState);
  };

  const params = navigation?.getState()?.routes?.at(-1)?.params as {
    showFooter?: boolean;
  };

  useFocusEffect(
    React.useCallback(() => {
      const handleBackPress = () => {
        if (popupAnimationFlag) {
          setPopupAnimationFlag(false);
          return true;
        }
        if (activeModal) {
          closeActiveModal();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress
      );

      return () => {
        subscription.remove();
      };
    }, [popupAnimationFlag, activeModal])
  );

  useEffect(() => {
    if (popupAnimationFlag) setShowPopup(true);
    const rotateAnimationTemp = Animated.timing(rotateAnimation, {
      toValue: popupAnimationFlag ? 1 : 0,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    const slideAnimationTemp = Animated.timing(slideAnimation, {
      toValue: popupAnimationFlag ? 0 : height,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    const opacityAnimationTemp = Animated.timing(opacityAnimation, {
      toValue: popupAnimationFlag ? 1 : 0,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    Animated.parallel([
      rotateAnimationTemp,
      slideAnimationTemp,
      opacityAnimationTemp,
    ]).start((finished) => {
      if (!popupAnimationFlag && finished.finished) setShowPopup(false);
      if (
        navigateAtEndOfAnimation.current !== null &&
        navigateAtEndOfAnimation.current !== pathname
      ) {
        router.push(navigateAtEndOfAnimation.current as any);
        navigateAtEndOfAnimation.current = null;
      }
    });
  }, [popupAnimationFlag, rotateAnimation, slideAnimation, height]);

  // Unified modal effect
  useEffect(() => {
    const isAnyModalOpen =
      showSortPopup || showStatusPopup || showCategoryPopup;

    if (isAnyModalOpen) {
      // Close popup modal if it's open
      setPopupAnimationFlag(false);

      // Reset footer position when any modal opens
      resetFooterPosition?.();

      // Set active modal type
      if (showSortPopup) setActiveModal("sort");
      else if (showStatusPopup) setActiveModal("status");
      else if (showCategoryPopup) setActiveModal("listingType");
    } else {
      setActiveModal(null);
    }

    const modalSlideAnimationTemp = Animated.timing(modalSlideAnimation, {
      toValue: isAnyModalOpen ? 0 : height,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    const modalOpacityAnimationTemp = Animated.timing(modalOpacityAnimation, {
      toValue: isAnyModalOpen ? 1 : 0,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    Animated.parallel([
      modalSlideAnimationTemp,
      modalOpacityAnimationTemp,
    ]).start();
  }, [
    showSortPopup,
    showStatusPopup,
    showCategoryPopup,
    modalSlideAnimation,
    modalOpacityAnimation,
    height,
  ]);

  if (params?.showFooter === false) return null;

  const popupItems = getPopupItems(handlePopupCardClick);
  const modalItems = getModalItems(
    activeModal,
    selectedSort,
    selectedStatus,
    selectedCategory,
    handleSelection,
    propertyType,
  );

  return (
    <>
      {showPopup && (
        <Animated.View
          style={[
            styles.popupContainer,
            {
              opacity: opacityAnimation,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.popupTouch}
            onPress={(e) => handlePopupClick()}
          >
            <ModularPopup
              items={popupItems}
              slideAnimation={slideAnimation}
              onDragDown={() => handlePopupClick()}
              onItemPress={handleCardPress}
              dragThreshold={10}
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Unified Modal for Sort/Status/Category */}
      {activeModal && (
        <Animated.View
          style={[
            styles.popupContainerOverFooter,
            { opacity: modalOpacityAnimation },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.popupTouchOverFooter}
            onPress={closeActiveModal}
          >
            <ModularPopup
              items={modalItems}
              slideAnimation={modalSlideAnimation}
              onDragDown={closeActiveModal}
              dragThreshold={10}
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      <Animated.View
        onLayout={(e) => {
          const { height } = e.nativeEvent.layout;
          if (footerHeight === null) {
            setFooterHeight(height + 25);
          }
        }}
        style={[
          styles.footer,
          {
            transform: [{ translateY: footerTranslateY }],
          },
        ]}
      >
        {menuItems?.map((item, idx) => {
          const active = item?.path === pathname;
          if (item?.path === "/add") {
            return (
              <TouchableOpacity
                onPress={() => handlePopupClick()}
                key={idx}
                activeOpacity={1}
              >
                <Animated.View
                  style={[
                    styles.addItem,
                    {
                      transform: [{ translateY: -18.5 }, { rotate }],
                    },
                  ]}
                >
                  {item?.icon}
                </Animated.View>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              onPress={() => handleNavigation(item?.path)}
              key={idx}
            >
              <View style={active ? styles.activeItem : styles.item}>
                {active && <View style={styles.activeBar}></View>}
                <View style={{ position: "relative" }}>
                  {active ? item?.activeIcon : item?.icon}
                </View>
                <Text style={active ? styles.itemActiveText : styles.itemText}>
                  {item?.title}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Mounted at footer so it anchors to bottom nav */}
      <StatusInfoBottomSheet
        visible={isStatusInfoOpen}
        status={currentStatusInfo}
        onClose={closeStatusInfo}
      />
      <NewEnquiriesModal
        visible={showNewEnquiryPopup}
        onClose={closeNewEnquiryPopup}
        onCheckNow={() => {
          console.log("NewEnquiriesModal: Check Now clicked");
          closeNewEnquiryPopup();
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  popupContainer: {
    position: "absolute",
    zIndex: 100,
    width: "100%",
    height: "100%",
    backgroundColor: "#00000033",
  },
  popupContainerOverFooter: {
    position: "absolute",
    zIndex: 105,
    width: "100%",
    height: "100%",
    backgroundColor: "#00000033",
  },
  popupTouch: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    paddingBottom: 55,
  },
  popupTouchOverFooter: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    zIndex: 105,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9.5,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    zIndex: 101,
  },
  addItem: {
    width: 56,
    height: 56,
    marginHorizontal: 4,
    backgroundColor: "#153E3B",
    borderRadius: 100,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    transformOrigin: "center",
  },
  activeBar: {
    width: 52,
    position: "absolute",
    top: 0,
    height: 3,
    backgroundColor: "#153E3B",
    borderRadius: 4,
  },
  activeItem: {
    position: "relative",
    width: 79,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  item: {
    width: 79,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  itemText: {
    fontSize: 10,
    fontWeight: 400,
    fontFamily: "Lato",
    color: "#433F3E",
  },
  itemActiveText: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "Lato",
    color: "#10302D",
  },
  notificationDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E53935",
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 1,
  },
});

export default FooterNavigation;

import ActiveDashboardIcon from "@/assets/icons/svg/Footer/ActiveDashboardIcon";
import ActiveNotificationIcon from "@/assets/icons/svg/Footer/ActiveNotificationsIcon";
import ActivePropertiesIcon from "@/assets/icons/svg/Footer/ActivePropertiesIcon";
import ActiveRequirementsIcon from "@/assets/icons/svg/Footer/ActiveRequirementsIcon";
import DashboardIcon from "@/assets/icons/svg/Footer/DashboardIcon";
import NotificationIcon from "@/assets/icons/svg/Footer/NotificationIcon";
import PropertiesIcon from "@/assets/icons/svg/Footer/PropertiesIcon";
import RequirementsIcon from "@/assets/icons/svg/Footer/RequirementsIcon";
import PlusIcon from "@/assets/icons/svg/Common/PlusIcon";
import { useNavigation, usePathname, useRouter } from "expo-router";
import React, { ReactNode, useState, useRef, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  BackHandler,
} from "react-native";
import { StyleSheet, View, Dimensions } from "react-native";
import AddPopup from "./AddPopup";
import { useFocusEffect } from "@react-navigation/native";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface MenuItem {
  title: string;
  path: string;
  icon: ReactNode;
  activeIcon: ReactNode;
}

const menuItems: MenuItem[] = [
  {
    title: "Properties",
    path: "/properties",
    icon: <PropertiesIcon width={24} height={24} />,
    activeIcon: <ActivePropertiesIcon width={24} height={24} />,
  },
  {
    title: "Requirements",
    path: "/requirements",
    icon: <RequirementsIcon width={24} height={24} />,
    activeIcon: <ActiveRequirementsIcon width={24} height={24} />,
  },
  // {
  //   title: "Notifications",
  //   path: "/NotificationPage",
  //   icon: <NotificationIcon width={24} height={24} />,
  //   activeIcon: <ActiveNotificationIcon width={24} height={24} />,
  // },
  {
    title: "Dashboard",
    path: "/dashboardTab",
    icon: <DashboardIcon width={24} height={24} />,
    activeIcon: <ActiveDashboardIcon width={24} height={24} />,
  },
  {
    title: "",
    path: "/add",
    icon: <PlusIcon width={24} height={24} />,
    activeIcon: null,
  },
];

const FooterNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useNavigation();
  const { height } = Dimensions.get("window");
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  const [popupAnimationFlag, setPopupAnimationFlag] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const navigateAtEndOfAnimation = useRef<string | null>(null);

  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(height)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  const rotate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const handleNavigation = (path: string) => {
    if (popupAnimationFlag) {
      setPopupAnimationFlag(false);
      navigateAtEndOfAnimation.current = path;
      return;
    }
    if (path === pathname) return;
    
    try {
      logEvent(analytics, 'footer_navigation', {
        event_category: 'navigation',
        event_label: 'footer',
        from_path: pathname,
        to_path: path,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging navigation:', error);
    }

    setTimeout(() => {
      router.replace(path as any);
    }, 0);
  };

  const handlePopupCardClick = (path: string) => {
    setPopupAnimationFlag(false);
    if (path === pathname) return;
    
    try {
      logEvent(analytics, 'popup_card_click', {
        event_category: 'navigation',
        event_label: 'popup',
        selected_path: path,
        from_path: pathname,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging popup card click:', error);
    }

    navigateAtEndOfAnimation.current = path;
  };

  const handlePopupClick = () => {
    const newState = !popupAnimationFlag;
    
    try {
      logEvent(analytics, newState ? 'open_add_popup' : 'close_add_popup', {
        event_category: 'interaction',
        event_label: 'popup',
        action: newState ? 'open' : 'close',
        current_path: pathname,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging popup interaction:', error);
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
        return false;
      };

      // Add back press event listener
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress
      );

      // Cleanup
      return () => {
        subscription.remove();
      };
    }, [popupAnimationFlag])
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

  if (params?.showFooter === false) return null;

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
            <AddPopup
              handlePopupCardPress={handlePopupCardClick}
              slideAnimation={slideAnimation}
              onDragDown={() => handlePopupClick()}
            />
          </TouchableOpacity>
        </Animated.View>
      )}
      <View style={styles.footer}>
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
                {active ? item?.activeIcon : item?.icon}
                <Text style={active ? styles.itemActiveText : styles.itemText}>
                  {item?.title}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
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
  popupTouch: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    paddingBottom: 59,
  },
  footer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 59,
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
});

export default FooterNavigation;

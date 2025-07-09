import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { NotificationItem } from "@/app/types";
import NotificationCard from "./NotificationCard";

import MarkasRead from "@/assets/icons/Notification/MarkAsReadInDark.svg";
import MarkAsUnread from "@/assets/icons/Notification/markAsUnread.svg";
import Archieve from "@/assets/icons/Notification/Archieve.svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25; // 25% of screen width
const ACTION_WIDTH = 80;

interface SwipeableNotificationCardProps {
  notification: NotificationItem;
  addedTime: number;
  onCtaPress?: (action: string, notification: NotificationItem) => void;
  onArchive?: (notification: NotificationItem) => void;
  onToggleRead?: (notification: NotificationItem) => void;
}

const SwipeableNotificationCard: React.FC<SwipeableNotificationCardProps> = ({
  notification,
  addedTime,
  onCtaPress,
  onArchive,
  onToggleRead,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const handleGestureStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.BEGAN) {
      // Light haptic feedback when gesture begins
    } else if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;

      // Determine if we should trigger an action based on distance and velocity
      const shouldTriggerAction =
        Math.abs(translationX) > SWIPE_THRESHOLD || Math.abs(velocityX) > 500;

      if (shouldTriggerAction) {
        if (translationX > 0) {
          // Swiped right - Archive
          handleArchive();
        } else {
          // Swiped left - Toggle read/unread
          handleToggleRead();
        }
      } else {
        // Return to original position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  };

  const handleArchive = () => {
    // Trigger haptic feedback

    // Animate the card away
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onArchive?.(notification);
    });
  };

  const handleToggleRead = () => {
    // Trigger haptic feedback

    // Animate the card briefly with faster timing
    Animated.sequence([
      Animated.timing(translateX, {
        toValue: -SCREEN_WIDTH * 0.05, // Reduced distance
        duration: 80, // Reduced from 150ms to 80ms
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 200, // Increased from 100 to 200 for faster spring
        friction: 10, // Slightly increased for better control
      }),
    ]).start(() => {
      onToggleRead?.(notification);
    });
  };

  const renderRightAction = () => {
    const actionOpacity = translateX.interpolate({
      inputRange: [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      outputRange: [0, 0.5, 1],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.rightAction,
          {
            opacity: actionOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleArchive}
          activeOpacity={0.7}
        >
          <View style={styles.actionButtonContentRight}>
            <Archieve width={24} height={24} />
            <Text style={styles.actionText}>Archive</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderLeftAction = () => {
    const actionOpacity = translateX.interpolate({
      inputRange: [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: "clamp",
    });

    const isRead = notification.isRead;

    return (
      <Animated.View
        style={[
          styles.leftAction,
          {
            backgroundColor: isRead ? "#DFF4F3" : "#fff",
            opacity: actionOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleToggleRead}
          activeOpacity={0.7}
        >
          <View style={styles.actionButtonContentLeft}>
            {isRead ? (
              <MarkAsUnread width={24} height={24} />
            ) : (
              <MarkasRead width={24} height={24} />
            )}
            <Text style={styles.actionText}>{isRead ? "Unread" : "Read"}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {renderRightAction()}
      {renderLeftAction()}
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureStateChange}
        activeOffsetX={[-10, 10]} // Both directions
        failOffsetY={[-5, 5]}
      >
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{ translateX }, { scale }],
              opacity,
            },
          ]}
        >
          <NotificationCard
            notification={notification}
            addedTime={addedTime}
            onCtaPress={onCtaPress}
          />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  cardContainer: {
    backgroundColor: "#fff",
    zIndex: 1,
  },
  rightAction: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "#EFB8C8",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  leftAction: {
    position: "absolute",
    flexDirection: "row",
    right: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    zIndex: 0,
  },
  actionButtonContentRight: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-start",
    alignContent: "flex-start",
    alignSelf: "flex-start",
    paddingLeft: 32,
    gap: 8,
  },
  actionButtonContentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    alignContent: "flex-end",
    alignSelf: "flex-end",
    paddingRight: 32,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  actionText: {
    fontSize: 12,
    color: "#000",
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    marginTop: 4,
  },
});

export default SwipeableNotificationCard;

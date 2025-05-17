import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface AnimatedTooltipProps {
  message: string;
}

const AnimatedTooltip = ({ message }: AnimatedTooltipProps) => {
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  useEffect(() => {
    if (visible) {
      try {
        logEvent(analytics, 'tooltip_show', {
          event_category: 'interaction',
          event_label: 'tooltip',
          message: message,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging tooltip show:', error);
      }

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide tooltip after delay
      const timer = setTimeout(() => {
        hideTooltip();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideTooltip = () => {
    try {
      logEvent(analytics, 'tooltip_hide', {
        event_category: 'interaction',
        event_label: 'tooltip',
        message: message,
        hide_type: 'auto',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging tooltip hide:', error);
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  };

  const toggleTooltip = () => {
    const newState = !visible;
    try {
      logEvent(analytics, newState ? 'tooltip_toggle' : 'tooltip_hide', {
        event_category: 'interaction',
        event_label: 'tooltip',
        action: newState ? 'show' : 'hide',
        message: message,
        hide_type: newState ? null : 'manual',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging tooltip toggle:', error);
    }
    setVisible(newState);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleTooltip} activeOpacity={0.7}>
        <MaterialIcons name="info-outline" size={22} color="#5A5555" />
      </TouchableOpacity>

      {visible && (
        <Animated.View
          style={[
            styles.tooltip,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.tooltipText}>{message}</Text>
          <View style={styles.arrow} />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    padding: 0,
  },
  tooltip: {
    position: "absolute",
    bottom: 35,
    right: -30, // Position to center above the button
    backgroundColor: "#2B2928",
    padding: 10,
    borderRadius: 8,
    width: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 999,
  },
  tooltipText: {
    right: 0,
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
    zIndex: 999,
  },
  arrow: {
    position: "absolute",
    bottom: -10,
    right: 30, // Align with the info icon
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderStyle: "solid",
    backgroundColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#2B2928",
  },
});

export default AnimatedTooltip;

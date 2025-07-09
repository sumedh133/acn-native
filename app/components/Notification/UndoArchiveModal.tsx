import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { NotificationItem } from "@/app/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AUTO_DISMISS_TIME = 5000; // 5 seconds

interface UndoArchiveModalProps {
  visible: boolean;
  notification?: NotificationItem | null;
  onUndo: () => void;
  onDismiss: () => void;
}

const UndoArchiveModal: React.FC<UndoArchiveModalProps> = ({
  visible,
  notification,
  onUndo,
  onDismiss,
}) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (visible) {
      // Show modal
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after timeout
      timeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, AUTO_DISMISS_TIME);
    } else {
      // Hide modal
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible]);

  const handleUndo = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onUndo();
  };

  const handleDismiss = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onDismiss();
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.messageContainer}>
          <MaterialIcons name="archive" size={20} color="#666" />
          <Text style={styles.message}>Notification archived</Text>
        </View>

        <TouchableOpacity
          style={styles.undoButton}
          onPress={handleUndo}
          activeOpacity={0.7}
        >
          <Text style={styles.undoText}>UNDO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleDismiss}
          activeOpacity={0.7}
        >
          <MaterialIcons name="close" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  content: {
    backgroundColor: "#323232",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  message: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 8,
    fontFamily: "Inter_400Regular",
  },
  undoButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  undoText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  closeButton: {
    padding: 4,
  },
});

export default UndoArchiveModal;

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { NotificationItem } from "@/app/types";
import useNotification from "./useNotification";
import SwipeableArchivedNotificationCard from "./SwipeableArchivedNotificationCard";
import NoNotificationsIcon from "@/assets/icons/InAppNotifications/noNotifications.svg";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { showSuccessToast } from "@/utils/toastUtils";

const ArchivedNotifications: React.FC = () => {
  const navigation = useNavigation();
  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";

  const {
    getArchivedNotifications,
    unarchiveNotification,
    markAsRead,
    markAsUnRead,
  } = useNotification();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchArchived = useCallback(async () => {
    setIsLoading(true);
    try {
      const archived = await getArchivedNotifications();
      setNotifications(archived || []);
    //   console.log(notifications, "archived");
    } catch (error) {
      console.error("Error fetching archived notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getArchivedNotifications]);

  useEffect(() => {
    fetchArchived();

    // Track page view
    try {
      logEvent(analytics, "archived_notification_page_view", {
        event_category: "notifications",
        event_label: "archived_notifications",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging archived notifications page view:", error);
    }
  }, []);

  const handleUnarchive = async (notification: NotificationItem) => {
    try {
      const notificationId = notification.notificationId || notification.id;
      await unarchiveNotification(notificationId);
      // Remove from local state
      setNotifications((prev) =>
        prev.filter((n) => (n.notificationId || n.id) !== notificationId)
      );
      showSuccessToast("Notification restored");

      // Analytics
      try {
        logEvent(analytics, "notification_unarchived", {
          event_category: "notifications",
          event_label: "unarchive",
          notification_type: notification.type,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging unarchive event:", error);
      }
    } catch (error) {
      console.error("Error unarchiving notification:", error);
    }
  };

  const handleToggleRead = async (notification: NotificationItem) => {
    try {
      const notificationId = notification.notificationId || notification.id;
      if (notification.isRead) {
        await markAsUnRead(notificationId);
        setNotifications((prev) =>
          prev.map((n) =>
            (n.notificationId || n.id) === notificationId
              ? { ...n, isRead: false }
              : n
          )
        );
      } else {
        await markAsRead(notificationId);
        setNotifications((prev) =>
          prev.map((n) =>
            (n.notificationId || n.id) === notificationId
              ? { ...n, isRead: true }
              : n
          )
        );
      }
    } catch (error) {
      console.error("Error toggling read status:", error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#153E3B" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#153E3B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Archived Notifications</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <NoNotificationsIcon width={293} height={429} />
          </View>
        ) : (
          <ScrollView>
            {notifications.map((notification, index) => (
              <SwipeableArchivedNotificationCard
                key={`${notification.id || index}-${notification.addedTime}`}
                notification={notification}
                addedTime={notification.addedTime}
                onUnarchive={handleUnarchive}
                onToggleRead={handleToggleRead}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 16,
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Lato_700Bold",
    letterSpacing: 0.25,
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ArchivedNotifications;

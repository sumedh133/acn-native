// Enquired on your property
// New Feature Alert
// You have successfully Enquired a property
// Going to be De-Listd Property Alert
// De-Listed Property Alert
// Status Update on Property
// Listing Updates
// Credits Purchased
// Listing Submitted
// Premium Purchased
// Requirement Posted
// Your Free Trial has ended
// Trial Expires in 20 days
// Free trial is live

import { NotificationItem } from "@/app/types";
import SwipeableNotificationCard from "./SwipeableNotificationCard";
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import NoNotificationsIcon from "@/assets/icons/InAppNotifications/noNotifications.svg";

interface NotificationsProps {
  notifications: NotificationItem[];
  onCtaPress?: (action: string, notification: NotificationItem) => void;
  onArchive?: (notification: NotificationItem) => void;
  onToggleRead?: (notification: NotificationItem) => void;
  onRestoreNotification?: (
    callback: (notification: NotificationItem) => void
  ) => void;
  onFinalArchive?: (callback: (notification: NotificationItem) => void) => void;
  isLoading?: boolean;
}

const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  onCtaPress,
  onArchive,
  onToggleRead,
  onRestoreNotification,
  onFinalArchive,
  isLoading = false,
}) => {
  // Local state to manage visible notifications
  const [visibleNotifications, setVisibleNotifications] =
    useState<NotificationItem[]>(notifications);
  // Track notifications that are temporarily hidden (for undo)
  const [hiddenNotificationIds, setHiddenNotificationIds] = useState<string[]>(
    []
  );

  // Update visible notifications when props change
  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  // Handle local archive (hide from UI immediately)
  const handleLocalArchive = useCallback(
    (notification: NotificationItem) => {
      const notificationId = notification.notificationId || notification.id;

      console.log("=== Notifications.tsx - handleLocalArchive ===");
      console.log("Full notification object:", notification);
      console.log("Resolved notificationId:", notificationId);
      console.log("notification.id:", notification.id);
      console.log("notification.notificationId:", notification.notificationId);

      // Add to hidden list instead of removing completely
      setHiddenNotificationIds((prev) => [...prev, notificationId]);

      // Call parent archive handler
      onArchive?.(notification);
    },
    [onArchive]
  );

  // Handle restore notification (show it again)
  const handleRestoreNotification = useCallback(
    (notification: NotificationItem) => {
      console.log("handleRestoreNotification called with:", notification);
      const notificationId = notification.notificationId || notification.id;

      // Remove from hidden list to show it again
      setHiddenNotificationIds((prev) => {
        const newHiddenIds = prev.filter((id) => id !== notificationId);
        console.log(
          "Removing from hidden list, was hidden:",
          prev.includes(notificationId)
        );
        console.log("New hidden count:", newHiddenIds.length);
        return newHiddenIds;
      });
    },
    []
  );

  // Handle final archive (permanently remove from local state)
  const handleFinalArchiveLocal = useCallback(
    (notification: NotificationItem) => {
      console.log("handleFinalArchiveLocal called with:", notification);
      const notificationId = notification.notificationId || notification.id;

      // Remove from both visible notifications and hidden list
      setVisibleNotifications((prev) =>
        prev.filter((n) => (n.notificationId || n.id) !== notificationId)
      );

      setHiddenNotificationIds((prev) =>
        prev.filter((id) => id !== notificationId)
      );
    },
    []
  );

  // Register the restore callback with parent
  useEffect(() => {
    if (onRestoreNotification) {
      console.log("Registering restore callback with parent");
      onRestoreNotification(handleRestoreNotification);
    }
  }, [onRestoreNotification, handleRestoreNotification]);

  // Register the final archive callback with parent
  useEffect(() => {
    if (onFinalArchive) {
      console.log("Registering final archive callback with parent");
      onFinalArchive(handleFinalArchiveLocal);
    }
  }, [onFinalArchive, handleFinalArchiveLocal]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#153E3B" />
      </View>
    );
  }

  // Filter out hidden notifications
  const displayedNotifications = visibleNotifications.filter((notification) => {
    const notificationId = notification.notificationId || notification.id;
    return !hiddenNotificationIds.includes(notificationId);
  });

  return (
    <View style={{ flex: 1, height: "100%" }}>
      {displayedNotifications.length == 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <NoNotificationsIcon width={293} height={429} />
        </View>
      ) : (
        <ScrollView>
          {displayedNotifications.map((notification, index) => (
            <React.Fragment
              key={`${notification.id || index}-${notification.addedTime}`}
            >
              <SwipeableNotificationCard
                notification={notification}
                onCtaPress={onCtaPress}
                onArchive={handleLocalArchive}
                onToggleRead={onToggleRead}
                addedTime={notification.addedTime}
              />
            </React.Fragment>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Notifications;

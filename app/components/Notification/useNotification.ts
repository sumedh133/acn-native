import messaging from "@react-native-firebase/messaging";
import * as firebaseMessaging from "@react-native-firebase/messaging";
import {
  arrayUnion,
  doc,
  onSnapshot,
  updateDoc,
  collection,
  getDocs,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { PermissionsAndroid, Platform } from "react-native";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useState, useEffect } from "react";
import { NotificationItem } from "@/app/types";

export type NotificationFilter =
  | "all"
  | "connects"
  | "asks"
  | "listing"
  | "billing";

export default function useNotification() {
  // const cpId =
  //   useSelector((state: RootState) => state?.agent?.docData?.cpId) || null;
  const cpId = "INT055";
  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    NotificationItem[]
  >([]);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  // const unreadCount = 2;

  // Map notification types to filter categories
  const notificationTypeToFilter: Record<string, NotificationFilter> = {
    enquiry_buyer_notification: "connects",
    enquiry_seller_notification: "connects",
    listing_live_notification: "listing",
    going_to_be_delisted: "listing",
    delistied_notification: "listing",
    qc_notification: "listing",
    add_inventory_notification: "listing",
    payment_notification: "billing",
    trial_ended_notification: "billing",
    trial_notification: "billing",
  };

  const requestUserPermission = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        logEvent(analytics, "notification_permission_request", {
          event_category: "notifications",
          event_label: "permission",
          platform: "android",
          status: granted,
          user_type: userType,
        });

        if (granted === "granted") {
          console.log("GRANTED");
        } else {
          console.log("NOT GRANTED");
        }
      } else {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === firebaseMessaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === firebaseMessaging.AuthorizationStatus.PROVISIONAL;

        logEvent(analytics, "notification_permission_request", {
          event_category: "notifications",
          event_label: "permission",
          platform: "ios",
          status: enabled ? "granted" : "denied",
          auth_status: authStatus,
          user_type: userType,
        });

        if (enabled) {
          console.log("Authorization status:", enabled);
        }
      }
    } catch (error) {
      logEvent(analytics, "notification_permission_error", {
        event_category: "notifications",
        event_label: "error",
        platform: Platform.OS,
        error_message: error instanceof Error ? error.message : "Unknown error",
        user_type: userType,
      });
      console.error("Error requesting permission:", error);
    }
  };

  const getToken = async () => {
    try {
      const token = await messaging().getToken();
      const docRef = doc(db, "acnAgents", cpId);
      await updateDoc(docRef, {
        fsmToken: arrayUnion(token),
      });

      logEvent(analytics, "fcm_token_refresh", {
        event_category: "notifications",
        event_label: "success",
        token_updated: true,
        user_type: userType,
      });
    } catch (error) {
      logEvent(analytics, "fcm_token_error", {
        event_category: "notifications",
        event_label: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
        user_type: userType,
      });
      console.error("Failed to get FCM Token", error);
    }
    return "";
  };

  useEffect(() => {
    if (!cpId) return;

    const docRef = doc(db, "acnNotifications", cpId);

    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const notificationsData: NotificationItem[] = data.notifications || [];
        // Filter out archived notifications and sort
        const sortedNotifications = notificationsData
          .filter((n) => !n.archived)
          .sort((a, b) => b.addedTime - a.addedTime);
        setNotifications(sortedNotifications);
        setUnreadCount(sortedNotifications.filter((n) => !n.isRead).length);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [cpId]);

  // Filter notifications based on active filter
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredNotifications(notifications);
    } else {
      const filtered = notifications.filter(
        (notification) =>
          notificationTypeToFilter[notification.type] === activeFilter
      );
      setFilteredNotifications(filtered);
    }
  }, [activeFilter, notifications]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      console.log("=== useNotification.ts - markAsRead ===");
      console.log("Marking notification as read, ID:", notificationId);

      const docRef = doc(db, "acnNotifications", cpId);

      // Get the current complete notifications array from database
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;
      const allNotifications: NotificationItem[] =
        docSnap.data().notifications || [];

      const updatedNotifications = allNotifications.map((notification) =>
        notification.id === notificationId ||
        notification.notificationId === notificationId
          ? { ...notification, isRead: true }
          : notification
      );
      console.log("Database update completed for markAsRead");
      await updateDoc(docRef, { notifications: updatedNotifications });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAsUnRead = async (notificationId: string) => {
    try {
      console.log("=== useNotification.ts - markAsUnRead ===");
      console.log("Marking notification as unread, ID:", notificationId);

      const docRef = doc(db, "acnNotifications", cpId);

      // Get the current complete notifications array from database
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;
      const allNotifications: NotificationItem[] =
        docSnap.data().notifications || [];

      const updatedNotifications = allNotifications.map((notification) =>
        notification.id === notificationId ||
        notification.notificationId === notificationId
          ? { ...notification, isRead: false }
          : notification
      );
      console.log("Database update completed for markAsUnRead");
      await updateDoc(docRef, { notifications: updatedNotifications });
    } catch (error) {
      console.error("Error marking notification as unread:", error);
    }
  };

  // Mark all visible notifications as read
  const markAllVisibleAsRead = async () => {
    try {
      const docRef = doc(db, "acnNotifications", cpId);
      // Get the current notifications array
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;
      const notifications: NotificationItem[] =
        docSnap.data().notifications || [];
      // Mark all as read
      const updatedNotifications = notifications.map((notification) =>
        !notification.isRead ? { ...notification, isRead: true } : notification
      );
      await updateDoc(docRef, { notifications: updatedNotifications });
    } catch (error) {
      console.error("Error marking all visible notifications as read:", error);
    }
  };

  // Debug function to inspect notifications in database
  const debugNotificationsInDB = async () => {
    try {
      const docRef = doc(db, "acnNotifications", cpId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.log("No notifications document found");
        return;
      }

      const allNotifications: NotificationItem[] =
        docSnap.data().notifications || [];
      console.log("=== DATABASE DEBUG ===");
      console.log("Total notifications in DB:", allNotifications.length);

      allNotifications.forEach((notif, index) => {
        console.log(`Notification ${index}:`, {
          id: notif.id,
          notificationId: notif.notificationId,
          title: notif.title,
          archived: notif.archived,
          type: notif.type,
        });
      });

      // Check for duplicate IDs
      const ids = allNotifications.map((n) => n.id).filter(Boolean);
      const notificationIds = allNotifications
        .map((n) => n.notificationId)
        .filter(Boolean);
      const duplicateIds = ids.filter(
        (item, index) => ids.indexOf(item) !== index
      );
      const duplicateNotificationIds = notificationIds.filter(
        (item, index) => notificationIds.indexOf(item) !== index
      );

      if (duplicateIds.length > 0) {
        console.warn("Duplicate IDs found:", duplicateIds);
      }
      if (duplicateNotificationIds.length > 0) {
        console.warn(
          "Duplicate notificationIds found:",
          duplicateNotificationIds
        );
      }
    } catch (error) {
      console.error("Error debugging notifications:", error);
    }
  };

  // Mark notification as archived
  const archiveNotification = async (notificationId: string) => {
    try {
      console.log("=== useNotification.ts - archiveNotification ===");
      console.log("Archiving notification with ID:", notificationId);

      // First debug the current state
      await debugNotificationsInDB();

      const docRef = doc(db, "acnNotifications", cpId);

      // Get the current complete notifications array from database (including archived ones)
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error("No notifications document found");
        return;
      }

      const allNotifications: NotificationItem[] =
        docSnap.data().notifications || [];
      console.log("Total notifications in DB:", allNotifications.length);

      // Find matching notifications (there should be only one)
      const matchingNotifications = allNotifications.filter(
        (notification) =>
          notification.id === notificationId ||
          notification.notificationId === notificationId
      );

      console.log(
        "Matching notifications found:",
        matchingNotifications.length
      );
      matchingNotifications.forEach((notif, index) => {
        console.log(`Match ${index}:`, {
          id: notif.id,
          notificationId: notif.notificationId,
          title: notif.title,
          archived: notif.archived,
        });
      });

      if (matchingNotifications.length === 0) {
        console.error("No matching notification found for ID:", notificationId);
        return;
      }

      if (matchingNotifications.length > 1) {
        console.warn(
          "Multiple matching notifications found! This could cause issues."
        );
      }

      // Update only the specific notification - check both id and notificationId fields
      const updatedNotifications = allNotifications.map((notification) => {
        const matches =
          notification.id === notificationId ||
          notification.notificationId === notificationId;
        if (matches) {
          console.log("Found matching notification to archive:", {
            id: notification.id,
            notificationId: notification.notificationId,
            title: notification.title,
          });
          return { ...notification, archived: true };
        }
        return notification;
      });

      const newArchivedCount = updatedNotifications.filter(
        (n) => n.archived
      ).length;
      const oldArchivedCount = allNotifications.filter(
        (n) => n.archived
      ).length;
      console.log(`Archived count: ${oldArchivedCount} -> ${newArchivedCount}`);

      await updateDoc(docRef, { notifications: updatedNotifications });
      console.log("Database update completed");
    } catch (error) {
      console.error("Error archiving notification:", error);
    }
  };

  // Migrate notifications from array to subcollection
  const migrateNotifications = async () => {
    if (!cpId) return;
    try {
      const notificationsDoc = await getDoc(doc(db, "acnNotifications", cpId));
      if (notificationsDoc.exists()) {
        const notifications = notificationsDoc.data().notifications || [];
        for (const notif of notifications) {
          await setDoc(
            doc(db, "acnNotifications", cpId, "items", notif.id),
            notif
          );
        }
        console.log("Migration complete!");
      } else {
        console.log("No notifications found for this cpId.");
      }
    } catch (error) {
      console.error("Error migrating notifications:", error);
    }
  };

  const getArchivedNotifications = async () => {
    const docRef = doc(db, "acnNotifications", cpId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;
    const notifications: NotificationItem[] =
      docSnap.data().notifications || [];
    return notifications.filter((n) => n.archived);
  };

  const getArchivedNotificationsCount = async () => {
    const docRef = doc(db, "acnNotifications", cpId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;
    const notifications: NotificationItem[] =
      docSnap.data().notifications || [];
    return notifications.filter((n) => n.archived).length;
  };

  const unarchiveNotification = async (notificationId: string) => {
    try {
      console.log("=== useNotification.ts - unarchiveNotification ===");
      console.log("Unarchiving notification with ID:", notificationId);

      const docRef = doc(db, "acnNotifications", cpId);

      // Get the current complete notifications array from database (including archived ones)
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error("No notifications document found");
        return;
      }

      const allNotifications: NotificationItem[] =
        docSnap.data().notifications || [];

      // Update only the specific notification - check both id and notificationId fields
      const updatedNotifications = allNotifications.map((notification) => {
        const matches =
          notification.id === notificationId ||
          notification.notificationId === notificationId;
        if (matches) {
          return { ...notification, archived: false };
        }
        return notification;
      });

      await updateDoc(docRef, { notifications: updatedNotifications });
      console.log("Database update completed for unarchive");
    } catch (error) {
      console.error("Error unarchiving notification:", error);
    }
  };

  // Optionally return any functions you might want to expose
  return {
    refreshToken: getToken,
    requestPermission: requestUserPermission,
    notifications: filteredNotifications,
    unreadCount,
    activeFilter,
    setActiveFilter,
    markAsRead,
    markAsUnRead,
    markAllVisibleAsRead,
    archiveNotification,
    migrateNotifications,
    isLoading,
    getArchivedNotifications,
    getArchivedNotificationsCount,
    unarchiveNotification,
  };
}

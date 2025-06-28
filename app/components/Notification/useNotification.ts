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
  const cpId =
    useSelector((state: RootState) => state?.agent?.docData?.cpId) || null;
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
      const docRef = doc(db, "acnNotifications", cpId);
      const updatedNotifications = notifications.map((notification) =>
        notification.notificationId === notificationId
          ? { ...notification, isRead: true }
          : notification
      );
      console.log(updatedNotifications, "updatedNotifications");
      await updateDoc(docRef, { notifications: updatedNotifications });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAsUnRead = async (notificationId: string) => {
    try {
      console.log(notificationId, "notificationId");
      const docRef = doc(db, "acnNotifications", cpId);
      const updatedNotifications = notifications.map((notification) =>
        notification.notificationId === notificationId
          ? { ...notification, isRead: false }
          : notification
      );
      console.log(updatedNotifications, "updatedNotifications");
      await updateDoc(docRef, { notifications: updatedNotifications });
    } catch (error) {
      console.error("Error marking notification as read:", error);
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

  // Mark notification as archived
  const archiveNotification = async (notificationId: string) => {
    try {
      console.log(notificationId, "blablablabla");
      const docRef = doc(db, "acnNotifications", cpId);
      const updatedNotifications = notifications.map((notification) =>
        notification.notificationId === notificationId
          ? { ...notification, archived: true }
          : notification
      );
      await updateDoc(docRef, { notifications: updatedNotifications });
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

  // Optionally return any functions you might want to expose
  return {
    refreshToken: getToken,
    requestPermission: requestUserPermission,
    notifications: filteredNotifications,
    unreadCount,
    activeFilter,
    setActiveFilter,
    markAsRead,
    markAllVisibleAsRead,
    archiveNotification,
    migrateNotifications,
    markAsUnRead,
    isLoading,
  };
}

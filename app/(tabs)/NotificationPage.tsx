import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Linking,
  Animated,
  Platform,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { analytics } from "../config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import FilterIcon from "@/assets/icons/InAppNotifications/Filter";
import SettingsIcon from "@/assets/icons/InAppNotifications/Settings";
import Notifications from "../components/Notification/Notifications";
import useNotification from "../components/Notification/useNotification";
import Checkmark from "@/assets/icons/InAppNotifications/Checkmark";
import { useRouter } from "expo-router";
import { NotificationItem, Property, Requirement } from "../types";
import { setPropertyDataThunk } from "@/store/slices/propertySlice";
import { setRequirementDataThunk } from "@/store/slices/requirementSlice";
import { useDispatch } from "react-redux";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AnyAction } from "redux";
import MarkasRead from "@/assets/icons/Notification/MarkasRead.svg";
import { getUnixDateTime } from "../helpers/getUnixDateTime";
import { showSuccessToast } from "@/utils/toastUtils";
import UndoArchiveModal from "../components/Notification/UndoArchiveModal";

const { width } = Dimensions.get("window");

interface NotificationPageProps {
  // You can add props here if needed in the future
}

// Map notification types to filter categories
const notificationTypeToFilter: Record<string, string> = {
  enquiry_buyer_notification: "connects",
  enquiry_seller_notification: "connects",
  delisting_notification: "listing",
  delistied_notification: "listing",
  listing_live_notification: "listing",
  add_requirement_notification: "asks",
  payment_notification: "billing",
};

const NotificationPage: React.FC<NotificationPageProps> = () => {
  const agentData = useSelector((state: RootState) => state?.agent?.docData);
  const userType = agentData?.userType || "free";
  const kamPhone = useSelector(
    (state: RootState) => state?.kam?.kamDocData?.phoneNumber
  );
  const kam = useSelector((state: RootState) => state?.kam?.kamDocData);
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const {
    unreadCount,
    activeFilter,
    setActiveFilter,
    notifications,
    markAllVisibleAsRead,
    archiveNotification,
    isLoading,
    markAsRead,
    markAsUnRead,
  } = useNotification();
  const [showFilters, setShowFilters] = useState(false);
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [pendingArchiveNotification, setPendingArchiveNotification] =
    useState<NotificationItem | null>(null);
  const [restoreNotificationCallback, setRestoreNotificationCallback] =
    useState<((notification: NotificationItem) => void) | null>(null);
  const [finalArchiveCallback, setFinalArchiveCallback] = useState<
    ((notification: NotificationItem) => void) | null
  >(null);
  const router = useRouter();

  const filters = [
    { id: "all", label: "All" },
    { id: "connects", label: "Enquiries" },
    { id: "asks", label: "Requirements" },
    { id: "listing", label: "Listing" },
    { id: "billing", label: "Billing" },
  ] as const;

  // Filter notifications based on active filter
  const filteredNotifications =
    activeFilter === "all"
      ? notifications
      : notifications.filter(
          (notification) =>
            notificationTypeToFilter[notification.type] === activeFilter
        );

  const fetchAndDispatchProperty = async (propertyId: string) => {
    try {
      const propertyRef = doc(db, "acnProperties", propertyId);
      const propertySnap = await getDoc(propertyRef);

      if (propertySnap.exists()) {
        const propertyData = propertySnap.data() as Property;
        dispatch(setPropertyDataThunk(propertyData));
        router.push({
          pathname: "/components/property/PropertyDetailsScreen",
        });
      }
    } catch (error) {
      console.error("Error fetching property data:", error);
    }
  };

  const onCTAPress = async (action: string, notification: NotificationItem) => {
    try {
      logEvent(analytics, "notification_cta_click", {
        event_category: "notifications",
        event_label: "cta_action",
        notification_type: notification.type,
        action: action,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging CTA click:", error);
    }

    // Mark notification as read when CTA is pressed
    try {
      await markAsRead(notification.notificationId || notification.id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }

    switch (notification.type) {
      case "enquiry_buyer_notification":
        if (
          action.toLocaleLowerCase() === "call agent" ||
          action.toLocaleLowerCase() === "call agents"
        ) {
          // Linking.openURL(`tel:${notification.additionalData.buyerPhone}`);
          Linking.openURL(`tel:${notification.meta?.sellerNumber}`);
        } else if (action.toLocaleLowerCase() === "message agent") {
          const message = `Hi ${notification.meta?.sellerName},

I came across your property on ACN and I'm interested in ${notification.meta?.propertyName} (ID: ${notification.meta?.propertyId}). Could you please share:

- Current pricing
- When can the site visit happen?
- Any other key details  

Thanks,
${notification.meta?.buyerName}`;
          Linking.openURL(
            `https://wa.me/${
              notification.meta?.sellerNumber
            }?text=${encodeURIComponent(message)}`
          );
        }
        break;

      case "enquiry_seller_notification":
        // Handle enquiry received notification
        if (
          action.toLocaleLowerCase() === "call agent" ||
          action.toLocaleLowerCase() === "call agents"
        ) {
          // Linking.openURL(`tel:${notification.additionalData.buyerPhone}`);
          Linking.openURL(`tel:${notification.meta?.buyerNumber}`);
        } else if (action.toLocaleLowerCase() === "message agent") {
          const message = `Hi ${notification.meta?.buyerName},

I see you’ve enquired on ACN about my property  ${notification.meta?.propertyName} (ID: ${notification.meta?.propertyId}). 
Let me know which details you need.

${notification.meta?.sellerName}
${notification.meta?.sellerNumber}`;
          Linking.openURL(
            `https://wa.me/${
              notification.meta?.buyerNumber
            }?text=${encodeURIComponent(message)}`
          );
        }
        break;

      case "delisting_notification":
        // Handle going to be de-listed notification
        if (
          action.toLocaleLowerCase() === "available" ||
          action.toLocaleLowerCase() === "sold"
        ) {
          try {
            const propertyRef = doc(
              db,
              "acnProperties",
              notification.meta?.propertyId as string
            );
            const propertySnap = await getDoc(propertyRef);

            if (propertySnap.exists()) {
              // Update the status field to the action value
              await updateDoc(propertyRef, {
                status: action,
                ageOfStatus: getUnixDateTime(),
              });
            }
          } catch (error) {
            console.error("Error updating property status:", error);
          }
        }
        break;

      case "delisted_notification":
        // Handle de-listed notification
        if (
          action.toLocaleLowerCase() === "call kam" ||
          action.toLocaleLowerCase() === "contact kam"
        ) {
          Linking.openURL(`tel:${kamPhone}`);
        } else if (
          action.toLocaleLowerCase() === "dashboard" ||
          action.toLocaleLowerCase() === "view dashboard"
        ) {
          router.push("/(tabs)/dashboardTab");
        }
        break;

      case "listing_live_notification":
        // Handle inventory became live notification
        if (
          action.toLocaleLowerCase() === "view details" &&
          notification.meta?.propertyId
        ) {
          fetchAndDispatchProperty(notification.meta?.propertyId);
        }
        break;

      case "qc_notification":
        // Handle status other than live notification
        if (action.toLocaleLowerCase() === "call kam") {
          console.log("kamPhone", kamPhone);
          Linking.openURL(`tel:${kamPhone}`);
        }
        if (action.toLocaleLowerCase() === "dashboard") {
          router.push("/(tabs)/dashboardTab");
        }
        break;

      case "payment_notification":
        // Handle purchased credits notification
        if (action.toLocaleLowerCase() === "view credits") {
          router.push("/(pages)/Credits");
        } else if (action.toLocaleLowerCase() === "properties") {
          router.push("/(tabs)/properties");
        } else if (action.toLocaleLowerCase() === "add new inventory") {
          router.push("/(tabs)/AddInventoryForm");
        }
        break;

      case "add_inventory_notification":
        // Handle listing submit notification
        if (notification.propertyId) {
          fetchAndDispatchProperty(notification.propertyId);
        } else {
          router.push("/(tabs)/properties");
        }
        break;

      case "add_requirement_notification":
        // Handle requirement posted notification
        if (notification.meta?.requirementId) {
          const fetchAndDispatchRequirement = async () => {
            try {
              const requirementRef = doc(
                db,
                "requirements",
                notification.meta?.requirementId as string
              );
              const requirementSnap = await getDoc(requirementRef);

              if (requirementSnap.exists()) {
                const requirementData = requirementSnap.data() as Requirement;
                dispatch(setRequirementDataThunk(requirementData));
              }
            } catch (error) {
              console.error("Error fetching requirement data:", error);
            }
          };

          fetchAndDispatchRequirement();
        }
        router.push({
          pathname: "/components/requirement/RequirementDetailsScreen",
        });
        break;

      case "trial_ended_notification":
        // Handle free trial ended notification
        if (action.toLocaleLowerCase() === "get premium") {
          router.push("/(pages)/ComparePlans");
        } else if (action.toLocaleLowerCase() === "compare plans") {
          router.push("/(pages)/ComparePlans");
        }
        break;

      case "trial_notification":
        // Handle trial expires in X days notification
        if (action.toLocaleLowerCase() === "properties") {
          router.push("/(tabs)/properties");
        } else if (action.toLocaleLowerCase() === "add new inventories") {
          router.push("/(tabs)/AddInventoryForm");
        }
        break;
      case "feature_notification":
        // Handle feature notification
        if (action.toLocaleLowerCase() === "learn more") {
          Linking.openURL(`tel:${kamPhone}`);
        }
        break;
      case "rating_notification":
        // Handle rating notification
        if (action.toLocaleLowerCase() === "rate now") {
          Linking.openURL(
            Platform.OS === "ios"
              ? `https://apps.apple.com/in/app/acn-online/id6754492309`
              : `https://play.google.com/store/apps/details?id=com.acnonline.in`
          );
        }
        break;
      case "zone_notification":
        // Handle zone notification
        if (action.toLocaleLowerCase() === "view inventory") {
          router.push("/(tabs)/properties");
        } else if (action.toLocaleLowerCase() === "view requirements") {
          router.push("/(tabs)/AddInventoryForm");
        } else if (action.toLocaleLowerCase() === "join webinar") {
          Linking.openURL(`https://meet.google.com/nqc-fupa-zng`);
        }
        break;
      case "":
        break;

      default:
        console.log("Unhandled notification type:", notification.type);
        break;
    }
  };

  // Handle archive notification - show undo modal instead of immediate archive
  const handleArchiveNotification = useCallback(
    async (notification: NotificationItem) => {
      try {
        // Store the notification for potential undo
        setPendingArchiveNotification(notification);
        setShowUndoModal(true);

        // Log archive initiation
        logEvent(analytics, "notification_archive_initiated", {
          event_category: "notifications",
          event_label: "swipe_archive",
          notification_type: notification.type,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error initiating archive:", error);
      }
    },
    [userType]
  );

  // Handle undo archive
  const handleUndoArchive = () => {
    // Restore the notification to the UI
    if (pendingArchiveNotification && restoreNotificationCallback) {
      restoreNotificationCallback(pendingArchiveNotification);
    }

    // Log undo action
    if (pendingArchiveNotification) {
      logEvent(analytics, "notification_archive_undone", {
        event_category: "notifications",
        event_label: "undo_archive",
        notification_type: pendingArchiveNotification.type,
        user_type: userType,
      });
    }

    setShowUndoModal(false);
    setPendingArchiveNotification(null);
    showSuccessToast("Archive undone");
  };

  // Handle setting the restore callback from Notifications component
  const handleSetRestoreCallback = useCallback(
    (callback: (notification: NotificationItem) => void) => {
      console.log("Setting restore callback from Notifications component");
      setRestoreNotificationCallback(() => callback);
    },
    []
  );

  // Handle setting the final archive callback from Notifications component
  const handleSetFinalArchiveCallback = useCallback(
    (callback: (notification: NotificationItem) => void) => {
      console.log(
        "Setting final archive callback from Notifications component"
      );
      setFinalArchiveCallback(() => callback);
    },
    []
  );

  // Handle final archive (when undo modal dismisses)
  const handleFinalArchive = async () => {
    if (!pendingArchiveNotification) return;

    try {
      const idToArchive =
        pendingArchiveNotification.notificationId ||
        pendingArchiveNotification.id;

      // Remove from local UI state first
      if (finalArchiveCallback) {
        finalArchiveCallback(pendingArchiveNotification);
      }

      // Then archive in database
      const result = await archiveNotification(idToArchive);

      // Log final archive action
      logEvent(analytics, "notification_archived", {
        event_category: "notifications",
        event_label: "archive_confirmed",
        notification_type: pendingArchiveNotification.type,
        user_type: userType,
      });

      setShowUndoModal(false);
      setPendingArchiveNotification(null);
    } catch (error) {
      console.error("Error archiving notification:", error);
      setShowUndoModal(false);
      setPendingArchiveNotification(null);
    }
  };

  // Handle toggle read/unread
  const handleToggleRead = useCallback(
    async (notification: NotificationItem) => {
      try {
        const notificationId = notification.notificationId || notification.id;

        if (notification.isRead) {
          // Mark as unread
          await markAsUnRead(notificationId);
          showSuccessToast("Marked as unread");

          logEvent(analytics, "notification_marked_unread", {
            event_category: "notifications",
            event_label: "swipe_unread",
            notification_type: notification.type,
            user_type: userType,
          });
        } else {
          // Mark as read
          await markAsRead(notificationId);
          showSuccessToast("Marked as read");

          logEvent(analytics, "notification_marked_read", {
            event_category: "notifications",
            event_label: "swipe_read",
            notification_type: notification.type,
            user_type: userType,
          });
        }
      } catch (error) {
        console.error("Error toggling read status:", error);
      }
    },
    [markAsRead, markAsUnRead, userType]
  );

  // Track page view
  useEffect(() => {
    try {
      logEvent(analytics, "notification_page_view", {
        event_category: "notifications",
        event_label: "coming_soon",
        page_status: "under_development",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging notification page view:", error);
    }
  }, [userType]);

  // --- Modal drag-to-dismiss setup ---
  const translateY = React.useRef(new Animated.Value(0)).current;
  // Prevent the sheet from being dragged above its initial position
  const clampedTranslateY = translateY.interpolate({
    inputRange: [-100, 0, 1000],
    outputRange: [0, 0, 1000],
    extrapolate: "clamp",
  });

  const handleModalGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handleModalGestureStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;
      const shouldClose = translationY > 100 || velocityY > 800;
      if (shouldClose) {
        setShowFilters(false);
        translateY.setValue(0);
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.notificationIcon}>
                <Text style={styles.notificationText}>{unreadCount}</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => setShowFilters(true)} className="">
              <FilterIcon />
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={markAllVisibleAsRead}>
              <MarkasRead width={24} height={24} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push("/components/Notification/NotificationSettings")
              }
            >
              <SettingsIcon />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.notificationsContainer}>
          <Notifications
            notifications={filteredNotifications}
            onCtaPress={onCTAPress}
            onArchive={handleArchiveNotification}
            onToggleRead={handleToggleRead}
            onRestoreNotification={handleSetRestoreCallback}
            onFinalArchive={handleSetFinalArchiveCallback}
            isLoading={isLoading}
          />
        </View>

        {/* Filter Modal */}
        <Modal
          animationType="fade"
          transparent
          visible={showFilters}
          onRequestClose={() => setShowFilters(false)}
        >
          <GestureHandlerRootView
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
          >
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
              {/* Overlay */}
              <Pressable
                style={{ flex: 1 }}
                onPress={() => setShowFilters(false)}
              />

              {/* Bottom Sheet */}
              <PanGestureHandler
                onGestureEvent={handleModalGestureEvent}
                onHandlerStateChange={handleModalGestureStateChange}
              >
                <Animated.View
                  style={[
                    styles.modalContent,
                    { transform: [{ translateY: clampedTranslateY }] },
                  ]}
                >
                  {/* Drag indicator */}
                  <View style={styles.dragIndicator} />
                  {filters.map((filter) => (
                    <TouchableOpacity
                      key={filter.id}
                      style={styles.filterOption}
                      onPress={() => {
                        setActiveFilter(filter.id);
                        setShowFilters(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          activeFilter === filter.id &&
                            styles.activeFilterOptionText,
                        ]}
                      >
                        {filter.label}
                      </Text>
                      {activeFilter === filter.id && (
                        <Checkmark width={20} height={21} color="#153E3B" />
                      )}
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              </PanGestureHandler>
            </View>
          </GestureHandlerRootView>
        </Modal>

        {/* Undo Archive Modal */}
        <UndoArchiveModal
          visible={showUndoModal}
          notification={pendingArchiveNotification}
          onUndo={handleUndoArchive}
          onDismiss={handleFinalArchive}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#FAFAFA",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    fontFamily: "Montserrat_700Bold",
  },
  headerContent: {
    flexDirection: "row",
    // alignItems: "center",
    justifyContent: "space-between",
    // backgroundColor: "white",
    gap: 8,
  },
  notificationIcon: {
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: "#153E3B",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  notificationsContainer: {
    flex: 1,
    height: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 0,
  },
  dragIndicator: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: "white",
  },
  filterOptionText: {
    fontSize: 16,
    color: "#222",
    fontFamily: "Montserrat_500Medium",
  },
  activeFilterOptionText: {
    color: "#153E3B",
    fontWeight: "bold",
  },
  checkmark: {
    fontSize: 18,
    color: "#153E3B",
    marginLeft: 8,
  },
});

export default NotificationPage;

import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { analytics } from "../config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import FilterIcon from "@/assets/icons/InAppNotifications/Filter";
import SettingsIcon from "@/assets/icons/InAppNotifications/Settings";
import Notifications from "../components/Notification/Notifications";
import useNotification from "../components/Notification/useNotification";
import Checkmark from "@/assets/icons/InAppNotifications/Checkmark";
import DoubleCheck from "@/assets/icons/InAppNotifications/DoubleCheck";
import { useRouter } from "expo-router";
import { NotificationItem, Requirement } from "../types";
import { setPropertyDataThunk } from "@/store/slices/propertySlice";
import { setRequirementDataThunk } from "@/store/slices/requirementSlice";
import { useDispatch } from "react-redux";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AnyAction } from "redux";
import MarkasRead from "@/assets/icons/Notification/MarkasRead.svg";
import { getUnixDateTime } from "../helpers/getUnixDateTime";

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
  const kamPhone = (state: any) => state?.kam?.kamDocData?.phonenumber || "";
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const {
    unreadCount,
    activeFilter,
    setActiveFilter,
    notifications,
    markAllVisibleAsRead,
  } = useNotification();
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  const filters = [
    { id: "all", label: "All" },
    { id: "connects", label: "Connects" },
    { id: "asks", label: "Asks" },
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
      const propertyRef = doc(db, "properties", propertyId);
      const propertySnap = await getDoc(propertyRef);

      if (propertySnap.exists()) {
        const propertyData = propertySnap.data();
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

    switch (notification.type) {
      case "enquiry_buyer_notification":
        // Handle enquiry sent notification
        if (notification.propertyId) {
          fetchAndDispatchProperty(notification.propertyId);
        }
        break;

      case "enquiry_seller_notification":
        // Handle enquiry received notification
        if (action === "Call Agents") {
          // Linking.openURL(`tel:${notification.additionalData.buyerPhone}`);
          Linking.openURL(`tel:${kamPhone}`);
        } else if (action === "Message Agents") {
          Linking.openURL(
            `https://wa.me/${notification.additionalData.buyerPhone}`
          );
        }
        break;

      case "delisting_notification":
        // Handle going to be de-listed notification
        if (action === "Available" || action === "Sold") {
          try {
            const propertyRef = doc(
              db,
              "properties",
              notification.propertyId as string
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

      case "delistied_notification":
        // Handle de-listed notification
        if (action === "Call your KAM") {
          Linking.openURL(`tel:${kamPhone}`);
        } else if (action === "Go to Dashboard") {
          router.push("/(tabs)/dashboardTab");
        }
        break;

      case "listing_live_notification":
        // Handle inventory became live notification
        if (action === "View Details" && notification.propertyId) {
          fetchAndDispatchProperty(notification.propertyId);
        }
        break;

      case "qc_notification":
        // Handle status other than live notification
        if (action === "Call your KAM") {
          router.push("/modals/KamModal");
        }
        break;

      case "payment_notification":
        // Handle purchased credits notification
        if (action === "View Credits") {
          router.push("/(pages)/Credits");
        } else if (action === "Properties") {
          router.push("/(tabs)/properties");
        } else if (action === "Add New Inventory") {
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
        if (notification.requirementId) {
          const fetchAndDispatchRequirement = async () => {
            try {
              const requirementRef = doc(
                db,
                "requirements",
                notification.requirementId as string
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
        if (action === "Get Premium") {
          router.push("/(pages)/ComparePlans");
        } else if (action === "Compare Plans") {
          router.push("/(pages)/ComparePlans");
        }
        break;

      case "trial_notification":
        // Handle trial expires in X days notification
        if (action === "Properties") {
          router.push("/(tabs)/properties");
        } else if (action === "Add New Inventories") {
          router.push("/(tabs)/AddInventoryForm");
        }
        break;

      default:
        console.log("Unhandled notification type:", notification.type);
        break;
    }
  };

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

  return (
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
          <TouchableOpacity onPress={() => setShowFilters(true)}>
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
        {/* <ScrollView style={{ height: "100%", backgroundColor: "red" }}> */}
          <Notifications
            notifications={filteredNotifications}
            onCtaPress={onCTAPress}
          />
        {/* </ScrollView> */}
      </View>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilters}
        onRequestClose={() => setShowFilters(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFilters(false)}
        >
          <View style={styles.modalContent}>
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
                    activeFilter === filter.id && styles.activeFilterOptionText,
                  ]}
                >
                  {filter.label}
                </Text>
                {activeFilter === filter.id && (
                  <Checkmark width={20} height={21} color="#153E3B" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
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
    // backgroundColor: "pink",
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

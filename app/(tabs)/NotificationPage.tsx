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
            <DoubleCheck width={24} height={24} color="#153E3B" />
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
        <ScrollView>
          <Notifications notifications={filteredNotifications} />
        </ScrollView>
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
    backgroundColor: "#FFFFFF",
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

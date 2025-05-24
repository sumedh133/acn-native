import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { analytics } from "../config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import FilterIcon from "@/assets/icons/InAppNotifications/Filter";
import SettingsIcon from "@/assets/icons/InAppNotifications/Settings";
import Notifications from "../components/Notification/Notifications";

const { width } = Dimensions.get("window");

interface NotificationPageProps {
  // You can add props here if needed in the future
}

const NotificationPage: React.FC<NotificationPageProps> = () => {
  const agentData = useSelector((state: RootState) => state?.agent?.docData);
  const userType = agentData?.userType || "free";

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
          <View style={styles.notificationIcon}>
            <Text style={styles.notificationText}>
              2
              {/*This has to be fecthed from the length of the data coming from db*/}
            </Text>
          </View>
          <TouchableOpacity>
            <FilterIcon />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <TouchableOpacity>
            <SettingsIcon />
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <ScrollView>
          <Notifications />
        </ScrollView>
      </View>
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
});

export default NotificationPage;

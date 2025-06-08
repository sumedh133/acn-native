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
import NotificationCard from "./NotificationCard";
import React from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import NoNotificationsIcon from "@/assets/icons/InAppNotifications/noNotifications.svg";

interface NotificationsProps {
  notifications: NotificationItem[];
  onCtaPress?: (action: string, notification: NotificationItem) => void;
  isLoading?: boolean;
}

const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  onCtaPress,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#153E3B" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, height: "100%" }}>
      {notifications.length == 0 ? (
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
          {notifications.map((notification, index) => (
            <>
              <NotificationCard
                key={`${notification.id || index}-${notification.addedTime}`}
                notification={notification}
                onCtaPress={onCtaPress}
                addedTime={notification.addedTime}
              />
            </>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Notifications;

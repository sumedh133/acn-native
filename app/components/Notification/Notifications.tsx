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
import { View, Text } from "react-native";

interface NotificationsProps {
  notifications: NotificationItem[];
  onCtaPress?: (action: string, notification: NotificationItem) => void;
}

const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  onCtaPress,
}) => {
  return (
    <View style={{ flex: 1 }}>
      {notifications.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 16, color: "#666" }}>
            No Notifications Yet
          </Text>
        </View>
      ) : (
        notifications.map((notification, index) => (
          <NotificationCard
            key={`${notification.id || index}-${notification.addedTime}`}
            notification={notification}
            onCtaPress={onCtaPress}
            addedTime={notification.addedTime}
          />
        ))
      )}
    </View>
  );
};

export default Notifications;

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

import { db } from "@/app/config/firebase";
import { toCapitalizedWords } from "@/app/helpers/common";
import { NotificationItem } from "@/app/types";
import { RootState } from "@/store/store";
import { MaterialIcons } from "@expo/vector-icons";
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import NotificationCard from "./NotificationCard";
import { router } from "expo-router";

const Notifications = () => {
  const cpId = useSelector((state: RootState) => state.agent.docData.cpId);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const notificationsRef = query(
      collection(db, "Notifications"),
      where("cpCode", "==", cpId)
    );
    // Set up real-time listener
    const unsubscribe = onSnapshot(
      notificationsRef,
      (querySnapshot) => {
        const notificationsData: NotificationItem[] = querySnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            addedTime: doc.data().addedTime || 0,
            body: doc.data().body || "",
            cpId: doc.data().cpCode || "",
            cta: doc.data().cta || [],
            expiryTime: doc.data().expiryTime || 0,
            title: doc.data().title || "",
            type: doc.data().type || "",
          })
        );
        setNotifications(notificationsData);
      },
      (error) => {
        console.error("Error fetching notifications:", error);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [cpId]);

  // Handler for CTA button clicks
  const handleCtaPress = (action: string, notification: NotificationItem) => {
    // Example: handle different actions/types
    if (notification.type === "going-to-be-de-listed") {
      if (action === "available") {
        // set property as availble
      } else if (action === "sold") {
        // set property as sold
      }
    } else if (notification.type === "enquired-on-your-property") {
      if (true) {
        //
      } else if (false) {
        //
      }
    }
  };

  return (
    <View style={{ backgroundColor: "#f0f0f0", flex: 1 }}>
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onCtaPress={handleCtaPress}
        />
      ))}
    </View>
  );
};

export default Notifications;

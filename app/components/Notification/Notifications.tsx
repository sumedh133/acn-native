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
import { NotificationItem, Property } from "@/app/types";
import { RootState } from "@/store/store";
import { MaterialIcons } from "@expo/vector-icons";
import { collection, doc, onSnapshot, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { useSelector } from "react-redux";
import NotificationCard from "./NotificationCard";
import { router } from "expo-router";
import { useDispatch } from "react-redux";
import { setPropertyDataThunk } from "@/store/slices/propertySlice";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";

const Notifications = () => {
  const cpId = useSelector((state: RootState) => state.agent.docData.cpId);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  useEffect(() => {
    // Reference to the specific document using cpId
    const docRef = doc(db, "Notifications", cpId);

    // Set up real-time listener for the document
    const unsubscribe = onSnapshot(
      docRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const notificationsData: NotificationItem[] =
            data.notifications || [];

          // Sort notifications by addedTime in descending order (newest first)
          const sortedNotifications = notificationsData.sort(
            (a, b) => b.addedTime - a.addedTime
          );

          setNotifications(sortedNotifications);
        } else {
          console.log("No notifications document found for cpId:", cpId);
          setNotifications([]);
        }
      },
      (error) => {
        console.error("Error fetching notifications:", error);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [cpId]);

  // Handler for CTA button clicks
  const handleCtaPress = async (
    action: string,
    notification: NotificationItem
  ) => {
    switch (notification.type) {
      case "going_to_be_delisted":
        if (action === "available") {
          // Handle setting property as available
          console.log("Setting property as available");
        } else if (action === "sold") {
          // Handle setting property as sold
          console.log("Setting property as sold");
        }
        break;

      case "enquiry_seller_notification":
        // Handle seller enquiry actions
        if (action === "Call Agent") {
          const phoneNumber = notification.phoneNumber; // Remove non-digits
          if (phoneNumber) {
            Linking.openURL(`tel:${phoneNumber}`);
          } else {
            console.log("No phone number available");
          }
        } else if (action === "Message Agent") {
          const whatsappUrl = `https://wa.me/${notification.phoneNumber}`;
          Linking.openURL(whatsappUrl);
          console.log("Message :", notification.phoneNumber);
        }
        break;

      case "enquiry_buyer_notification":
        // No CTAs for buyer agent on enquiry
        console.log("Handling buyer enquiry action:", action);
        if (action === "Call Agent") {
          const phoneNumber = notification.phoneNumber; // Remove non-digits
          if (phoneNumber) {
            Linking.openURL(`tel:${phoneNumber}`);
          } else {
            console.log("No phone number available");
          }
        }
        break;
      case "listing_live_notification":
        if (action === "View Details" && notification.propertyId) {
          const propertyDocRef = doc(db, "ACN123", notification.propertyId);
          const propertyDoc = await getDoc(propertyDocRef);
          const property = propertyDoc.data();
          if (property) {
            dispatch(setPropertyDataThunk(property as Property));
          }
          router.push("/components/property/PropertyDetailsScreen");
        }
        break;
      case "qc_notification":
        console.log("handing listing_live_notification", action);
        break;
      default:
        console.log("Unhandled notification type:", notification.type);
    }
  };

  return (
    <View style={{ backgroundColor: "#f0f0f0", flex: 1, marginBottom: 55 }}>
      {notifications.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 16, color: "#666" }}>
            No notifications yet
          </Text>
        </View>
      ) : (
        notifications.map((notification) => (
          <NotificationCard
            key={`${notification.id}-${notification.addedTime}`}
            notification={notification}
            onCtaPress={handleCtaPress}
            addedTime={notification.addedTime}
          />
        ))
      )}
    </View>
  );
};

export default Notifications;

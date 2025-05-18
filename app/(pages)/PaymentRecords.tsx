import React, { useMemo, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { logEvent } from "@react-native-firebase/analytics";
import { analytics } from "../config/firebase";

interface PaymentHistoryItem {
  lastPaymentAmount?: number;
  lastPaymentDate?: {
    seconds: number;
    nanoseconds: number;
    toDate?: () => Date;
  };
  lastPaymentId?: string;
  lastPlanId?: string;
  paymentAmount?: number;
  paymentDate?: { seconds: number; nanoseconds: number; toDate?: () => Date };
  paymentId?: string;
  planId?: string;
}

interface FormattedPaymentRecord {
  id: string;
  title: string;
  amount: string;
  date: string;
}

const PaymentRecords: React.FC = () => {
  const paymentHistory: Array<PaymentHistoryItem> | null =
    useSelector((state: RootState) => state?.agent?.docData?.paymentHistory) ||
    null;

  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  // Add page view tracking
  useEffect(() => {
    try {
      logEvent(analytics, "payment_records_page_view", {
        event_category: "payment_records",
        event_label: "page_view",
        records_count: paymentHistory?.length || 0,
        user_type: userType
      });
    } catch (error) {
      console.error("Error logging page view:", error);
    }
  }, [paymentHistory?.length, userType]);

  const formattedPaymentRecords = useMemo(() => {
    if (!paymentHistory || !paymentHistory.length) return [];

    return paymentHistory.map((item) => {
      const isPremiumPlan =
        item.lastPlanId === "premium" || item.planId === "premium";
      const paymentAmount = item.lastPaymentAmount || item.paymentAmount || 0;
      const paymentId = item.lastPaymentId || item.paymentId || "";

      let dateString = "";
      const timestamp = item.lastPaymentDate || item.paymentDate;

      if (timestamp) {
        if (timestamp.toDate && typeof timestamp.toDate === "function") {
          const date = timestamp.toDate();
          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          dateString = `${
            monthNames[date.getMonth()]
          } ${date.getDate()} • ${date.getHours()}:${String(
            date.getMinutes()
          ).padStart(2, "0")} ${date.getHours() >= 12 ? "PM" : "AM"}`;
        } else if (timestamp.seconds) {
          const date = new Date(timestamp.seconds * 1000);
          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          dateString = `${
            monthNames[date.getMonth()]
          } ${date.getDate()} • ${date.getHours()}:${String(
            date.getMinutes()
          ).padStart(2, "0")} ${date.getHours() >= 12 ? "PM" : "AM"}`;
        }
      }

      return {
        id: paymentId,
        title: isPremiumPlan ? "ACN Premium Plan" : "Enquiry Booster Pack",
        amount: `₹${(paymentAmount/100).toFixed(2)}`,
        date: dateString,
      };
    });
  }, [paymentHistory]);

  const handlePaymentItemClick = (item: FormattedPaymentRecord) => {
    try {
      logEvent(analytics, "payment_record_item_click", {
        event_category: "payment_records",
        event_label: "item_click",
        payment_id: item.id,
        plan_type: item.title.toLowerCase().includes("premium") ? "premium" : "booster",
        amount: parseFloat(item.amount.replace("₹", "")),
        user_type: userType
      });
    } catch (error) {
      console.error("Error logging payment item click:", error);
    }
  };

  const renderPaymentItem = ({ item }: { item: FormattedPaymentRecord }) => (
    <TouchableOpacity 
      style={styles.paymentCard}
      onPress={() => handlePaymentItemClick(item)}
    >
      <View style={styles.paymentInfo}>
        <Text style={styles.paymentTitle}>{item.title}</Text>
        <Text style={styles.paymentDate}>{item.date}</Text>
      </View>
      <View style={styles.paymentStatusContainer}>
        <Text style={styles.paymentAmount}>{item.amount}</Text>
        <Text style={styles.paymentStatus}>{"Paid Successfully"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEEEEE" />

      {formattedPaymentRecords.length > 0 ? (
        <FlatList
          data={formattedPaymentRecords}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No payment records found</Text>
        </View>
      )}
      {Platform.OS === "ios" ? (
      <View style={styles.NoteView}>
        <Text
          style={{
            color: "#050505",
            fontFamily: "Lato_400Regular",
            fontSize: 12,
            fontWeight:500,
          }}
        >
          Note:{" "}
          <Text style={styles.NoteText}>
            Credit top-ups and plan upgrades are not available within the app.
            We apologize for any inconvenience caused.
          </Text>
        </Text>
      </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  listContainer: {
    padding: 12,
  },
  paymentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  paymentInfo: {
    flex: 1,
    flexDirection: "column",
  },
  paymentTitle: {
    fontSize: 14,
    fontFamily: "Lato_700Bold",

    color: "#433F3E",
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 14,
    fontWeight: 500,
    color: "#9A9A9A",
  },
  paymentStatusContainer: {
    alignItems: "flex-end",
    flexDirection: "column",
  },
  paymentAmount: {
    fontSize: 14,
    fontFamily: "Montserrat_700Bold",
    color: "#000000",
    marginRight: 8,
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: 500,
    color: "#9A9A9A",
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888888",
  },
  NoteView: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  NoteText: {
    color: "#707070",
    fontFamily: "Lato_400Regular",
    fontSize: 12,
    fontWeight:500,
  },
});

export default PaymentRecords;

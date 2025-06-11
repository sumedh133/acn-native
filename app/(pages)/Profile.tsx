import React, { ReactNode, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Offline from "../components/Offline";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import UserDetailsCard from "../components/ProfilePage/UserDetailsCard";
import { useDispatch } from "react-redux";
import { logOut } from "@/store/slices/authSlice";
import { useRouter } from "expo-router";
import { showErrorToast } from "@/utils/toastUtils";
import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import { SimpleLineIcons } from "@expo/vector-icons";
import PaymentRecordsIcon from "@/assets/icons/svg/ProfilePage/PaymentRecordsIcon";
import KamModalIcon from "@/assets/icons/svg/KamModalIcon";
import SupportIcon from "@/assets/icons/svg/ProfilePage/SupportIcon";
import ProfileCard, {
  ProfileCardInterface,
} from "../components/ProfilePage/ProfileCard";
import KamIcon from "@/assets/icons/svg/ProfilePage/KamIcon";
import GetPremiumCard from "../components/ProfilePage/GetPremiumCard";
import LogoutIcon from "@/assets/icons/svg/Common/LogoutIcon";
import CreditsCard from "../components/ProfilePage/CreditsCard";
import { setKamModalVisible } from "@/store/slices/kamSlice";
import { logEvent } from "@react-native-firebase/analytics";
import { analytics } from "../config/firebase";
import { getAvailablePurchases, getPurchaseHistory, finishTransaction } from "react-native-iap";
import { timeAgo } from "../components/property/PropertyDetailsScreen";
import { circle } from "highcharts";

const profileCards: ProfileCardInterface[] = [
  {
    title: "Payment Records",
    icon: <PaymentRecordsIcon width={24} height={24} />,
    slug: "payment_records",
  },
  {
    title: "Contact KAM",
    icon: <KamIcon width={24} height={24} />,
    slug: "contact_kam",
  },
  {
    title: "Help & Support",
    icon: <SupportIcon width={24} height={24} />,
    slug: "help_support",
  },
];

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const router = useRouter();

  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  const handleCardClick = (slug: string) => {
    switch (slug) {
      case "payment_records":
        try {
          logEvent(analytics, "payment_records_click", { "event_category" : "profile", "event_label" : "payment_record", "user_type": userType })
        } catch (error) {
          console.error("Error: ", error)
        }
        router.push("/(pages)/PaymentRecords");
        break;
      case "contact_kam":
        try {
          logEvent(analytics, "contact_kam_click", { "event_category": "profile", "event_label": "contact_kam", "user_type": userType });
          dispatch(setKamModalVisible(true));
        } catch (error) {
          console.error("Error: ", error);
        }
        break;
      case "help_support":
        try {
          logEvent(analytics, "help_support_click", { "event_category": "profile", "event_label": "help_support", "user_type": userType });
          router.push("/help");
        } catch (error) {
          console.error("Error: ", error);
        }
        break;
      case "get_premium":
        try {
          logEvent(analytics, "get_premium_click", { "event_category": "profile", "event_label": "get_premium", "user_type": userType });
          router.push("/billings");
        } catch (error) {
          console.error("Error: ", error);
        }
        break;
      case "credits_card":
        try {
          logEvent(analytics, "credits_card_click", { "event_category": "profile", "event_label": "credits", "user_type": userType });
        } catch (error) {
          console.error("Error: ", error);
        }
        router.push("/(pages)/Credits");
        break;
      case "compare_plans":
        try {
          logEvent(analytics, "compare_plans_click", { "event_category": "profile", "event_label": "compare_plans", "user_type": userType });
          router.push("/(pages)/ComparePlans");
        } catch (error) {
          console.error("Error: ", error);
        }
        break;
      default:
        break;
    }
  };
  const handleLogOut = async () => {
    try {
      await dispatch(logOut());
      setTimeout(() => {
        router.dismissAll();
        router.replace("/");
      }, 300);
      logEvent(analytics, "logout_click", { "event_category": "profile", "event_label": "logout", "user_type": userType });
    } catch (error) {
      console.error("Error during logout:", error);
      showErrorToast("Some error occured. Please try again.", {
        isInModal: true,
      });
    }
  };

  const handleRestorePurchase = async () => {
    try {
      setIsLoading(true);
      console.log('started at: ', new Date().getTime());
      console.log((await getAvailablePurchases()).length)
      const purchases = await getAvailablePurchases();

      if (purchases.length === 0) {
        Alert.alert('No purchases found', 'No previous purchases were found to restore.');
        return;
      }

      // Unlock features based on restored purchases
      for (const purchase of purchases) {
        // Example: if (purchase.productId === 'your_product_id') { unlockFeature(); }
        // Optionally finish the transaction (iOS only)
        await finishTransaction({ purchase });
      }

      Alert.alert('Success', 'Your purchases have been restored.');
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  if (!isConnectedToInternet) return <Offline />;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <UserDetailsCard userType={userType} />
        <View style={styles.cardsContainer}>
          {profileCards?.map((item, idx) => {
            return (
              <ProfileCard
                item={item}
                key={idx}
                handleCardClick={handleCardClick}
              />
            );
          })}
        </View>
        {userType !== "premium" && (
          <GetPremiumCard
            handleClick={handleCardClick}
            slug={"compare_plans"}
          />
        )}
        <CreditsCard handleCardClick={handleCardClick} slug={"credits_card"} />
        {userType === "premium" && Platform.OS === "ios" && (
          <TouchableOpacity 
            style={styles.restorePurchaseButton} 
            onPress={handleRestorePurchase}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="green"/>
            ) : (
              <>
                <LogoutIcon width={18} height={18} color="green"/>
                <Text style={styles.restorePurchaseText}>Restore Purchase</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
          <LogoutIcon width={18} height={18} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F7",
  },
  contentContainer: {
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingBottom: 24, // Extra padding at the bottom for better scrolling experience
  },
  cardsContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#DE1135",
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 4,
    gap: 6,
  },
  logoutText: {
    color: "#DE1135",
    fontWeight: 600,
    fontSize: 14,
    marginLeft: 6,
  },
  restorePurchaseButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "green",
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 4,
    gap: 6,
  },
  restorePurchaseText: {
    color: "green",
    fontWeight: 600,
    fontSize: 14,
    marginLeft: 6,
  },
});

export default React.memo(Profile);

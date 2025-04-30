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
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const router = useRouter();

  const userType: string | null =
    useSelector((state: RootState) => state?.agent?.docData?.userType) || "";

  const handleCardClick = (slug: string) => {
    switch (slug) {
      case "payment_records":
        router.push("/billings");
        break;
      case "contact_kam":
        dispatch(setKamModalVisible(true));
        break;
      case "help_support":
        router.push("/help");
        break;
      case "get_premium":
        router.push("/billings");
        break;
      case "credits_card":
        router.push("/(pages)/Credits");
        break;
      case "compare_plans":
        router.push("/(pages)/ComparePlans");
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
    } catch (error) {
      console.error("Error during logout:", error);
      showErrorToast("Some error occured. Please try again.", {
        isInModal: true,
      });
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
          <GetPremiumCard handleClick={handleCardClick} slug={"get_premium"} />
        )}
        <CreditsCard handleCardClick={handleCardClick} slug={"credits_card"} />
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
});

export default React.memo(Profile);

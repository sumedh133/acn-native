import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Linking,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// You'll need to import these SVG files using a library like react-native-svg
// and convert them to React Native compatible components
import TncIcon from "../../assets/icons/tnc.svg";
import ArrowRightIcon from "../../assets/icons/arrowRightt.svg";
import LockIcon from "../../assets/icons/lock.svg";
import ReceiptMoneyIcon from "../../assets/icons/receiptMoney.svg";
import FlagIcon from "../../assets/icons/flag.svg";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Offline from "../components/Offline";
import LogoutIcon from "@/assets/icons/svg/Common/LogoutIcon";
import { logOut } from "@/store/slices/authSlice";
import { router } from "expo-router";
import { showErrorToast } from "@/utils/toastUtils";
import { useDispatch } from "react-redux";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { analytics } from "../config/firebase";
import { Ionicons } from "@expo/vector-icons";

interface HelpMobileProps {}

const HelpMobile: React.FC<HelpMobileProps> = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );
  const agentData = useSelector((state: RootState) => state?.agent?.docData);
  const userType = agentData?.userType || "free";

  // Track page view
  useEffect(() => {
    try {
      logEvent(analytics, "help_page_view", {
        event_category: "help",
        event_label: "page_view",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging page view:", error);
    }
  }, [userType]);

  useEffect(() => {
    const handleDimensionsChange = ({
      window,
    }: {
      window: { width: number; height: number };
    }) => {
      if (window.width > 768) {
        navigation.navigate("Home" as never);
      }
    };

    // Initial check
    const initialDimensions = Dimensions.get("window");
    if (initialDimensions.width > 768) {
      navigation.navigate("Home" as never);
    }

    // Set up event listener
    const subscription = Dimensions.addEventListener(
      "change",
      handleDimensionsChange
    );

    // Clean up
    return () => subscription.remove();
  }, [navigation]);

  const openLink = useCallback(
    (url: string) => {
      console.log("url", url);
      if (url.startsWith("/(tabs)")) {
        router.push(url as any);
        return;
      }

      try {
        // Extract policy type from URL
        const policyType = url.split("/").pop() || "";

        logEvent(analytics, "help_policy_click", {
          event_category: "help",
          event_label: "policy",
          policy_type: policyType,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging policy click:", error);
      }

      Linking.openURL(url);
    },
    [userType]
  );

  const handleContactSupport = () => {
    const phoneNumber = "+917206498895";
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleDelete = async () => {
    try {
      // Track deletion attempt
      logEvent(analytics, "account_deletion_attempt", {
        event_category: "help",
        event_label: "account",
        user_type: userType,
      });

      const agentRef = doc(db, "acnAgents", agentData.cpId);
      const agentSnapshot = await getDoc(agentRef);

      if (!agentSnapshot.exists()) {
        throw new Error("Agent not found");
      }

      const agentToArchive = agentSnapshot.data();

      // Archive agent
      await setDoc(doc(db, "acnArchiveAgents", agentData.cpId), {
        ...agentToArchive,
        archivedAt: serverTimestamp(),
        // verified: false,
      });

      // 3. Update references in acnProperties collection for enquiries
      // First, get all enquiries for this agent
      const enquiriesQuery = query(
        collection(db, "acnProperties"),
        where("cpId", "==", agentData.cpId)
      );

      const enquiriesSnapshot = await getDocs(enquiriesQuery);

      // Update each enquiry to mark it as delisted
      const updatePromises = enquiriesSnapshot.docs.map((enquiryDoc) => {
        return updateDoc(doc(db, "acnProperties", enquiryDoc.id), {
          status: "inactive",
          deletedAt: serverTimestamp(),
        });
      });

      await Promise.all(updatePromises);

      // 4. Delete the original agent document
      await deleteDoc(agentRef);

      // Track successful deletion
      logEvent(analytics, "account_deletion_success", {
        event_category: "help",
        event_label: "account",
        user_type: userType,
        enquiries_archived: enquiriesSnapshot.docs.length,
      });

      await dispatch(logOut());
      setTimeout(() => {
        router.dismissAll();
        router.replace("/");
      }, 300);
    } catch (error) {
      // Track deletion error
      logEvent(analytics, "account_deletion_error", {
        event_category: "help",
        event_label: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
        user_type: userType,
      });

      console.error("Error during Delete:", error);
      showErrorToast("Some error occurred. Please try again.", {
        isInModal: true,
      });
    }
  };

  const renderLinkItem = (
    icon: React.ReactNode,
    title: string,
    url: string
  ) => (
    <TouchableOpacity style={styles.linkItem} onPress={() => openLink(url)}>
      <View style={styles.leftContent}>
        {icon}
        <Text style={styles.linkText}>{title}</Text>
      </View>
      <ArrowRightIcon width={20} height={20} />
    </TouchableOpacity>
  );

  if (!isConnectedToInternet) return <Offline />;

  return (
    <View style={styles.container}>
      <View style={styles.linksContainer}>
        {renderLinkItem(
          <TncIcon width={20} height={20} />,
          "Terms and Conditions",
          "https://acnonline.in/tnc"
        )}

        {renderLinkItem(
          <LockIcon width={20} height={20} />,
          "Privacy Policy",
          "https://acnonline.in/privacy-policy"
        )}

        {renderLinkItem(
          <ReceiptMoneyIcon width={20} height={20} />,
          "Refund Policy",
          "https://acnonline.in/refund-policy"
        )}

        {renderLinkItem(
          <FlagIcon width={20} height={20} />,
          "Report Misuse",
          "/(tabs)/ReportIssue"
        )}
      </View>
      <View style={{}}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactSupport}
        >
          <Ionicons name="call-outline" size={20} color="white" />
          <Text style={styles.contactText}>Contact Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleDelete}>
          <LogoutIcon width={18} height={18} />
          <Text style={styles.logoutText}>DELETE ACCOUNT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 32,
    marginHorizontal: 16,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  linksContainer: {
    gap: 24,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#B5B3B3",
    borderRadius: 8,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkText: {
    fontFamily: "sans-serif",
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 24,
    color: "#000000",
    marginLeft: 8,
  },
  contactButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#003F3B",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#DE1135",
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 4,
    gap: 8,
    marginTop: 24,
  },
  contactText: {
    color: "#FFFFFF",
    fontWeight: 500,
    fontSize: 16,
  },
  logoutText: {
    color: "#DE1135",
    fontWeight: 600,
    fontSize: 14,
  },
});

export default HelpMobile;

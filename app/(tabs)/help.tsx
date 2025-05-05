import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// You'll need to import these SVG files using a library like react-native-svg
// and convert them to React Native compatible components
import TncIcon from "../../assets/icons/tnc.svg";
import ArrowRightIcon from "../../assets/icons/arrowRightt.svg";
import LockIcon from "../../assets/icons/lock.svg";
import ReceiptMoneyIcon from "../../assets/icons/receiptMoney.svg";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Offline from "../components/Offline";
import LogoutIcon from "@/assets/icons/svg/Common/LogoutIcon";
import { logOut } from "@/store/slices/authSlice";
import { router } from "expo-router";
import { showErrorToast } from "@/utils/toastUtils";
import { useDispatch } from "react-redux";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../config/firebase";

interface HelpMobileProps {}

const HelpMobile: React.FC<HelpMobileProps> = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

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

  const openLink = (url: string) => {
    Linking.openURL(url);
  };
  const agentData = useSelector((state: RootState) => state?.agent?.docData);

  const handleDelete = async () => {
    try {
      
      const agentRef = doc(db, "agents", agentData.cpId);

     
      const agentSnapshot = await getDoc(agentRef);
      if (!agentSnapshot.exists()) {
        throw new Error("Agent not found");
      }

      const agentToArchive = agentSnapshot.data();

      // 2. Add to archive_agents collection
      await setDoc(doc(db, "archive_agents", agentData.cpId), {
        ...agentToArchive,
        archivedAt: serverTimestamp(),
        // verified: false,
      });

      // 3. Update references in ACN123 collection for enquiries
      // First, get all enquiries for this agent
      const enquiriesQuery = query(
        collection(db, "ACN123"),
        where("cpCode", "==", agentData.cpId)
      );

      const enquiriesSnapshot = await getDocs(enquiriesQuery);

      // Update each enquiry to mark it as delisted
      const updatePromises = enquiriesSnapshot.docs.map((enquiryDoc) => {
        return updateDoc(doc(db, "ACN123", enquiryDoc.id), {
          status: 'inactive',
          deletedAt: serverTimestamp(),
        });
      });

      await Promise.all(updatePromises);

      // 4. Delete the original agent document
      await deleteDoc(agentRef);

      // 5. Log out and redirect
      await dispatch(logOut());
      setTimeout(() => {
        router.dismissAll();
        router.replace("/");
      }, 300);
    } catch (error) {
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
        <View style={{}}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleDelete}>
          <LogoutIcon width={18} height={18} />
          <Text style={styles.logoutText}>DELETE ACCOUNT</Text>
        </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 32,
    marginHorizontal: 16,
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

export default HelpMobile;

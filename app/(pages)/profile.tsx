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
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

interface HelpMobileProps {}

const Profile: React.FC<HelpMobileProps> = () => {
  const navigation = useNavigation();
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



  if (!isConnectedToInternet) return <Offline />;

  return ( 
  <>
  </>
  )
};

export default Profile;

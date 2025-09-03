import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { router } from "expo-router";
import { ScrollContext } from "../ScrollContext";
import ToStartIcon from "../../assets/icons/Notification/toStart.svg";
import ExpiringSoonIcon from "../../assets/icons/Notification/5_dayEnd.svg";
import LowCreditsIcon from "../../assets/icons/Notification/lowCredits.svg";
import TrailEndIcon from "../../assets/icons/Notification/trailEnd.svg";

// Trial Status Enum
export enum TrialStatusType {
  ACTIVE = "active",
  LOW_CREDITS = "lowCredits",
  EXPIRING_SOON = "expiringSoon",
  EXPIRED = "expired",
  TO_START = "toStart",
  OUT_OF_CREDITS = "outOfCredits",
  LOW_CREDITS_WSUB = "lowCreditsWSub",
}

interface AnimatedHeaderProps {
  title: string;
  headerBackVisible: boolean;
  onMenuPress: (backHeader: boolean) => void;
  showNotificationBanner?: boolean;
  customMessage?: string;
}

const HEADER_HEIGHT = 60;
const NOTIFICATION_HEIGHT = 80;

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  title,
  headerBackVisible,
  onMenuPress,
  showNotificationBanner = false,
  customMessage,
}) => {
   const { headerHeight } = useContext(ScrollContext);
  const monthlyCredits = useSelector(
    (state: RootState) => state.agent?.docData?.monthlyCredits || 0
  );
  const boosterCredits = useSelector(
    (state: RootState) => state.agent?.docData?.boosterCredits || 0
  );
  const agentData = useSelector((state: RootState) => state.agent?.docData);

  // Notification state
  const [dismissed, setDismissed] = useState(false);
  const [status, setStatus] = useState<TrialStatusType>(TrialStatusType.ACTIVE);
  const [daysLeft, setDaysLeft] = useState(30);
  const [credits, setCredits] = useState(0);
  const [dismissHeightAnim] = useState(new Animated.Value(1));

  // Trial status calculation
  const calculateDaysLeft = (trialStartedAt: number) => {
    if (!trialStartedAt) return 30;
    const start = new Date(trialStartedAt * 1000);
    const end = new Date(start);
    end.setDate(start.getDate() + 30);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24));
  };

  const getTrialStatus = (days: number, credits: number): TrialStatusType => {
    if (days < -3) return credits === 0 ? TrialStatusType.OUT_OF_CREDITS : TrialStatusType.LOW_CREDITS_WSUB;
    if (days <= 0) return TrialStatusType.EXPIRED;
    if (credits === 0) return TrialStatusType.OUT_OF_CREDITS;
    if (credits <= 5) return TrialStatusType.LOW_CREDITS;
    if (days <= 5) return TrialStatusType.EXPIRING_SOON;
    if (days <= 30) return TrialStatusType.ACTIVE;
    return TrialStatusType.TO_START;
  };

  useEffect(() => {
    if (agentData) {
      const dLeft = calculateDaysLeft(agentData.trialStartedAt);
      const cr = agentData.monthlyCredits;
      setDaysLeft(dLeft);
      setCredits(cr);
      setStatus(getTrialStatus(dLeft, cr));
    }
  }, [agentData]);

  const handleDismiss = () => {
    Animated.timing(dismissHeightAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setDismissed(true));
  };

  // Notification config
  const getNotificationConfig = () => {
    switch (status) {
      case TrialStatusType.LOW_CREDITS:
      case TrialStatusType.LOW_CREDITS_WSUB:
      case TrialStatusType.OUT_OF_CREDITS:
        return { title: `${credits} credits remaining`, message: customMessage || "Upgrade for more credits.", icon: <LowCreditsIcon height={40} width={40} />, bgColor: "#FFF8D4" };
      case TrialStatusType.EXPIRING_SOON:
        return { title: `Trial ends in ${daysLeft} days`, message: customMessage || "Don't lose access!", icon: <ExpiringSoonIcon height={37} width={37} />, bgColor: "#FFF8D4" };
      case TrialStatusType.EXPIRED:
        return { title: `Trial ended`, message: customMessage || "View plans.", icon: <TrailEndIcon height={40} width={40} />, bgColor: "#FFF8D4" };
      default:
        return { title: `Trial: ${daysLeft} days left`, message: `${credits} credits remain`, icon: <ExpiringSoonIcon height={37} width={37} />, bgColor: "#FFF8D4" };
    }
  };

  const config = getNotificationConfig();

  if (dismissed) return null;

  return (
    <Animated.View style={{ transform: [{ translateY: headerHeight }], zIndex: 10 }}>
      <View style={{ height: HEADER_HEIGHT, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15, backgroundColor: "#fff" }}>
        <TouchableOpacity onPress={() => onMenuPress(headerBackVisible)}>
          <Text>{headerBackVisible ? "<" : "☰"}</Text>
        </TouchableOpacity>
        <Text style={{ fontWeight: "bold" }}>{title}</Text>
        {!headerBackVisible && (
          <Text>{monthlyCredits + boosterCredits} 💰</Text>
        )}
      </View>

      {showNotificationBanner && (
        <Animated.View style={{ height: Animated.multiply(dismissHeightAnim, NOTIFICATION_HEIGHT), overflow: "hidden", backgroundColor: config.bgColor, paddingHorizontal: 15, flexDirection: "row", alignItems: "center" }}>
          <View style={{ marginRight: 10 }}>{config.icon}</View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "bold" }}>{config.title}</Text>
            <Text>{config.message}</Text>
          </View>
          <TouchableOpacity onPress={handleDismiss}>
            <Feather name="x" size={20} color="#000" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
};

export default AnimatedHeader;

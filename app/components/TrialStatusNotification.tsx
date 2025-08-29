import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, ViewStyle, Animated } from "react-native";
import {
  Feather,
  FontAwesome,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import ToStartIcon from "../../assets/icons/Notification/toStart.svg";
import ExpiringSoonIcon from "../../assets/icons/Notification/5_dayEnd.svg";
import LowCreditsIcon from "../../assets/icons/Notification/lowCredits.svg";
import TrailEndIcon from "../../assets/icons/Notification/trailEnd.svg";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { router, Router } from "expo-router";
import OnboardingFlow from "./Onboarding";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { ScrollContext } from "../ScrollContext";

// Define trial status types as enum
export enum TrialStatusType {
  ACTIVE = "active",
  LOW_CREDITS = "lowCredits",
  EXPIRING_SOON = "expiringSoon",
  EXPIRED = "expired",
  TO_START = "toStart",
  OUT_OF_CREDITS = "outOfCredits",
  LOW_CREDITS_WSUB = "lowCreditsWSub",
}

// Define props interface for the trial status notification component
interface TrialStatusNotificationProps {
  dismissible?: boolean;
  showNotification?: boolean;
  onDismiss?: () => void;
  customMessage?: string;
  style?: ViewStyle;
}

// Define the notification configuration type
interface NotificationConfig {
  bgColor: string;
  borderColor: string;
  iconBgColor: string;
  icon: JSX.Element;
  title: string;
  message: string;
}

/**
 * TrialStatusNotification Component for React Native
 *
 * A notification banner that displays the current status of a user's trial,
 * including days remaining, credits available, and appropriate visual indicators
 * for the urgency level of the notification.
 */
const TrialStatusNotification: React.FC<TrialStatusNotificationProps> = ({
  dismissible = true,
  showNotification = false,
  onDismiss = () => {},
  customMessage = "",
  style,
}) => {
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [status, setStatus] = useState<TrialStatusType>(TrialStatusType.ACTIVE);
  const [daysLeft, setDaysLeft] = useState<number>(28);
  const [credits, setCredits] = useState<number>(20);
  const agentData = useSelector((state: RootState) => state?.agent?.docData);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";
  const [dismissHeightAnim] = useState(new Animated.Value(1)); 
  const [contentHeight, setContentHeight] = useState(0);
  const { notificationHeight } = useContext(ScrollContext);
  const combinedHeight = Animated.multiply(notificationHeight, dismissHeightAnim);


  const calculateDaysLeft = (trialStartedAt: number): number => {
    try {
      const trialStartDate = new Date(trialStartedAt * 1000);

      if (isNaN(trialStartDate.getTime())) {
        return 31;
      }

      const trialEndDate = new Date(trialStartDate);
      trialEndDate.setDate(trialStartDate.getDate() + 30);

      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate());

      const timeDiff = trialEndDate.getTime() - currentDate.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

      return days;
    } catch (error) {
      return 31;
    }
  };

  const getTrialStatus = (daysLeft: number, credits: number) => {
    if (daysLeft < -3) {
      if (credits == 0) {
        return TrialStatusType.OUT_OF_CREDITS;
      } else {
        return TrialStatusType.LOW_CREDITS_WSUB;
      }
    } else if (daysLeft <= 0) {
      return TrialStatusType.EXPIRED;
    } else if (credits == 0) {
      return TrialStatusType.OUT_OF_CREDITS;
    } else if (credits <= 5) {
      return TrialStatusType.LOW_CREDITS;
    } else if (daysLeft <= 5) {
      return TrialStatusType.EXPIRING_SOON;
    } else if (daysLeft <= 30) {
      return TrialStatusType.ACTIVE;
    } else {
      return TrialStatusType.TO_START;
    }
  };

  useEffect(() => {
    if (agentData) {
      const calculatedDaysLeft = calculateDaysLeft(agentData?.trialStartedAt);
      const trialStatus = getTrialStatus(
        calculatedDaysLeft,
        agentData?.monthlyCredits
      );

      setStatus(trialStatus);
      setDaysLeft(calculatedDaysLeft);
      setCredits(agentData?.monthlyCredits);

      // Track trial status view
      try {
        logEvent(analytics, "trial_status_view", {
          event_category: "trial",
          event_label: "status",
          trial_status: trialStatus,
          days_left: calculatedDaysLeft,
          credits_remaining: agentData?.monthlyCredits,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging trial status view:", error);
      }
    }
  }, [agentData]);

  if (dismissed || !showNotification) return null;

  const handleDismiss = (): void => {
  Animated.timing(dismissHeightAnim, {
    toValue: 0,
    duration: 300,
    useNativeDriver: false, // layout property, cannot use native driver
  }).start(() => {
    // optional: remove from render if needed
    setDismissed(true);
  });

  try {
    logEvent(analytics, "dismiss_trial_notification", {
      event_category: "trial",
      event_label: "dismiss",
      trial_status: status,
      days_left: daysLeft,
      credits_remaining: credits,
      user_type: userType,
    });
  } catch (error) {
    console.error("Error logging notification dismiss:", error);
  }
};

  const handleNotificationClick = () => {
    try {
      logEvent(analytics, "trial_notification_click", {
        event_category: "trial",
        event_label: "click",
        trial_status: status,
        destination:
          status === TrialStatusType.TO_START ? "onboarding" : "compare_plans",
        days_left: daysLeft,
        credits_remaining: credits,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging notification click:", error);
    }

    if (status === TrialStatusType.TO_START) {
      setShowOnboarding(true);
    } else {
      router.push("/(pages)/ComparePlans");
    }
  };

  const handleOnboardingComplete = () => {
    try {
      logEvent(analytics, "onboarding_complete_from_trial", {
        event_category: "trial",
        event_label: "onboarding",
        trial_status: status,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging onboarding completion:", error);
    }
    setShowOnboarding(false);
  };

  const handleOnboardingClose = () => {
    try {
      logEvent(analytics, "onboarding_close_from_trial", {
        event_category: "trial",
        event_label: "onboarding",
        trial_status: status,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging onboarding close:", error);
    }
    setShowOnboarding(false);
  };

  // Configure notification based on trial status
  const getNotificationConfig = (): NotificationConfig => {
    switch (status) {
      case TrialStatusType.LOW_CREDITS:
        return {
          bgColor: "#FFF8D4", // amber-100
          borderColor: "#FFF8D4", // amber-200
          iconBgColor: "#FFF8D4", // amber-400
          icon: <LowCreditsIcon height={40} width={40} />, // amber-800
          title: `${credits} credits remaining`,
          message:
            customMessage || `New enquiries pause when credits reach zero.`,
        } as NotificationConfig;
      case TrialStatusType.LOW_CREDITS_WSUB:
        return {
          bgColor: "#FFF8D4", // amber-100
          borderColor: "#FFF8D4", // amber-200
          iconBgColor: "#FFF8D4", // amber-400
          icon: <LowCreditsIcon height={40} width={40} />, // amber-800
          title: `Only ${credits} credits left`,
          message: customMessage || `Upgrade to premium for more credits.`,
        } as NotificationConfig;
      case TrialStatusType.EXPIRING_SOON:
        return {
          bgColor: "#FFF8D4", // orange-100
          borderColor: "#FFF8D4", // orange-200
          iconBgColor: "#FFF8D4", // orange-400
          icon: <ExpiringSoonIcon height={37} width={37} />, // orange-800
          title: `Trial Ending Soon: ${daysLeft} days left`,
          message: customMessage || `Don't lose access to verified contacts.`,
        };
      case TrialStatusType.OUT_OF_CREDITS:
        return {
          bgColor: "#FFF8D4", // amber-100
          borderColor: "#FFF8D4", // amber-200
          iconBgColor: "#FFF8D4", // amber-400
          icon: <LowCreditsIcon height={40} width={40} />, // amber-800
          title: `Out of credits!`,
          message: customMessage || `Upgrade to premium for more credits.`,
        };
      case TrialStatusType.EXPIRED:
        return {
          bgColor: "#FFF8D4",
          borderColor: "#FFF8D4",
          iconBgColor: "#FFF8D4",
          icon: <TrailEndIcon height={40} width={40} />,
          title: `Trial ended`,
          message: customMessage || `View plans for no-limits usage.`,
        };
      case TrialStatusType.ACTIVE:
        return {
          bgColor: "#FFF8D4",
          borderColor: "#FFF8D4",
          iconBgColor: "#FFF8D4",
          icon: <ExpiringSoonIcon height={37} width={37} />, // amber-800
          title: `Free Trial: ${daysLeft} days left`,
          message:
            customMessage ||
            `${credits} Credits remain - make every enquiry count.`,
        };
      case TrialStatusType.TO_START:
        return {
          bgColor: "#FFF8D4",
          borderColor: "#FFF8D4",
          iconBgColor: "#FEF3C7",
          icon: <ToStartIcon height={36} width={36} />,
          title: `Get 1 Month of Free-Trial.`,
          message: customMessage || `Enjoy ACN with no-limits.`,
        };
      default:
        return {
          bgColor: "#FEF3C7",
          borderColor: "#FFF8D4",
          iconBgColor: "#FBBF24",
          icon: <FontAwesome name="trophy" size={20} color="#92400E" />, // amber-800
          title: `Free Trial: ${daysLeft} days left`,
          message:
            customMessage ||
            `${credits} Credits remain - make every enquiry count.`,
        };
    }
  };

  const config = getNotificationConfig();

  return (
    <>
    <Animated.View
  style={{
    height: combinedHeight,
    overflow: "hidden",
  }}
  
>
      <View
        className="flex-row justify-between items-center pl-5 pr-10 py-3 border-b"
        style={[
          {
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
          },
          style,
        ]}
      >
        <TouchableOpacity
          className="flex-row items-center"
          onPress={handleNotificationClick}
        >
          <View
            className="rounded-full p-2 mr-3"
            style={{ backgroundColor: config.iconBgColor, alignSelf: 'flex-start' }}
          >
            {config.icon}
          </View>
          <View className="flex-1">
            <Text
              className="text-sm text-[#0A0B0A]"
              style={{ fontFamily: "Lato_700Bold" }}
            >
              {config.title}
            </Text>
            <Text
              className="text-xs text-[#0A0B0A]"
              style={{ fontFamily: "Lato_400Regular" }}
            >
              {config.message}
            </Text>
          </View>
        </TouchableOpacity>

        {dismissible && (
          <TouchableOpacity
            onPress={handleDismiss}
            accessibilityLabel="Dismiss notification"
          >
            <Feather name="x" size={25} color="#0A0B0A" />
          </TouchableOpacity>
        )}
      </View>
      {showOnboarding && (
        <OnboardingFlow
          visible={showOnboarding}
          onComplete={handleOnboardingComplete}
          onClose={handleOnboardingClose}
        />
      )}
      </Animated.View>
    </>
  );
};

// Showcase component to demonstrate different notification states
const TrialNotificationShowcase: React.FC = () => {
  return (
    <View className="py-6 px-4 gap-6">
      <View className="rounded-lg overflow-hidden shadow-sm">
        <TrialStatusNotification />
      </View>
      <View className="rounded-lg overflow-hidden shadow-sm">
        <TrialStatusNotification />
      </View>
      <View className="rounded-lg overflow-hidden shadow-sm">
        <TrialStatusNotification />
      </View>
      <View className="rounded-lg overflow-hidden shadow-sm">
        <TrialStatusNotification />
      </View>
      <View className="rounded-lg overflow-hidden shadow-sm">
        <TrialStatusNotification customMessage="Enjoy ACN with no-limits." />
      </View>
      <View className="rounded-lg overflow-hidden shadow-sm">
        <TrialStatusNotification customMessage="Special offer: Upgrade now and get 50% extra credits!" />
      </View>
    </View>
  );
};

export default TrialNotificationShowcase;
export { TrialStatusNotification };

import React, { useState } from "react";
import { View, Text, TouchableOpacity, ViewStyle } from "react-native";
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

// Define trial status types as enum
export enum TrialStatusType {
  ACTIVE = "active",
  LOW_CREDITS = "lowCredits",
  EXPIRING_SOON = "expiringSoon",
  EXPIRED = "expired",
  TO_START = "toStart",
  OUT_OF_CREDITS = "outOfCredits",
  LOW_CREDITS_WSUB ='lowCreditsWSub'
}

// Define props interface for the trial status notification component
interface TrialStatusNotificationProps {
  status?: TrialStatusType;
  daysLeft?: number;
  credits?: number;
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
  status = TrialStatusType.ACTIVE,
  daysLeft = 28,
  credits = 20,
  dismissible = true,
  showNotification = false,
  onDismiss = () => {},
  customMessage = "",
  style,
}) => {
  const [dismissed, setDismissed] = useState<boolean>(false);

  if (dismissed || !showNotification) return null;

  const handleDismiss = (): void => {
    setDismissed(true);
    // onDismiss();
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
          title:  `5 credits remaining`,
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
            message:
              customMessage || `Add more credits or explore plans.`,
          } as NotificationConfig;
      case TrialStatusType.EXPIRING_SOON:
        return {
          bgColor: "#FFF8D4", // orange-100
          borderColor: "#FFF8D4", // orange-200
          iconBgColor: "#FFF8D4", // orange-400
          icon: <ExpiringSoonIcon height={37} width={37} />, // orange-800
          title: `Trial Ending Soon: ${daysLeft} days left`,
          message: customMessage ||  `Don’t lose access to verified contacts.`,
        };
      case TrialStatusType.OUT_OF_CREDITS:
        return {
          bgColor: "#FFF8D4", // amber-100
          borderColor: "#FFF8D4", // amber-200
          iconBgColor: "#FFF8D4", // amber-400
          icon: <LowCreditsIcon height={40} width={40} />, // amber-800
          title: `Out of credits!`,
          message:
            customMessage || `Add more credits or explore plans.`,
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
          icon:<ExpiringSoonIcon height={37} width={37} />,  // amber-800
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
      <View className="flex-row items-center">
        <View
          className="rounded-full p-2 mr-3"
          style={{ backgroundColor: config.iconBgColor }}
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
          <Text className="text-xs text-[#0A0B0A]" style={{ fontFamily: "Lato_400Regular" }}>{config.message}</Text>
        </View>
      </View>
      {dismissible && (
        <TouchableOpacity
          onPress={handleDismiss}
          accessibilityLabel="Dismiss notification"
        >
          <Feather name="x" size={25} color="#0A0B0A" />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Showcase component to demonstrate different notification states
const TrialNotificationShowcase: React.FC = () => {
  return (
    <View className="py-6 px-4 gap-6">
      <View className="rounded-lg overflow-hidden shadow-sm">
        <TrialStatusNotification
          status={TrialStatusType.ACTIVE}
          daysLeft={28}
          credits={20}
        />
      </View>
      <View className="rounded-lg overflow-hidden shadow-sm">
        <TrialStatusNotification
          status={TrialStatusType.LOW_CREDITS}
          credits={5}
        />
      </View>
      <View className="rounded-lg overflow-hidden shadow-sm">
        <TrialStatusNotification
          status={TrialStatusType.EXPIRING_SOON}
          daysLeft={3}
          credits={12}
        />
      </View>
      <View className="rounded-lg overflow-hidden shadow-sm">
        <TrialStatusNotification status={TrialStatusType.EXPIRED} />
      </View>
      <View className="rounded-lg overflow-hidden shadow-sm">
        <TrialStatusNotification
          status={TrialStatusType.TO_START}
          customMessage="Enjoy ACN with no-limits."
        />
      </View>
      <View className="rounded-lg overflow-hidden shadow-sm">
        <TrialStatusNotification
          status={TrialStatusType.ACTIVE}
          daysLeft={14}
          credits={10}
          customMessage="Special offer: Upgrade now and get 50% extra credits!"
        />
      </View>
    </View>
  );
};

export default TrialNotificationShowcase;
export { TrialStatusNotification };

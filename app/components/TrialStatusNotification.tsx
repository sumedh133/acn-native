import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle
} from 'react-native';
import {
  Feather,
  FontAwesome,
  MaterialIcons,
  MaterialCommunityIcons
} from '@expo/vector-icons';
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';

// Define trial status types as enum
export enum TrialStatusType {
  ACTIVE = 'active',
  LOW_CREDITS = 'lowCredits',
  EXPIRING_SOON = 'expiringSoon',
  EXPIRED = 'expired'
}

// Define props interface for the trial status notification component
interface TrialStatusNotificationProps {
  status?: TrialStatusType;
  daysLeft?: number;
  credits?: number;
  dismissible?: boolean;
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
  onDismiss = () => {},
  customMessage = '',
  style
}) => {
  const [dismissed, setDismissed] = useState<boolean>(false);

  if (dismissed) return null;

  const handleDismiss = (): void => {
    setDismissed(true);
    onDismiss();
  };

  // Configure notification based on trial status
  const getNotificationConfig = (): NotificationConfig => {
    switch(status) {
      case TrialStatusType.LOW_CREDITS:
        return {
          bgColor: '#FEF3C7', // amber-100
          borderColor: '#FDE68A', // amber-200
          iconBgColor: '#FBBF24', // amber-400
          icon: <MaterialCommunityIcons name="credit-card" size={20} color="#92400E" />, // amber-800
          title: `Low Credits Alert`,
          message: customMessage || `Only ${credits} credits remain - use them wisely.`
        };
      case TrialStatusType.EXPIRING_SOON:
        return {
          bgColor: '#FFEDD5', // orange-100
          borderColor: '#FED7AA', // orange-200
          iconBgColor: '#FB923C', // orange-400
          icon: <MaterialIcons name="access-time" size={20} color="#9A3412" />, // orange-800
          title: `Trial Ending Soon: ${daysLeft} days left`,
          message: customMessage || `${credits} Credits remain - upgrade now to continue.`
        };
      case TrialStatusType.EXPIRED:
        return {
          bgColor: '#FEE2E2',
          borderColor: '#FECACA',
          iconBgColor: '#F87171',
          icon: <Feather name="alert-triangle" size={20} color="#991B1B" />, // red-800
          title: `Trial Expired`,
          message: customMessage || `Subscribe now to continue using all features.`
        };
      case TrialStatusType.ACTIVE:
      default:
        return {
          bgColor: '#FEF3C7',
          borderColor: '#FDE68A',
          iconBgColor: '#FBBF24',
          icon: <FontAwesome name="trophy" size={20} color="#92400E" />, // amber-800
          title: `Free Trial: ${daysLeft} days left`,
          message: customMessage || `${credits} Credits remain - make every enquiry count.`
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
          borderColor: config.borderColor
        },
        style
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
          <Text className="font-bold text-sm text-[#0A0B0A]" style={{fontFamily:"Lato"}}>{config.title}</Text>
          <Text className="text-xs text-[#0A0B0A]">{config.message}</Text>
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
        <TrialStatusNotification status={TrialStatusType.ACTIVE} daysLeft={28} credits={20} />
      </View>
      <View className="rounded-lg overflow-hidden shadow-sm">
        <TrialStatusNotification status={TrialStatusType.LOW_CREDITS} credits={5} />
      </View>
      <View className="rounded-lg overflow-hidden shadow-sm">
        <TrialStatusNotification status={TrialStatusType.EXPIRING_SOON} daysLeft={3} credits={12} />
      </View>
      <View className="rounded-lg overflow-hidden shadow-sm">
        <TrialStatusNotification status={TrialStatusType.EXPIRED} />
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
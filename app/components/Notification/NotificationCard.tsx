import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { toCapitalizedWords } from "@/app/helpers/common";
import { NotificationItem } from "@/app/types";

// Map notification types to icon/color and default CTAs if needed
const notificationTypeConfig: Record<
  string,
  { icon: string; color: string; defaultCta?: string[] }
> = {
  "enquired-on-your-property": {
    icon: "email-outline",
    color: "#007bff",
    defaultCta: ["View", "Reply"],
  },
  "new-feature-alert": { icon: "star-outline", color: "#f59e42" },
  "enquiry-success": { icon: "check-circle-outline", color: "#22C55E" },
  "going-to-be-delisted-alert": {
    icon: "alert-outline",
    color: "#fbbf24",
    defaultCta: ["Available", "Sold"],
  },
  "delisted-property-alert": { icon: "close-circle-outline", color: "#ef4444" },
  "status-update-property": { icon: "update", color: "#6366f1" },
  "listing-updates": { icon: "format-list-bulleted", color: "#0ea5e9" },
  "credits-purchased": { icon: "credit-card-outline", color: "#10b981" },
  "listing-submitted": { icon: "send-outline", color: "#3b82f6" },
  "premium-purchased": { icon: "crown-outline", color: "#f59e42" },
  "requirement-posted": { icon: "clipboard-list-outline", color: "#6366f1" },
  "free-trial-ended": { icon: "timer-off-outline", color: "#ef4444" },
  "trial-expires-20-days": { icon: "timer-outline", color: "#fbbf24" },
  "free-trial-live": { icon: "timer-sand", color: "#22C55E" },
};

interface NotificationCardProps {
  notification: NotificationItem;
  onCtaPress?: (action: string, notification: NotificationItem) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onCtaPress,
}) => {
  const config = notificationTypeConfig[notification.type] || {
    icon: "bell-outline",
    color: "#888",
  };
  const ctaButtons =
    notification.cta && notification.cta.length > 0
      ? notification.cta
      : config.defaultCta || [];

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 10,
        marginVertical: 6,
        padding: 16,
        alignItems: "flex-start",
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: config.color + "22",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <MaterialCommunityIcons
          name={config.icon as any}
          size={22}
          color={config.color}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15 }}>
          {notification.title}
        </Text>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            color: "#374151",
            marginVertical: 4,
          }}
        >
          {notification.body}
        </Text>
        {ctaButtons.length > 0 && (
          <View style={{ flexDirection: "row", gap: 10, marginTop: 2 }}>
            {ctaButtons.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => onCtaPress && onCtaPress(action, notification)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 16,
                  borderRadius: 6,
                  backgroundColor: idx === 0 ? config.color : "#fff",
                  borderWidth: 1,
                  borderColor: idx === 0 ? config.color : "#ccc",
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    color: idx === 0 ? "#fff" : "#374151",
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                  }}
                >
                  {toCapitalizedWords(action)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      <TouchableOpacity style={{ padding: 4, marginLeft: 2 }}>
        <MaterialIcons name="more-horiz" size={20} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
};

export default NotificationCard;

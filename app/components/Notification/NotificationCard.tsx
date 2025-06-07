import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { toCapitalizedWords } from "@/app/helpers/common";
import { NotificationItem } from "@/app/types";
import NotificationMoreOptions from "./NotificationMoreOptions";
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
  enquiry_buyer_notification: {
    icon: "check-circle-outline",
    color: "#22C55E",
  },
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
  addedTime: number;
  onCtaPress?: (action: string, notification: NotificationItem) => void;
}

const ctaIconMap: Record<string, React.ReactNode> = {
  "Call Agent": (
    <MaterialIcons
      name="call"
      size={16}
      color="#fff"
      // style={{ marginRight: 6 }}
    />
  ),
  "Message Agent": (
    <MaterialCommunityIcons
      name="whatsapp"
      size={16}
      color="#153E3B"
      // style={{ marginRight: 6 }}
    />
  ),
  "Try now": (
    <MaterialCommunityIcons
      name="clock-outline"
      size={16}
      color="#fff"
      // style={{ marginRight: 6 }}
    />
  ),
  Available: (
    <MaterialIcons
      name="check-circle"
      size={16}
      color="#fff"
      // style={{ marginRight: 6 }}
    />
  ),
  Sold: (
    <MaterialIcons
      name="sell"
      size={16}
      color="#153E3B"
      // style={{ marginRight: 6 }}
    />
  ),
  "Call Kam": (
    <MaterialIcons
      name="call"
      size={16}
      color="#fff"
      // style={{ marginRight: 6 }}
    />
  ),
  Dashboard: (
    <MaterialIcons
      name="dashboard"
      size={16}
      color="#153E3B"
      // style={{ marginRight: 6 }}
    />
  ),
  "View Credits": (
    <MaterialIcons
      name="credit-card"
      size={16}
      color="#fff"
      // style={{ marginRight: 6 }}
    />
  ),
  "Add New Inventory": (
    <MaterialIcons
      name="add"
      size={16}
      color="#153E3B"
      // style={{ marginRight: 6 }}
    />
  ),
  Edit: (
    <MaterialIcons
      name="edit"
      size={16}
      color="#fff"
      // style={{ marginRight: 6 }}
    />
  ),
  "View Details": (
    <MaterialIcons
      name="visibility"
      size={16}
      color="#fff"
      // style={{ marginRight: 6 }}
    />
  ),
  "Get Premium": (
    <MaterialCommunityIcons
      name="crown-outline"
      size={16}
      color="#fff"
      // style={{ marginRight: 6 }}
    />
  ),
  "Compare Plans": (
    <MaterialIcons
      name="compare"
      size={16}
      color="#153E3B"
      // style={{ marginRight: 6 }}
    />
  ),
  Properties: (
    <MaterialIcons
      name="home"
      size={16}
      color="#fff"
      // style={{ marginRight: 6 }}
    />
  ),
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onCtaPress,
  addedTime,
}) => {
  const config = notificationTypeConfig[notification.type] || {
    icon: "bell-outline",
    color: "#153E3B",
  };

  const notifType = {
    "enquired-on-your-property": {
      icon: "email-outline",
      color: "#007bff",
      title: false,
    },
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const ctaButtons =
    Array.isArray(notification.cta) && notification.cta.length > 0
      ? notification.cta
      : Array.isArray(config.defaultCta)
      ? config.defaultCta
      : [];

  // Avatar: initials or logo
  const renderAvatar = () => {
    if (notification.icon === "initials") {
      const initials = notification.additionalData.buyerName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();
      return (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#000",

            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
            }}
          >
            {initials}
          </Text>
        </View>
      );
    }
    // Default: logo
    return (
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>ACN</Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: notification.isRead ? "#FFFFFF" : "#E0F7F4" },
      ]}
    >
      <View style={styles.avatarContainer}>
        {!notification.isRead ? (
          <View style={styles.unreadDot} />
        ) : (
          <View style={{ width: 10, height: 10 }} />
        )}
        {renderAvatar()}
      </View>
      <View style={styles.contentContainer}>
        <View
          // style={{ flexDirection: "column", width: "80%", paddingLeft: 12 }}
          className="flex flex-col flex-1 items-start space-y-[8px]"
        >
          {notification.title !== "" && (
            <Text style={styles.title}>{notification.title}</Text>
          )}
          <Text style={styles.body}>{notification.body}</Text>
          {ctaButtons.length > 0 && (
            <View style={styles.ctaContainer}>
              {ctaButtons.map((action, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => onCtaPress && onCtaPress(action, notification)}
                  style={[
                    styles.ctaButton,
                    {
                      backgroundColor: idx === 0 ? "#153E3B" : "#fff",
                      borderColor: idx === 0 ? "#153E3B" : "#ccc",
                    },
                  ]}
                >
                  {ctaIconMap[action] || null}
                  <Text
                    style={[
                      // styles.ctaButtonText,
                      { color: idx === 0 ? "#fff" : "#153E3B" },
                    ]}
                    className="font-sans font-medium text-[14px] leading-1.5"
                  >
                    {toCapitalizedWords(action)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View className="flex flex-col items-end justify-start">
          <Text style={styles.timeText}>{getTimeAgo(addedTime)}</Text>
          <NotificationMoreOptions notification={notification} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    paddingLeft: 24,
    paddingTop: 24,
    alignItems: "flex-start",
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
    fontFamily: "Lora_600SemiBold",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    paddingBottom: 24,
    paddingRight: 24,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#1E293B",
  },
  boldText: {
    fontWeight: "bold",
    color: "#222",
  },
  highlightText: {
    fontWeight: "bold",
    color: "#153E3B",
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#334155",
  },
  ctaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    // flexWrap: "wrap",
    gap: 8,
    paddingVertical: 4,
    // marginTop: 8,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
  // ctaButtonText: {
  //   fontFamily: "Inter_500Medium",
  //   fontSize: 14,
  //   // lineHeight: 15,
  // },
  timeText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  moreButton: {
    flex: 1,
    alignSelf: "flex-end",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    marginHorizontal: 0,
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#153E3B",
    textAlign: "center",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#153E3B",
    marginRight: 4,
    alignSelf: "center",
  },
});

export default NotificationCard;

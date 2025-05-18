import React, { ReactNode } from "react";
import { Text, TouchableOpacity } from "react-native";
import { StyleSheet, View } from "react-native";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export interface ProfileCardInterface {
  title: string;
  icon: ReactNode;
  slug: string;
}

const ProfileCard = ({
  item,
  handleCardClick,
}: {
  item: ProfileCardInterface;
  handleCardClick: (slug: string) => void;
}) => {
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  const handleClick = () => {
    try {
      logEvent(analytics, 'profile_card_click', {
        event_category: 'profile',
        event_label: 'navigation',
        card_title: item?.title,
        destination: item?.slug,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging profile card click:', error);
    }
    handleCardClick(item?.slug);
  };

  return (
    <TouchableOpacity
      onPress={handleClick}
      style={styles.card}
    >
      <View style={styles.icon}>{item?.icon}</View>
      <Text style={styles.text}>{item?.title}</Text>
    </TouchableOpacity>
  );
};

export default React.memo(ProfileCard);

const styles = StyleSheet.create({
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    paddingVertical: 16,
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  icon: {
    marginTop: 8,
  },
  text: {
    fontFamily: "Montserrat_700SemiBold",
    fontSize: 12,
    lineHeight: 18,
    color: "#5A5555",
    width: 58,
    textAlign: "center",
  },
});

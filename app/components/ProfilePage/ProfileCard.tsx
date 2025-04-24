import React, { ReactNode } from "react";
import { Text, TouchableOpacity } from "react-native";
import { StyleSheet, View } from "react-native";

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
  return (
    <TouchableOpacity
      onPress={() => handleCardClick(item?.slug)}
      style={styles.card}
    >
      <View style={styles.icon}>{item?.icon}</View>
      <Text style={styles.text}>{item?.title}</Text>
    </TouchableOpacity>
  );
};

export default ProfileCard;

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
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 12,
    lineHeight: 18,
    color: "#5A5555",
    width: 58,
    textAlign: "center",
  },
});

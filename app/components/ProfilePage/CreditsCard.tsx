import RightArrowIcon from "@/assets/icons/svg/Common/ArrowRightIcon";
import CoinIcon from "@/assets/icons/svg/Sidebar/CoinIcon";
import { RootState } from "@/store/store";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

const CreditsCard = ({
  handleCardClick,
  slug,
}: {
  handleCardClick: (slug: string) => void;
  slug: string;
}) => {
  const monthlyCredits = useSelector(
    (state: RootState) => state?.agent?.docData?.monthlyCredits
  );

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        handleCardClick(slug);
      }}
      activeOpacity={1}
    >
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <CoinIcon width={24} height={24} />
          <Text style={styles.creditsText}>ACN Credits</Text>
        </View>
        <RightArrowIcon width={20} height={20} />
      </View>
      <View style={styles.partition}></View>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.creditsLabel}>Available Credits :</Text>
          <Text style={styles.creditsText}>{monthlyCredits}</Text>
        </View>
        <View style={styles.button}>
          <Text style={styles.buttonText}>Add Credits</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(CreditsCard);

const styles = StyleSheet.create({
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    backgroundColor: "#DFF4F3",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#B6F7D4",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  creditsLabel: {
    fontFamily: "Lato",
    fontWeight: 500,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.25,
    color: "#8A8A8A",
  },
  creditsText: {
    fontFamily: "Montserrat",
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 21,
    color: "#0A0B0A",
  },
  partition: {
    width: "100%",
    height: 1,
    backgroundColor: "#E3E3E3",
  },
  button: {
    display: "flex",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#153E3B",
  },
  buttonText: {
    fontFamily: "Lato",
    fontWeight: 500,
    fontSize: 14,
    lineHeight: 18,
    color: "#FFFFFF",
  },
});

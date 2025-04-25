import DoubleRightArrowIcon from "@/assets/icons/svg/Common/DoubleRightArrow";
import PremiumIcon from "@/assets/icons/svg/ProfilePage/PremiumIcon";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const GetPremiumCard = ({
  handleClick,
  slug,
}: {
  handleClick: (slug: string) => void;
  slug: string;
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleClick(slug)}
      activeOpacity={1}
    >
      <View style={styles.informationContainer}>
        <Text style={styles.textContainer}>
          <Text style={styles.text}>
            Save time and get ahead with unlimited enquiries, priority support,
            and exclusive features, just
          </Text>
          <Text style={styles.textBold}> ₹10,500/year!</Text>
        </Text>
        <PremiumIcon width={48} height={48} />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleClick(slug)}
        activeOpacity={1}
      >
        <Text style={styles.buttonText}>Get Premium</Text>
        <DoubleRightArrowIcon width={20} height={20} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default React.memo(GetPremiumCard);

const styles = StyleSheet.create({
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 24,
    backgroundColor: "#1B665D",
    borderWidth: 1,
    borderColor: "#10302D",
    borderRadius: 24,
    marginBottom: 17,
  },
  informationContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  textContainer: {
    width: 215,
  },
  text: {
    fontFamily: "Lato",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: 500,
    color: "#CCCBCB",
  },
  textBold: {
    fontFamily: "Lato",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: 700,
    color: "#FFFFFF",
  },
  button: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F9D274",
    borderRadius: 6,
    marginBottom: -17,
  },
  buttonText: {
    fontFamily: "Lato",
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 21,
    color: "#000000",
  },
});

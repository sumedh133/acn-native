import AddInventoryIcon from "@/assets/icons/svg/Footer/AddInventoryIcon";
import React, { ReactNode } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AddRequirementsIcon from "../assets/icons/svg/Footer/AddRequirementsIcon";
import LinearGradient from "react-native-linear-gradient";

interface popupItems {
  slug: string;
  icon: ReactNode;
  text: string;
  subText: string;
  colors: string[];
  iconColor: string;
  deeplink: string;
}
const items: popupItems[] = [
  {
    slug: "add_inventory",
    icon: <AddInventoryIcon width={24} height={24} />,
    text: "Add Inventory",
    subText: "Add your inventory to increase visibility",
    colors: ["#FFFCEC", "#FFFFFF"],
    iconColor: "#FFE86A",
    deeplink: "(tabs)/AddInventoryForm",
  },
  {
    slug: "add_requirement",
    icon: <AddRequirementsIcon width={24} height={24} />,
    text: "Add Requirement",
    subText: "Add your requirements to find inventory.",
    colors: ["#F1FFFE", "#FFFFFF"],
    iconColor: "#BFE9E6",
    deeplink: "(tabs)/UserRequirementForm",
  },
];
const AddPopup = ({
  handlePopupCardPress,
  slideAnimation,
}: {
  handlePopupCardPress: (deeplink: string) => void;
  slideAnimation: Animated.Value;
}) => {
  return (
    <Animated.View
      style={[styles.popup, { transform: [{ translateY: slideAnimation }] }]}
    >
      {items?.map((item, idx) => {
        return (
          <TouchableOpacity
            key={idx}
            onPress={() => handlePopupCardPress(item?.deeplink)}
          >
            <LinearGradient
              colors={item?.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.card}
            >
              <View
                style={[styles?.icon, { backgroundColor: item?.iconColor }]}
              >
                {item?.icon}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.text}>{item?.text}</Text>
                <Text style={styles.subText}>{item?.subText}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 100,
    width: "100%",
    height: "100%",
    backgroundColor: "#00000033",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    paddingBottom: 59,
  },
  popup: {
    width: "100%",
    backgroundColor: "#FBFCFB",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 36,
    paddingHorizontal: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  card: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F2F2F2",
    display: "flex",
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  text: {
    fontFamily: "Lato",
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 21,
    color: "#0C0C0C",
  },
  subText: {
    fontFamily: "Lato",
    fontWeight: 500,
    fontSize: 14,
    lineHeight: 21,
    color: "#575757",
  },
  icon: {
    padding: 14,
    borderRadius: 50,
  },
});

export default AddPopup;

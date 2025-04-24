import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  useFonts,
} from "@expo-google-fonts/montserrat";
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
} from "react-native";
import HamburgerMenuIcon from "@/assets/icons/svg/HamburgerMenuIcon";

interface HamburgerMenuButtonProps {
  onPress: () => void;
  isOpen: boolean;
  showACN?: boolean;
}

export const HamburgerMenuButton = ({
  onPress,
  isOpen,
  showACN = false,
}: HamburgerMenuButtonProps) => {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  // Return a loading indicator or null while fonts are loading
  if (!fontsLoaded) {
    return null; // Or a loading spinner component
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.hamburgerContainer}>
          <HamburgerMenuIcon />
        </View>
        {showACN && <Text style={styles.acnText}>ACN</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  hamburgerContainer: {
    width: 28,
    height: 20,
    justifyContent: "space-between",
    marginLeft: 6,
    bottom: 5,
  },
  hamburgerLine: {
    height: 3,
    backgroundColor: "#000",
    borderRadius: 2,
  },
  hamburgerLineOpen: {
    backgroundColor: "#153E3B",
  },
  acnText: {
    left: 25,
    fontFamily: "Montserrat_700Bold",
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
  buttonLabel: {
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontSize: 16,
    fontWeight: "500",
    color: "#252626",
  },
});

import React from "react";
import { StyleSheet, Text, View } from "react-native";

const CommunityType = () => {
  return (
    <View style={styles.section}>
      <View style={styles.headingContainer}>
        <Text style={styles.sectionHeading}>Community Type</Text>
        <Text style={styles.compulsoryStar}>*</Text>
      </View>

      <View style={styles.optionContainer}>

          </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    width: "100%",
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 12,
  },
  headingContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
  },
  sectionHeading: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
  },
  compulsoryStar: {
    fontFamily: "sans-serif",
    color: "#DC3545",
    fontSize: 14,
    fontWeight: "400",
  },
    optionContainer: {
        backgroundColor: "#affaaf",
        width: "100%",
  }
});

export default CommunityType;

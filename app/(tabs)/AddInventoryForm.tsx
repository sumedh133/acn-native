import { Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import PlacesSearch from "../components/Listing/PlacesSearch";
import { useEffect, useState } from "react";
import { Places } from "../types";
import { getMicromarketFromCoordinates } from "../helpers/getMicromarketFromCoordinates";

const AddInventoryForm = () => {
  const [selectedPlace, setSelectedPlace] = useState<Places | null>(null);
  console.log("selectedPlace", selectedPlace);

  useEffect(() => {
    if (selectedPlace && !selectedPlace.micromarket) {
      const mm = getMicromarketFromCoordinates(selectedPlace);

      setSelectedPlace({
        ...selectedPlace,
        micromarket: mm,
      });
    }
  }, [selectedPlace]);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.section}>
          <View style={styles.headingContainer}>
            <Text style={styles.sectionHeading}>Project Name</Text>
            <Text style={styles.compulsoryStar}>*</Text>
          </View>
          <PlacesSearch
            selectedPlace={selectedPlace}
            setSelectedPlace={setSelectedPlace}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    backgroundColor: "#F5F6F7",
    paddingVertical: 16,
    paddingHorizontal: 12,
    width: "100%",
  },
  container: {
    flex: 1,
    gap: 16,
  },
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
});

export default AddInventoryForm;

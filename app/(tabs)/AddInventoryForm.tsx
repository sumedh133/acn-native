import { Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Text } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import PlacesSearch from "../components/Listing/PlacesSearch";
import { useEffect, useState } from "react";
import { Places } from "../types";
import { getMicromarketFromCoordinates } from "../helpers/getMicromarketFromCoordinates";
import React from "react";
import Appartments from "@/assets/icons/svg/AddInventory/Appartments";
import Villa from "@/assets/icons/svg/AddInventory/Villa";
import Plots from "@/assets/icons/svg/AddInventory/Plots";
import RowHouse from "@/assets/icons/svg/AddInventory/RowHouse";
import Villaments from "@/assets/icons/svg/AddInventory/Villaments";
import OfficeSpace from "@/assets/icons/svg/AddInventory/OfficeSpace";

// Updated type to include React component as icon
type AssetOption = {
  title: string;
  assetType: string;
  icon: React.ReactNode; // Updated to React.ReactNode to accept components
};

const AddInventoryForm = () => {
  const [selectedPlace, setSelectedPlace] = useState<Places | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [seeMore, setSeeMore] = useState(false);

  useEffect(() => {
    if (selectedPlace && !selectedPlace.micromarket) {
      const mm = getMicromarketFromCoordinates(selectedPlace);

      setSelectedPlace({
        ...selectedPlace,
        micromarket: mm,
      });
    }
  }, [selectedPlace]);

  console.log("selectedPlace", selectedPlace);

  // Updated asset options with icon as React component
  const assetOptions: AssetOption[] = [
    { title: "Flats/Apartments", assetType: "Apartment", icon: <Appartments /> },
    { title: "Villa", assetType: "Villa", icon: <Villa /> },
    { title: "Plot", assetType: "Plot", icon: <Plots /> },
    { title: "Row House", assetType: "Row House", icon: <RowHouse /> },
    { title: "Villament", assetType: "Villament", icon: <Villaments /> },
    { title: "Office Space", assetType: "Office Space", icon: <OfficeSpace /> },
    { title: "Independent Building", assetType: "Independent Building", icon: <Appartments /> },
  ];

  const toggleSeeMore = () => {
    setSeeMore((prev) => !prev);
  };

  const renderAssetOption = ({
    item,
    index,
  }: {
    item: AssetOption;
    index: number;
  }) => {
    const isSelected = selectedAsset === item.assetType;

    return (
      <TouchableOpacity
        style={[styles.assetItem, isSelected && styles.selectedAssetItem]}
        onPress={() => setSelectedAsset(item.assetType)}
      >
        {/* Render the icon component */}
        <View style={styles.iconContainer}>
          {React.cloneElement(item.icon as React.ReactElement, {
            color: isSelected ? "#007BFF" : "#2B3034",
          })}
        </View>

        <Text
          style={[
            styles.assetItemText,
            isSelected && styles.selectedAssetItemText,
          ]}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Places Search */}
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

        {/* Asset Type */}
        <View style={styles.section}>
          <View style={styles.headingContainer}>
            <Text style={styles.sectionHeading}>Asset Type</Text>
            <Text style={styles.compulsoryStar}>*</Text>
          </View>

          <FlatList
            data={assetOptions}
            renderItem={renderAssetOption}
            keyExtractor={(item) => item.assetType}
            numColumns={2}
            columnWrapperStyle={styles.assetGridRow}
            scrollEnabled={false}
            contentContainerStyle={styles.assetGridContainer}
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
  assetGridContainer: {
    width: "100%",
  },
  assetGridRow: {
    justifyContent: "space-between",
    marginBottom: 12, // vertical spacing (space-y)
  },
  assetItem: {
    width: "48%", // slightly less than 50% to account for space between
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 80,
  },
  selectedAssetItem: {
    borderColor: "#007BFF",
    backgroundColor: "#F0F8FF",
  },
  iconContainer: {
    marginBottom: 8,
  },
  assetItemText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 13,
    textAlign: "center",
  },
  selectedAssetItemText: {
    color: "#007BFF",
  },
});

export default AddInventoryForm;

import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";

// Icon components
const TrashIcon = () => (
  <View style={styles.trashIcon}>
    <View style={styles.trashTop} />
    <View style={styles.trashBottom} />
  </View>
);

const PlusIcon = () => (
  <View style={styles.plusIcon}>
    <View style={styles.plusHorizontal} />
    <View style={styles.plusVertical} />
  </View>
);

// Property interface
interface Property {
  id: string;
  name: string;
  location: string;
  size: string;
  furnishStatus: string;
  lastEdited: string;
}

const DraftsScreen: React.FC = () => {
  // Sample data
  const [properties, setProperties] = useState<Property[]>([
    {
      id: "1",
      name: "Sobha Royal Pa Pavillion",
      location: "Sarjapura",
      size: "1200 Sqft",
      furnishStatus: "Semi-Furnished",
      lastEdited: "26/Apr/2025",
    },
    {
      id: "2",
      name: "Sobha Royal Pa Pavillion",
      location: "Sarjapura",
      size: "1200 Sqft",
      furnishStatus: "Semi-Furnished",
      lastEdited: "26/Apr/2025",
    },
    {
      id: "3",
      name: "Sobha Royal Pa Pavillion",
      location: "Sarjapura",
      size: "1200 Sqft",
      furnishStatus: "Semi-Furnished",
      lastEdited: "26/Apr/2025",
    },
    {
      id: "4",
      name: "Sobha Royal Pa Pavillion",
      location: "Sarjapura",
      size: "1200 Sqft",
      furnishStatus: "Semi-Furnished",
      lastEdited: "26/Apr/2025",
    },
    {
      id: "5",
      name: "Sobha Royal Pa Pavillion",
      location: "Sarjapura",
      size: "1200 Sqft",
      furnishStatus: "Semi-Furnished",
      lastEdited: "26/Apr/2025",
    },
  ]);

  const deleteProperty = (id: string) => {
    setProperties(properties.filter((property) => property.id !== id));
  };

  const addNewProperty = () => {
    // Implementation for adding a new property
    console.log("Add new property");
    setTimeout(() => {
    router.replace("/(tabs)/AddInventoryForm")
    }, 0)
  };

  const renderPropertyItem = ({ item }: { item: Property }) => (
    <View style={styles.propertyItem}>
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyName}>{item.name}</Text>
        <Text style={styles.propertyDetails}>
          3 BHK Apartment in {item.location}
        </Text>
        <Text style={styles.propertyDetails}>
          {item.size} | {item.furnishStatus}
        </Text>
        <Text style={styles.editedDate}>Last Edited : <Text style={{fontFamily: "Lato", fontWeight: "300", color: "#2B3034", fontSize: 12}}>{item.lastEdited}</Text></Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteProperty(item.id)}
      >
        <TrashIcon />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text
          style={{ ...styles.headerTitle }}
        >
          Select from your drafts
        </Text>
        <Text style={styles.headerSubtitle}>
          Choose an existing property from your inventory
        </Text>
      </View>

      <FlatList
        data={properties}
        renderItem={renderPropertyItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity style={styles.addButton} onPress={addNewProperty}>
        <PlusIcon />
        <Text style={styles.addButtonText}>Add New</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  header: {
    padding: 16,
  },
  headerTitle: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    color: "#000",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
    fontFamily: "Lato",
    fontWeight: "300",
  },
  listContainer: {
    top: 10,
    // padding: 16,
  },
  propertyItem: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Montserrat_700Bold",
  },
  propertyDetails: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
    fontFamily: "Lato",
    fontWeight: "400",
  },
  editedDate: {
    fontSize: 12,
    color: "#000",
    marginTop: 8,
    fontFamily: "Lato",
    fontWeight: "700",
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
  },
  trashIcon: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  trashTop: {
    width: 12,
    height: 3,
    backgroundColor: "#555",
    marginBottom: 2,
  },
  trashBottom: {
    width: 10,
    height: 12,
    borderWidth: 2,
    borderColor: "#555",
    borderRadius: 2,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#134e4a",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  plusIcon: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  plusHorizontal: {
    width: 16,
    height: 2,
    backgroundColor: "#FFF",
    position: "absolute",
  },
  plusVertical: {
    width: 2,
    height: 16,
    backgroundColor: "#FFF",
    position: "absolute",
  },
});

export default DraftsScreen;

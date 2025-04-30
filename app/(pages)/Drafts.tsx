import PlusIcon from "@/assets/icons/svg/Common/PlusIcon";
import { router, useFocusEffect, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { ListingProperty } from "../types";
import DraftCard from "../components/Listing/DraftCard";
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const DraftsScreen: React.FC = () => {
  const [drafts, setDrafts] = useState<ListingProperty[]>();
  const [rendering, setRendering] = useState<boolean>(true);

  const cpId: string | undefined = useSelector(
    (state: RootState) => state.agent?.docData?.cpId
  );

  const deleteDraft = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "QC_Inventories", id));
    setDrafts((prev) => prev?.filter((draft) => draft.propertyId !== id));
  }, []);

  const pressDraftCard = useCallback((item: ListingProperty) => {
    router.push({
      pathname: "/(tabs)/AddInventoryForm",
      params: { item: JSON.stringify(item) },
    });
  }, []);

  const addNewProperty = () => {
    router.push("/(tabs)/AddInventoryForm");
  };

  const renderPropertyItem = useCallback(
    ({ item }: { item: ListingProperty }) => {
      return (
        <DraftCard
          item={item}
          deleteDraft={deleteDraft}
          pressCard={pressDraftCard}
        />
      );
    },
    [deleteDraft, pressDraftCard]
  );

  const initialRender = async () => {
    const count = await getCountFromServer(
      query(
        collection(db, "QC_Inventories"),
        where("cpCode", "==", cpId),
        where("status", "==", "draft")
      )
    );
    if (count.data().count === 0) router.replace("/(tabs)/AddInventoryForm");
    const drafts = await getDocs(
      query(
        collection(db, "QC_Inventories"),
        where("cpCode", "==", cpId),
        where("status", "==", "draft")
      )
    );
    const stateDrafts: ListingProperty[] = [];
    drafts.docs.forEach((draft) => {
      stateDrafts.push(draft.data());
    });
    setDrafts(stateDrafts);
    setRendering(false);
  };

  useFocusEffect(
    useCallback(() => {
      initialRender();
    }, [])
  );

  if (rendering)
    return (
      <ActivityIndicator
        style={{ margin: "auto" }}
        size="large"
        color="#153E3B"
      />
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select from your drafts</Text>
        <Text style={styles.headerSubtitle}>
          Choose an existing property from your inventory
        </Text>
      </View>

      <FlatList
        data={drafts}
        renderItem={renderPropertyItem}
        keyExtractor={(item, idx) => item.propertyId || idx.toString()}
      />

      <TouchableOpacity style={styles.addButton} onPress={addNewProperty}>
        <PlusIcon width={24} height={24} strokeWidth={2} />
        <Text style={styles.addButtonText}>Add New</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: 16,
  },
  headerTitle: {
    fontFamily: "Montserrat_600SemiBold",
    lineHeight: 20,
    fontSize: 16,
    color: "#000",
  },
  headerSubtitle: {
    fontFamily: "Lato",
    fontWeight: "300",
    fontSize: 15,
    color: "#000",
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
});

export default DraftsScreen;

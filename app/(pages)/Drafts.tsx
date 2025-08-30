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
import {Property} from "../types";
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
import { logEvent } from "@react-native-firebase/analytics";
import { analytics } from "../config/firebase";

const DraftsScreen: React.FC = () => {
  const [drafts, setDrafts] = useState<Property[]>();
  const [rendering, setRendering] = useState<boolean>(true);
  const [loadStartTime] = useState<number>(Date.now());

  const cpId: string | undefined = useSelector(
    (state: RootState) => state.agent?.docData?.cpId
  );

  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";

  const deleteDraft = useCallback(
    async (id: string) => {
      try {
        await deleteDoc(doc(db, "acnQCInventories", id));
        setDrafts((prev) => prev?.filter((draft) => draft.propertyId !== id));
        logEvent(analytics, "draft_delete", {
          event_category: "drafts",
          event_label: "delete",
          property_id: id,
          user_type: userType,
        });
      } catch (error) {
        logEvent(analytics, "drafts_error", {
          event_category: "drafts",
          event_label: "error",
          error_type: error instanceof Error ? error.name : "unknown",
          operation: "delete_draft",
          user_type: userType,
        });
        console.error("Error deleting draft:", error);
      }
    },
    [userType]
  );

  const pressDraftCard = useCallback(
    (item: Property) => {
      try {
        logEvent(analytics, "draft_card_click", {
          event_category: "drafts",
          event_label: "draft_click",
          property_id: item.propertyId,
          user_type: userType,
        });
        router.push({
          pathname: "/(tabs)/AddInventoryForm",
          params: { item: JSON.stringify(item) },
        });
      } catch (error) {
        console.error("Error logging draft click:", error);
      }
    },
    [userType]
  );

  const addNewProperty = () => {
    try {
      logEvent(analytics, "add_new_property_click", {
        event_category: "drafts",
        event_label: "add_new",
        user_type: userType,
      });
      router.push("/(tabs)/AddInventoryForm");
    } catch (error) {
      console.error("Error logging add new property:", error);
    }
  };

  const renderPropertyItem = useCallback(
    ({ item }: { item: Property }) => {
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
        collection(db, "acnQCInventories"),
        where("cpId", "==", cpId),
        where("status", "==", "draft")
      )
    );
    if (count.data().count === 0 || count.data().count === undefined)
      router.replace("/(tabs)/AddInventoryForm");
    const drafts = await getDocs(
      query(
        collection(db, "acnQCInventories"),
        where("cpId", "==", cpId),
        where("status", "==", "draft")
      )
    );
    const stateDrafts: Property[] = [];
    drafts.docs.forEach((draft) => {
      stateDrafts.push(draft.data() as Property);
    });
    setDrafts(stateDrafts);
    setRendering(false);

    // Log page view with drafts count
    try {
      logEvent(analytics, "drafts_page_view", {
        event_category: "drafts",
        event_label: "page_view",
        drafts_count: stateDrafts.length,
        user_type: userType,
      });
    } catch (error) {
      logEvent(analytics, "drafts_error", {
        event_category: "drafts",
        event_label: "error",
        error_type: error instanceof Error ? error.name : "unknown",
        operation: "fetch_drafts",
        user_type: userType,
      });
      console.error("Error fetching drafts:", error);
    } finally {
      setRendering(false);
    }
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

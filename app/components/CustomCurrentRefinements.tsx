import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import {
  useClearRefinements,
  useCurrentRefinements,
} from "react-instantsearch";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { SearchFilters } from "../services/property_services/propertyAlgoliaService";

interface CustomCurrentRefinementsProps {
  selectedLandmark?: any;
  setSelectedLandmark?: (landmark: any) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export default function CustomCurrentRefinements({
  selectedLandmark,
  setSelectedLandmark,
}: CustomCurrentRefinementsProps) {
  const { items, refine } = useCurrentRefinements();
  const { refine: clearRefinements } = useClearRefinements();
  const userType =
    useSelector((state: RootState) => state.agent?.docData?.userType) || "free";

  if (items.length === 0 && !selectedLandmark) {
    return null;
  }

  // Flatten refinements from all items into a single array for inline display
  const allRefinements = items.flatMap((item) =>
    item.refinements.map((refinement) => ({
      attribute: item.attribute,
      refinement: refinement,
    }))
  );

  const handleRefinementRemove = (refinement: any, attribute: string) => {
    try {
      logEvent(analytics, "remove_refinement", {
        event_category: "filters",
        event_label: "remove",
        filter_type: attribute,
        filter_value: refinement.label || refinement.value,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging refinement removal:", error);
    }
    refine(refinement);
  };

  const handleClearAll = () => {
    try {
      logEvent(analytics, "clear_all_refinements", {
        event_category: "filters",
        event_label: "clear_all",
        active_filters: items.map((item) => item.attribute),
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging clear all:", error);
    }
    clearRefinements();
    if (setSelectedLandmark) {
      setSelectedLandmark(null);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-row"
    >
      <View className="flex-row items-center px-4 space-x-2">
        {(items.length > 0 || selectedLandmark) && (
          <TouchableOpacity onPress={handleClearAll} className="ml-1">
            <View className="flex-row items-center border border-red-600 bg-red-600/10 px-2 py-1.5 rounded-full">
              <Text className="font-montserrat-semibold text-xs text-red-600">
                Clear All
              </Text>
            </View>
          </TouchableOpacity>
        )}
        {selectedLandmark && (
          <TouchableOpacity
            onPress={() => {
              try {
                logEvent(analytics, "remove_landmark_filter", {
                  event_category: "filters",
                  event_label: "remove",
                  landmark_name: selectedLandmark.name,
                  radius: selectedLandmark.radius,
                  user_type: userType,
                });
              } catch (error) {
                console.error("Error logging landmark removal:", error);
              }
              setSelectedLandmark && setSelectedLandmark(null);
            }}
            className="flex-row items-center bg-gray-200 px-3 py-1.5 rounded-full"
          >
            <Text className="font-montserrat text-sm text-gray-700 mr-1">
              {selectedLandmark.name} ({selectedLandmark.radius / 1000}km)
            </Text>
            <Text className="text-base text-gray-500">×</Text>
          </TouchableOpacity>
        )}

        {allRefinements.map((item, index) => (
          <TouchableOpacity
            key={`${item.attribute}-${item.refinement.value || index}`}
            onPress={() =>
              handleRefinementRemove(item.refinement, item.attribute)
            }
            className="flex-row items-center bg-gray-200 px-3 py-1.5 rounded-full"
          >
            <Text className="font-montserrat text-sm text-gray-700 mr-1">
              {item.refinement.attribute === "agentCpid"
                ? "My Requirements"
                : item.refinement.label}
            </Text>
            <Text className="text-base text-gray-500">×</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

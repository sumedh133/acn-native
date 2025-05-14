import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  useClearRefinements,
  useCurrentRefinements,
} from "react-instantsearch";
import { Button } from "react-native-elements";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface CustomCurrentRefinementsProps {
  selectedLandmark?: any;
  setSelectedLandmark?: (landmark: any) => void;
}

export default function CustomCurrentRefinements({
  selectedLandmark,
  setSelectedLandmark,
}: CustomCurrentRefinementsProps) {
  const { items, refine } = useCurrentRefinements();
  const { refine: clearRefinements } = useClearRefinements();
  const userType = useSelector((state: RootState) => state.agent?.docData?.userType) || "free";

  if (items.length === 0 && !selectedLandmark) {
    return null;
  }

  // Flatten refinements from all items into a single array for inline display
  const allRefinements = items.flatMap((item) =>
    item.refinements.map((refinement) => ({
      attribute: item.attribute,
      refinement: refinement,
    })),
  );

  const handleRefinementRemove = (refinement: any, attribute: string) => {
    try {
      logEvent(analytics, 'remove_refinement', {
        event_category: 'filters',
        event_label: 'remove',
        filter_type: attribute,
        filter_value: refinement.label || refinement.value,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging refinement removal:', error);
    }
    refine(refinement);
  };

  const handleClearAll = () => {
    try {
      logEvent(analytics, 'clear_all_refinements', {
        event_category: 'filters',
        event_label: 'clear_all',
        active_filters: items.map(item => item.attribute),
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging clear all:', error);
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
      style={styles.container}
    >
      <View style={styles.content}>
        {selectedLandmark && (
          <TouchableOpacity
            onPress={() => {
              try {
                logEvent(analytics, 'remove_landmark_filter', {
                  event_category: 'filters',
                  event_label: 'remove',
                  landmark_name: selectedLandmark.name,
                  radius: selectedLandmark.radius,
                  user_type: userType
                });
              } catch (error) {
                console.error('Error logging landmark removal:', error);
              }
              setSelectedLandmark && setSelectedLandmark(null);
            }}
            style={styles.chip}
          >
            <Text style={styles.chipText}>
              {selectedLandmark.name} ({selectedLandmark.radius / 1000}km)
            </Text>
            <Text style={styles.removeIcon}>×</Text>
          </TouchableOpacity>
        )}

        {allRefinements.map((item, index) => (
          <TouchableOpacity
            key={`${item.attribute}-${item.refinement.value || index}`}
            onPress={() => handleRefinementRemove(item.refinement, item.attribute)}
            style={styles.chip}
          >
            <Text style={styles.chipText}>
              {item.refinement.attribute === "agentCpid"
                ? "My Requirements"
                : item.refinement.label}
            </Text>
            <Text style={styles.removeIcon}>×</Text>
          </TouchableOpacity>
        ))}

        {(items.length > 0 || selectedLandmark) && (
          <TouchableOpacity
            onPress={handleClearAll}
            style={styles.clearButton}
          >
            <View style={styles.clearButtonContent}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    // marginTop: 8,
    // marginBottom: 8,
  },
  content: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#374151",
    marginRight: 4,
  },
  removeIcon: {
    fontSize: 16,
    color: "#6B7280",
  },
  clearButton: {
    marginLeft: 4,
  },
  clearButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E11E1E",
    backgroundColor: "rgba(225, 30, 30, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearButtonText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 12,
    color: "#E11E1E",
  },
});

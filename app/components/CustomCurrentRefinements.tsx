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
            onPress={() => refine(item.refinement)}
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
            onPress={() => {
              clearRefinements();
              {
                setSelectedLandmark && setSelectedLandmark(null);
              }
            }}
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
    marginTop: 8,
    marginBottom: 8,
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

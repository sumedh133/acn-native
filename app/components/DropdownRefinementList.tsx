import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { useRefinementList } from "react-instantsearch";
import { StyleSheet } from "react-native";
import CloseIcon from "@/assets/icons/svg/CloseIcon";

interface DropdownRefinementListProps {
  attribute: string;
  label: string;
  isRange?: boolean;
  analyticsEvent?: string;
  transformItems?: (items: any[]) => any[];
  enableLocalSearch?: boolean;
}

export default function DropdownRefinementList({
  attribute,
  label,
  isRange = false,
  analyticsEvent,
  transformItems,
  enableLocalSearch = false,
}: DropdownRefinementListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { items, refine } = useRefinementList({
    attribute,
    transformItems,
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setIsOpen(true)} style={styles.button}>
        <Text style={styles.buttonText}>{label}</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.listContainer}>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    refine(item.value);
                    setIsOpen(false);
                  }}
                  style={styles.item}
                >
                  <Text
                    style={[
                      styles.itemText,
                      item.isRefined && styles.selectedItemText,
                    ]}
                  >
                    {item.label} ({item.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
  },
  buttonText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 14,
    color: "#374151",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "80%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 18,
    color: "#111827",
  },
  closeButton: {
    fontSize: 24,
    color: "#6B7280",
  },
  listContainer: {
    maxHeight: 300,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  itemText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 16,
    color: "#374151",
  },
  selectedItemText: {
    color: "#3B82F6",
    fontFamily: "Montserrat_600SemiBold",
  },
});

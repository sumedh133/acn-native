import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CloseIcon from "@/assets/icons/svg/CloseIcon";

interface DetailsModalProps {
  onClose: () => void;
  requirement: any;
}

const DetailsModal = ({ onClose, requirement }: DetailsModalProps) => {
  if (!requirement) return null;

  const [forceRender, setForceRender] = useState(false);

  return (
    <Modal
      visible={true}
      onShow={() => setForceRender((prev) => !prev)}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Requirement Details</Text>
            <TouchableOpacity onPress={onClose}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Title</Text>
                <Text style={styles.value}>{requirement.title}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.value}>{requirement.location}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Asset Type</Text>
                <Text style={styles.value}>{requirement.assetType}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Configuration</Text>
                <Text style={styles.value}>{requirement.configuration}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Budget & Timeline</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Budget</Text>
                <Text style={styles.value}>₹ {requirement.budget} Lacs</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Timeline</Text>
                <Text style={styles.value}>{requirement.timeline}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Details</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Status</Text>
                <Text style={styles.value}>{requirement.status}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Created On</Text>
                <Text style={styles.value}>
                  {new Date(requirement.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.value}>{requirement.description}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact Client</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 18,
    color: "#374151",
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    color: "#374151",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 14,
    color: "#6B7280",
  },
  value: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 14,
    color: "#374151",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  contactButton: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  contactButtonText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});

export default DetailsModal;

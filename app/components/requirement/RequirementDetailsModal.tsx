import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CloseIcon from "@/assets/icons/svg/CloseIcon";

interface RequirementDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: any;
}

const RequirementDetailsModal: React.FC<RequirementDetailsModalProps> = ({
  isOpen,
  onClose,
  requirement,
}) => {
  if (!requirement) return null;

  // Format budget display
  const formatBudget = () => {
    if (requirement.marketValue === "Market Value") {
      return "Market Price";
    }

    if (typeof requirement.budget === "number") {
      return `₹${requirement.budget.toLocaleString()} Cr`;
    }

    if (requirement.budget && typeof requirement.budget === "object") {
      const from = requirement.budget.from || 0;
      const to = requirement.budget.to || 0;

      if (from === 0) {
        return `₹${to} Cr`;
      }

      if (from === to) {
        return `₹${to} Cr`;
      }

      return `₹${from} Cr - ₹${to} Cr`;
    }

    return `₹${(typeof requirement.budget === "number" ? requirement.budget : 0).toLocaleString()} Cr`;
  };

  const [forceRender, setForceRender] = useState(false);

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      onShow={() => setForceRender((prev) => !prev)}
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-end">
        <View className="bg-white rounded-t-lg max-h-[80%]">
          {/* Header with close button */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-lg font-bold">Requirement Details</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Scrollable content */}
          <ScrollView className="p-4">
            {/* Requirement ID */}
            <View className="mb-4">
              <Text className="text-gray-500 text-sm">Requirement ID</Text>
              <Text className="text-gray-900 font-semibold">
                {requirement.requirementId}
              </Text>
            </View>

            {/* Title */}
            <View className="mb-4">
              <Text className="text-gray-500 text-sm">Title</Text>
              <Text className="text-gray-900 font-semibold">
                {(requirement.propertyName || requirement.title || "")
                  .charAt(0)
                  .toUpperCase() +
                  (requirement.propertyName || requirement.title || "").slice(
                    1,
                  )}
              </Text>
            </View>

            {/* Budget */}
            <View className="mb-4">
              <Text className="text-gray-500 text-sm">Budget</Text>
              <Text className="text-gray-900 font-semibold">
                {formatBudget()}
              </Text>
            </View>

            {/* Asset Type */}
            <View className="mb-4">
              <Text className="text-gray-500 text-sm">Asset Type</Text>
              <Text className="text-gray-900 font-semibold">
                {requirement.assetType}
              </Text>
            </View>

            {/* Configuration */}
            <View className="mb-4">
              <Text className="text-gray-500 text-sm">Configuration</Text>
              <Text className="text-gray-900 font-semibold">
                {requirement.configuration}
              </Text>
            </View>

            {/* Area */}
            {requirement.area && (
              <View className="mb-4">
                <Text className="text-gray-500 text-sm">Area</Text>
                <Text className="text-gray-900 font-semibold">
                  {requirement.area} sqft
                </Text>
              </View>
            )}

            {/* Location */}
            <View className="mb-4">
              <Text className="text-gray-500 text-sm">Location</Text>
              <Text className="text-gray-900 font-semibold">
                {requirement.location}
              </Text>
            </View>

            {/* Status */}
            <View className="mb-4">
              <Text className="text-gray-500 text-sm">Status</Text>
              <View className="bg-gray-100 self-start px-2 py-1 rounded">
                <Text className="text-gray-700 font-medium">
                  {requirement.status}
                </Text>
              </View>
            </View>

            {/* Created Date */}
            <View className="mb-4">
              <Text className="text-gray-500 text-sm">Created At</Text>
              <Text className="text-gray-900">{requirement.createdAt}</Text>
            </View>

            {/* Requirement Details */}
            {requirement.requirementDetails && (
              <View className="mb-4">
                <Text className="text-gray-500 text-sm">
                  Requirement Details
                </Text>
                <Text className="text-gray-900">
                  {requirement.requirementDetails}
                </Text>
              </View>
            )}

            {/* Description */}
            {requirement.description && (
              <View className="mb-4">
                <Text className="text-gray-500 text-sm">Description</Text>
                <Text className="text-gray-900">{requirement.description}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default RequirementDetailsModal;

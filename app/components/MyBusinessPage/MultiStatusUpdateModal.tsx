import CloseIcon from "@/assets/icons/svg/CloseIcon";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";

// Types
interface SelectStatus {
  selected: boolean;
  propertyIds: string[];
}

export interface SelectedStatuses {
  available: SelectStatus;
  hold: SelectStatus;
  sold: SelectStatus;
  tenanted: SelectStatus;
  "de-listed": SelectStatus;
}

interface MultiStatusUpdateModalProps {
  visible: boolean;
  statusMap: SelectedStatuses;
  onClose: () => void;
  onConfirm: (selectedStatuses: SelectedStatuses) => void;
  isUpdating: boolean;
}

// Custom Checkbox Component
interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  disabled = false,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`w-6 h-6 border-2 rounded-md ${
      checked ? "bg-[#153E3B] border-[#153E3B]" : "bg-white border-gray-300"
    } ${disabled ? "opacity-50" : ""} items-center justify-center`}
  >
    {checked && (
      <Text className="text-white text-sm font-bold leading-none">✓</Text>
    )}
  </TouchableOpacity>
);

// Status Item Component
interface StatusItemProps {
  status: string;
  count: number;
  checked: boolean;
  onToggle: () => void;
  disabled: boolean;
}

const StatusItem: React.FC<StatusItemProps> = ({
  status,
  count,
  checked,
  onToggle,
  disabled,
}) => (
  <TouchableOpacity
    onPress={onToggle}
    disabled={disabled}
    className="flex-row items-center py-3"
  >
    <Checkbox checked={checked} onPress={onToggle} disabled={disabled} />
    <Text className="text-[#153E3B] font-medium text-base ml-3">
      {status} ({count})
    </Text>
  </TouchableOpacity>
);

const MultiStatusUpdateModal: React.FC<MultiStatusUpdateModalProps> = ({
  visible,
  statusMap,
  onClose,
  onConfirm,
  isUpdating,
}) => {
  const [selectedStatuses, setSelectedStatuses] = useState<SelectedStatuses>({
    available: { selected: false, propertyIds: [] },
    hold: { selected: false, propertyIds: [] },
    sold: { selected: false, propertyIds: [] },
    tenanted: { selected: false, propertyIds: [] },
    "de-listed": { selected: false, propertyIds: [] },
  });

  // Initialize selected statuses - default check "de-listed" and "available"
  useEffect(() => {
    const initialSelection: SelectedStatuses = {
      available: {
        selected: true,
        propertyIds: statusMap.available.propertyIds || [],
      },
      hold: {
        selected: false,
        propertyIds: statusMap.hold.propertyIds || [],
      },
      sold: {
        selected: false,
        propertyIds: statusMap.sold.propertyIds || [],
      },
      tenanted: {
        selected: false,
        propertyIds: statusMap.tenanted.propertyIds || [],
      },
      "de-listed": {
        selected: true,
        propertyIds: statusMap["de-listed"].propertyIds || [],
      },
    };
    setSelectedStatuses(initialSelection);
  }, [statusMap]);

  const handleStatusToggle = (status: keyof SelectedStatuses): void => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [status]: {
        ...prev[status],
        selected: !prev[status].selected,
      },
    }));
  };

  const handleConfirm = (): void => {
    onConfirm(selectedStatuses);
  };

  const getTotalSelectedProperties = (): number => {
    return Object.values(selectedStatuses).reduce((total, selectStatus) => {
      if (selectStatus.selected && selectStatus.propertyIds.length > 0) {
        return total + selectStatus.propertyIds.length;
      }
      return total;
    }, 0);
  };

  const formatStatusName = (status: string): string => {
    // Capitalize first letter and handle special cases
    if (status === "de-listed") return "De-listed";
    if (status === "tenanted") return "Tenanted";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get only statuses that have properties to display
  const getAvailableStatuses = () => {
    return Object.entries(selectedStatuses).filter(
      ([_, selectStatus]) => selectStatus.propertyIds.length > 0
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable
        className="flex-1 bg-black/30 items-center justify-center px-4"
        onPress={onClose}
      >
        {/* Modal Content */}
        <Pressable
          className="bg-white rounded-2xl p-6 py-8 w-[80%] shadow-lg"
          onPress={() => {}} // Prevent backdrop press when touching modal content
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-2 right-2 p-1 z-10"
          >
            <CloseIcon width={36} height={36} />
          </TouchableOpacity>

          {/* Title */}
          <Text
            className="text-[#153E3B]  text-xl mb-6 font-[Montserrat]"
            style={{ fontFamily: "Montserrat_700Bold" }}
          >
            Confirm Status
          </Text>

          {/* Status List */}
          <View className="mb-6">
            {getAvailableStatuses().map(
              ([status, selectStatus]: [
                string,
                { propertyIds: string[]; selected: boolean }
              ]) => (
                <StatusItem
                  key={status}
                  status={formatStatusName(status)}
                  count={selectStatus.propertyIds.length}
                  checked={selectStatus.selected}
                  onToggle={() =>
                    handleStatusToggle(status as keyof SelectedStatuses)
                  }
                  disabled={isUpdating}
                />
              )
            )}
          </View>

          {/* Buttons */}
          <View className="flex-row justify-between gap-4">
            <TouchableOpacity
              onPress={onClose}
              disabled={isUpdating}
              className={`flex-1 border border-[#153E3B] rounded-lg py-3 items-center ${
                isUpdating ? "opacity-50" : ""
              }`}
            >
              <Text className="text-[#153E3B] font-medium text-base font-[Lato]">
                No
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isUpdating || getTotalSelectedProperties() === 0}
              className={`flex-1 bg-[#153E3B] rounded-lg py-3 items-center justify-center ${
                isUpdating || getTotalSelectedProperties() === 0
                  ? "opacity-50"
                  : ""
              }`}
            >
              {isUpdating ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-medium text-base font-[Lato]">
                    Updating...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-medium text-base font-[Lato]">
                  Yes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default MultiStatusUpdateModal;

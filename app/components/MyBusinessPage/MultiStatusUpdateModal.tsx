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
    className={`w-5 h-5 border-2 rounded ${
      checked ? "bg-[#153E3B] border-[#153E3B]" : "bg-white border-gray-300"
    } ${disabled ? "opacity-50" : ""} items-center justify-center`}
  >
    {checked && <Text className="text-white text-xs font-bold">✓</Text>}
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
    className="flex flex-row items-center min-w-full justify-between"
  >
    <Checkbox checked={checked} onPress={onToggle} disabled={disabled} />
    <Text className="text-[#153E3B] font-medium flex-1">
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
    const abc = Object.entries(selectedStatuses).filter(
      ([_, selectStatus]) => selectStatus.propertyIds.length > 0
    );
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
          className="flex flex-col gap-y-2 bg-white rounded-[12px] p-6 w-[320px] max-w-[360px]"
          onPress={() => {}} // Prevent backdrop press when touching modal content
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-3 right-3 p-1"
          >
            <CloseIcon />
          </TouchableOpacity>

          {/* Title */}
          <Text className="text-[#153E3B] font-bold text-lg">
            Confirm Status
          </Text>

          {/* Checkboxes */}
          <ScrollView
            className="min-h-fit"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex flex-col justify-between">
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
                    onToggle={() => handleStatusToggle(status as keyof SelectedStatuses)}
                    disabled={isUpdating}
                  />
                )
              )}
            </View>
          </ScrollView>

          {/* Summary */}
          {/* <View className="bg-gray-50 p-3 rounded-md mb-4">
            <Text className="text-sm text-gray-700">
              <Text className="font-semibold">
                {getTotalSelectedProperties()}
              </Text>{" "}
              properties will be marked as "Available"
            </Text>
          </View> */}

          {/* Buttons */}
          <View className="flex-row justify-between gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={isUpdating}
              className={`flex-1 border border-[#153E3B] rounded-md py-3 items-center ${
                isUpdating ? "opacity-50" : ""
              }`}
            >
              <Text className="text-[#153E3B] font-medium">No</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isUpdating || getTotalSelectedProperties() === 0}
              className={`flex-1 bg-[#153E3B] rounded-md py-3 items-center justify-center ${
                isUpdating || getTotalSelectedProperties() === 0
                  ? "opacity-50"
                  : ""
              }`}
            >
              {isUpdating ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-medium">Updating...</Text>
                </View>
              ) : (
                <Text className="text-white font-medium">Yes</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default MultiStatusUpdateModal;

import { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  useWindowDimensions,
  TextInput,
} from "react-native";
import Dropdown, { DropdownOption } from "../../components/DropDown"; // Import the new dropdown component
import { trackEvent } from "@/app/services/logAnalyticsService";

interface StatusUpdateModalProps {
  visible: boolean;
  onClose: () => void;
  selectedProperty: Set<string>;
  agentData: any
}

const StatusUpdateModal = ({
  visible,
  onClose,
  selectedProperty,
  agentData
}: StatusUpdateModalProps) => {
  const [newStatus, setNewStatus] = useState<"hold" | "sold">();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 420); // 16px side margins
  const contentPadding = width < 360 ? 16 : 24;
  const [platform, setPlatform] = useState<DropdownOption | null>(null);
  const [sellingPrice, setSellingPrice] = useState<string>();

  // Platform options for the dropdown
  const platformOptions: DropdownOption[] = [
    { value: "acn", label: "from ACN" },
    { value: "other-agent", label: "By Other Agent" },
    { value: "owner", label: "By Owner" },
    { value: "classified-platform", label: "Classified Platform" },
  ];

  const handlePlatformSelect = (selectedPlatform: DropdownOption) => {
    setPlatform(selectedPlatform);
    console.log("Selected platform:", selectedPlatform);
  };

  const handleSubmit = () => {

    try {

      if (status == 'hold') {
        trackEvent("inventory_status_update_hold").catch((error) => {
          console.error(`Error logging event: ${error}`);
        });
      }
      else {
        trackEvent(
          "inventory_status_update_sold",
          agentData,
          { propertyId: Array.from(selectedProperty)[0] },
          { sold_price: sellingPrice }
        ).catch((error) => {
          console.error(`Error logging event: ${error}`);
        });
      }


    } catch (error) {
      console.error(`Unexpected error: ${error}`);
    }
    // Handle form submission here
    console.log({
      status: newStatus,
      sellingPrice,
      platform,
      selectedProperty,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-[#2B2928]/60 px-4"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
        >
          <View
            className="rounded-xl bg-white items-center shadow max-w-[290px]"
            style={{
              width: contentWidth,
              paddingVertical: contentPadding,
              paddingHorizontal: contentPadding,
            }}
          >
            <View className="flex flex-col gap-5">
              <Text className="text-base text-center text-[#153E3B] font-montserrat-bold leading-normal">
                Update Inventory Status
              </Text>

              {/* Status Selection */}
              <View className="w-full flex-row flex-wrap gap-3 justify-center">
                <Pressable
                  className={`flex-1 w-full items-center border rounded-xl py-3 px-4 ${newStatus === "hold" ? "bg-[#EAFFFD]" : "bg-white"
                    }`}
                  onPress={() => setNewStatus("hold")}
                >
                  <Text className="text-[#10302D]">Hold</Text>
                </Pressable>
                <Pressable
                  className={`flex-1 w-full items-center border rounded-xl py-3 px-4 ${newStatus === "sold" ? "bg-[#EAFFFD]" : "bg-white"
                    }`}
                  onPress={() => setNewStatus("sold")}
                >
                  <Text className="text-[#10302D]">Sold</Text>
                </Pressable>
              </View>

              {/* Sold Price Input - only show when status is 'sold' */}
              {newStatus === "sold" && (
                <View className="w-full flex-row items-center justify-between gap-3">
                  <Text className="text-[#000] text-center font-lato-bold text-sm leading-[150%]">
                    Sold Price
                  </Text>
                  <TextInput
                    placeholder="₹ 1,00,000"
                    keyboardType="numeric"
                    className="border flex-1 px-2 h-[33px] rounded-md border-[#D3D4DD]"
                    value={sellingPrice}
                    onChangeText={setSellingPrice}
                  />
                </View>
              )}

              {/* Platform Dropdown - only show when status is 'sold' */}
              {newStatus === "sold" && (
                <View className="w-full flex-row items-center justify-between gap-3">
                  <Text className="text-[#000] text-center font-lato-bold text-sm leading-[150%]">
                    Sold From
                  </Text>
                  <View className="flex-1 mb-10">
                    <Dropdown
                      options={platformOptions}
                      placeholder="Select Platform"
                      selectedValue={platform}
                      onSelect={handlePlatformSelect}
                      maxHeight={150}
                      containerClassName={"flex-1"}
                      dropdownClassName={"border border-[#D3D4DD]"}
                    />
                  </View>
                </View>
              )}

              {/* Submit Button */}
              <Pressable
                className="min-w-full px-4 py-2 rounded justify-center border bg-[#10302D]"
                onPress={handleSubmit}
              >
                <Text className="text-center text-white">Submit</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default StatusUpdateModal;

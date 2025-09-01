import DropDownArrow from "@/assets/icons/svg/AddInventory/DropdownIcon";
import { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  useWindowDimensions,
  TextInput,
  TouchableOpacity,
} from "react-native";

interface StatusUpdateModalProps {
  visible: boolean;
  onClose: () => void;
  selectedProperty: Set<string>;
}

const StatusUpdateModal = ({
  visible,
  onClose,
  selectedProperty,
}: StatusUpdateModalProps) => {
  const [newStatus, setNewStatus] = useState<"hold" | "sold">();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 420); // 16px side margins
  const contentPadding = width < 360 ? 16 : 24;
  const [platform, setPlatform] = useState();
  const [sellingPrice, setSellingPrice] = useState<string>();
  console.log(sellingPrice, "this is elinihiohf");

  const handleSelectPlatform = (_selectedField: any, inputValue: any) => {
    setPlatform(inputValue);
  };

  const options: any = ["hello", "hi", "yo"];

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-[#2B2928]/60 px-4"
      >
        <View
          className="rounded-xl bg-white items-center shadow"
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

            <View className="w-full flex-row flex-wrap gap-3 justify-center">
              <Pressable
                className={`flex-1 min-w-[140px] items-center border rounded-xl py-3 px-4 ${
                  newStatus === "hold" ? "bg-[#EAFFFD]" : "bg-white"
                }`}
                onPress={() => setNewStatus("hold")}
              >
                <Text className="text-[#10302D]">Hold</Text>
              </Pressable>
              <Pressable
                className={`flex-1 min-w-[140px] items-center border rounded-xl py-3 px-4 ${
                  newStatus === "sold" ? "bg-[#EAFFFD]" : "bg-white"
                }`}
                onPress={() => setNewStatus("sold")}
              >
                <Text className="text-[#10302D]">Sold</Text>
              </Pressable>
            </View>

            {newStatus === "sold" && (
              <View className="w-full flex-row items-center justify-between gap-3">
                <Text className="text-[#000] text-center font-lato-bold text-sm leading-[150%]">
                  Sold Price
                </Text>
                <TextInput
                  placeholder={"₹ 1,00,000"}
                  keyboardType="numeric"
                  className="border flex-1 px-2 h-[33px] rounded-md border-[#D3D4DD]"
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                ></TextInput>
              </View>
            )}
            {newStatus === "sold" && (
              <View className="w-full flex-row items-center justify-between gap-3">
                <Text className="text-[#000] text-center font-lato-bold text-sm leading-[150%]">
                  Sold From
                </Text>
                <View className="flex-1 ">
                  <Pressable className="border h-[33px] py-2 px-[10px] rounded-md border-[#D3D4DD] flex flex-row items-center">
                    <Text>Select</Text>
                    <DropDownArrow />
                  </Pressable>
                </View>
              </View>
            )}
            <Pressable className="min-w-full px-4 py-2 rounded justify-center border bg-[#10302D]">
              <Text className="text-center text-white">Submit</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default StatusUpdateModal;

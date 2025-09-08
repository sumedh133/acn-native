import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ToolTipIcon from "@/assets/icons/tooltip.svg";
import { Property } from "@/app/types";
import { toCapitalizedWords } from "@/app/helpers/common";
import { UIProperty } from "../Listing/listingPropertyDetails";
import { ScrollContext } from "@/app/ScrollContext";
import StatusInfoBottomSheet from "../property/StatusInfoBottomSheet";
import Dropdown from "../DropDown";
import { Ionicons } from "@expo/vector-icons";
import DropDownArrow from "@/assets/icons/svg/AddInventory/DropdownIcon";

interface PropertiesStatusCardProps {
  data: Partial<UIProperty>;
  statusUpdateModal: boolean;
  setStatusUpdateModal: (value: boolean) => void;
}

const PropertiesStatusCard = ({ data, statusUpdateModal, setStatusUpdateModal }: PropertiesStatusCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { openStatusInfo } = useContext(ScrollContext);

  const statusFeild = {
    hold: { bgColor: "#FFFCF0", labelColor: "#FFCC00" },
    sold: { bgColor: "#F2F2F2", labelColor: "#5A5555" },
    "de-listed": { bgColor: "#FFF1F1", labelColor: "#DE1135" },
    available: { bgColor: "#EAFFEF", labelColor: "#34C759" },
    tenanted: { bgColor: "#F2F2F2", labelColor: "#5A5555" },
  };
  const statusKey = data?.status as keyof typeof statusFeild;
  const colors = statusFeild[statusKey] || statusFeild.available;

  return (
    <View className="flex-1">
      {data?.stage !== "live" ? (
        <View
          className="flex-1 py-[10px] px-[12px] relative"
          style={{ backgroundColor: colors.bgColor }}
        >
          <View className="flex flex-row items-center justify-between h-[42px]">
            <Text className="font-bold text-base leading-normal">Status</Text>
            <Text
              className="font-bold text-base leading-normal"
              style={{ color: colors.labelColor }}
            >
              {toCapitalizedWords(data?.status)}
            </Text>
          </View>
        </View>
      ) : (
        <View
          className="flex-1 flex flex-row justify-between items-center py-[10px] px-[12px] relative"
          style={{ backgroundColor: colors.bgColor }}
        >
          <View className="flex flex-col items-start justify-between h-[42px]">
            <Text className="font-bold text-base leading-normal pl-4">Status</Text>
            <View className="flex flex-row items-center justify-between gap-[5px] pl-4">
              <Text
                className="font-bold text-base leading-normal"
                style={{ color: colors.labelColor }}
              >
                {toCapitalizedWords(data?.status)}
              </Text>
              {data.status === "de-listed" && (
                <TouchableOpacity
                  onPress={() => openStatusInfo(data.status || "")}
                >
                  <ToolTipIcon height={16} width={16} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View
            className="right-3 w-[48%] align-middle"
            pointerEvents="box-none"
          >
            {/* Update Status Button */}
            <TouchableOpacity
              className="flex flex-row items-center justify-center border border-[#153E3B] px-5 py-2 rounded"
              onPress={() => setStatusUpdateModal(true)} // Correct way to set state
            >
              <Text className="text-[#153E3B]">Update Status</Text>
              <DropDownArrow pointerDown={isOpen} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default PropertiesStatusCard;

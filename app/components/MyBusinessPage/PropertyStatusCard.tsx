import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ToolTipIcon from "@/assets/icons/tooltip.svg";
import { Property } from "@/app/types";
import { toCapitalizedWords } from "@/app/helpers/common";


interface PropertiesStatusCardProps {
    data: Property;
}

const PropertiesStatusCard = ({
    data,

}: PropertiesStatusCardProps) => {
    const statusFeild = {
        "hold": { bgColor: "#FFF1F1", labelColor: "#DE1135" },
        "sold": { bgColor: "#FFF1F1", labelColor: "#DE1135" },
        "de-listed": { bgColor: "#FFF1F1", labelColor: "#DE1135" },
        "available": { bgColor: "#FFF1F1", labelColor: "#DE1135" },
        "tenanted": { bgColor: "#FFF1F1", labelColor: "#DE1135" }
    }
    return (
        <View>{
            data?.stage == 'live' ? (
                <View className="flex-1 bg-[#D2D2D2] py-[10px] px-[12px]">
                    <View className="flex flex-row items-center justify-between   h-[42px]"><Text className="font-bold text-base leading-normal">Status</Text><Text className="font-bold text-base leading-normal">{toCapitalizedWords(data?.status)}</Text></View>
                </View>)
                : (<View className="flex-1 bg-[#D2D2D2] py-[10px] px-[12px]">
                    <View className="flex flex-col items-start justify-between   h-[42px]">
                        <Text className="font-bold text-base leading-normal">Status</Text>
                        <View className="flex flex-row items-center justify-between gap-[5px]"><Text className="font-bold text-base leading-normal">{toCapitalizedWords(data?.status)}</Text>
                            <ToolTipIcon height={16} width={16} /></View></View>
                </View>)}
        </View>

    );
};

export default PropertiesStatusCard;

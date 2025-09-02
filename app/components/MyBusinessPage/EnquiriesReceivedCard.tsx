import React from "react";
import {View, Text, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import ListingsIcon from "@/assets/icons/MyBusinessPage/listings.svg";
import RightArrow from "@/assets/icons/arrowRightt.svg";
import { router } from "expo-router";

interface EnquiriesReceivedCardProps {
    totalCount: number;
    newCount: number
}

const EnquiriesReceivedCard = ({
    totalCount,
    newCount,
}: EnquiriesReceivedCardProps) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
                router.push("/(pages)/EnquiriesReceived");
            }}
            className="mx-4 mb-3 mt-3"
        >
            <LinearGradient
                colors={["#FFDA7D", "#FFE4A2"]} // light teal gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center justify-between rounded-[4px] px-4 py-3"
            >

                <ListingsIcon height={35} width={35} />


                <View className="flex flex-row items-center justify-between gap-[6px]">
                    {/* Left Text */}
                    <Text
                        className="text-sm font-bold text-[#153E3B]"
                        style={{ fontFamily: "Lato_700Bold" }}
                    >
                        Enquiries Received ({totalCount})
                    </Text>

                    {/* Show badge only if newCount > 0 */}
                    {newCount > 0 && (
                        <Text className="bg-[#E93B3E] text-white px-1 py-0.5 rounded-[2px] text-xs font-medium">
                            {newCount} New
                        </Text>
                    )}
                </View>


                {/* Arrow */}
                <RightArrow height={24} width={24} />
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default EnquiriesReceivedCard;

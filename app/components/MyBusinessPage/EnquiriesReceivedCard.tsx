import React from "react";
import { Text, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import ListingsIcon from "@/assets/icons/MyBusinessPage/listings.svg";
import RightArrow from "@/assets/icons/arrowRightt.svg";
import { router } from "expo-router";

interface EnquiriesReceivedCardProps {
    count: number;
}

const EnquiriesReceivedCard = ({
    count,
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


                {/* Text */}
                <Text
                    className="flex-1 text-sm font-bold text-[#153E3B] mx-3"
                    style={{ fontFamily: "Lato_700Bold" }}
                >
                    Enquiries Received ({count}){/* Count here needs to be fetched */}
                </Text>

                {/* Arrow */}
                <RightArrow height={24} width={24} />
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default EnquiriesReceivedCard;

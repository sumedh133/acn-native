import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { FontAwesome, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import ReviewModal from "./ReviewModal";
import { EnquiryWithProperty } from "@/app/types";
import { setPropertyDataThunk } from "@/store/slices/propertySlice";
import { useDispatch, useSelector } from "react-redux";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";
import { router } from "expo-router";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

interface CardProps {
  index: number;
  enquiry: EnquiryWithProperty;
}

const EnquiryCard: React.FC<CardProps> = ({ index, enquiry }) => {
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  useEffect(() => {
    try {
      logEvent(analytics, 'enquiry_card_view', {
        event_category: 'enquiries',
        event_label: 'impression',
        position_index: index,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging enquiry card view:', error);
    }
  }, []);

  const giveReviewClick = (e: any, enqId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      logEvent(analytics, 'review_modal_open', {
        event_category: 'enquiries',
        event_label: 'interaction',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging review modal open:', error);
    }
    setIsReviewModalOpen(true);
  };

  const handleOpenPropertyDetails = () => {
    try {
      logEvent(analytics, 'enquiry_property_details_view', {
        event_category: 'enquiries',
        event_label: 'navigation',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging property details view:', error);
    }

    if (enquiry?.property) {
      dispatch(setPropertyDataThunk(enquiry.property));
      router.push({
        pathname: "/components/property/PropertyDetailsScreen",
        params: {
          parent: "dashboardEnquiry",
          enqId: enquiry.enquiryId,
        },
      });
    }
  };

  return (
    <>
      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          enqId={enquiry["enquiryId"]!}
        />
      )}

      <Pressable
        className="border border-gray-300 rounded-lg p-4 bg-white w-full flex flex-col mb-4 "
        style={{ gap: 16 }}
        onPress={handleOpenPropertyDetails}
      >
        {/* Header Section */}
        <View className="flex flex-col" style={{ gap: 10 }}>
          <View className="flex flex-row justify-between items-center">
            <Text
              className="text-gray-600"
              style={{
                fontFamily: "Montserrat_600SemiBold",
                fontSize: 14,
                lineHeight: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#E3E3E3",
                letterSpacing: 0,
              }}
            >
              Sr. No. {index + 1}
            </Text>
            <View className="flex flex-row items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome
                  key={star}
                  name={"star"}
                  size={16}
                  color={
                    enquiry?.reviews &&
                    enquiry?.reviews.length > 0 &&
                    enquiry?.reviews[0]?.stars >= star
                      ? "#FFC107"
                      : "#D3D3D3"
                  }
                />
              ))}
            </View>
          </View>

          {/* Property Name */}
          <Text
            className=" text-black text-base"
            style={{ fontFamily: "Montserrat_700Bold" }}
          >
            {enquiry?.property?.nameOfTheProperty || "N/A"}
          </Text>
        </View>

        {/* Property Details */}
        <View className="flex flex-row justify-between items-center">
          <View className="flex flex-col" style={{ gap: 8 }}>
            {/* Asset Type */}
            <View className="flex flex-row items-center" style={{ gap: 8 }}>
              <MaterialIcons name="home" size={20} color="#6B7280" />
              <Text className="text-gray-600">
                {enquiry?.property?.assetType || "N/A"}
              </Text>
            </View>

            {/* Unit Type and Area */}
            <View className="flex flex-row items-center" style={{ gap: 8 }}>
              <FontAwesome5 name="bed" size={18} color="#6B7280" />
              <Text className="text-gray-600">
                {enquiry?.property?.unitType || "N/A"}{" "}
                {enquiry?.property?.sbua
                  ? `| ${enquiry?.property.sbua} sq.ft`
                  : ""}
              </Text>
            </View>
          </View>

          {/* Give Review Button */}
          <Pressable
            className="bg-gray-200 border border-gray-300 rounded-lg"
            onPress={(e) => giveReviewClick(e, enquiry["enquiryId"]!)}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 6,
              paddingHorizontal: 4,
              gap: 8,
            }}
          >
            <MaterialIcons name="edit" size={20} color="#153E3B" />
            <Text className="text-[#153E3B] font-medium text-sm">
              Give review
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </>
  );
};

export default React.memo(EnquiryCard);

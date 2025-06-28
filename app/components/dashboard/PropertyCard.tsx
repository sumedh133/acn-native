import { db } from "@/app/config/firebase";
import { formatCost2 } from "@/app/helpers/common";
import ShareModal from "@/app/modals/ShareModal";
import { Property } from "@/app/types";
import ShareIconOutSide from "@/assets/icons/svg/PropertiesPage/ShareIcon";
import { setPropertyDataThunk } from "@/store/slices/propertySlice";
import { RootState } from "@/store/store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { router } from "expo-router";
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import { styled } from "nativewind";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import DashboardDropdown from "./DashboardDropdown";
import { StyleSheet } from "react-native";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const PropertyCard = ({
  property,
  onStatusChange,
  index,
  totalCount,
  isListing,
}: {
  property: Property;
  onStatusChange: (id: string, status: string) => void;
  index: number;
  totalCount: number;
  isListing: boolean;
}) => {
  // State for share modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [matchingEnquiriesCount, setMatchingEnquiriesCount] = useState("-");
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  // Handle share button press
  const handleSharePress = (e: any) => {
    e.stopPropagation(); // Prevent opening property details
    try {
      logEvent(analytics, 'property_share_modal_open', {
        event_category: 'dashboard',
        event_label: 'interaction',
        property_id: property.propertyId,
        property_type: property.assetType,
        is_listing: isListing,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging share modal open:', error);
    }
    setIsShareModalOpen(true);
  };

  // Mock agent data for share modal
  const agentData = useSelector((state: RootState) => state.agent.docData);

  // Prepare share property data
  const shareProperty = {
    ...property,
    propertyId: property.propertyId,
    totalAskPrice: property.totalAskPrice,
    sbua: property.sbua,
    micromarket: property.micromarket,
  };

  // Handler for navigating to property details
  const handleNavigateToPropertyDetails = () => {
    try {
      logEvent(analytics, 'property_details_view', {
        event_category: 'dashboard',
        event_label: 'navigation',
        property_id: property.propertyId,
        property_type: property.assetType,
        property_status: property.status,
        is_listing: isListing,
        enquiries_count: matchingEnquiriesCount,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging property details view:', error);
    }

    // Set the property data in Redux
    dispatch(setPropertyDataThunk(property));

    // Navigate to the property details screen with params
    router.push({
      pathname: "/components/property/PropertyDetailsScreen",
      params: {
        parent: isListing ? "dashboardListing" : "dashboardInventory",
      },
    });
  };

  const fetchMatchingEnquiryCount = async () => {
    const count = await getCountFromServer(
      query(
        collection(db, "acnEnquiries"),
        where("propertyId", "==", property.propertyId)
      )
    );
    setMatchingEnquiriesCount(count.data().count.toString());
  };

  useEffect(() => {
    fetchMatchingEnquiryCount();
  }, []);

  useEffect(() => {
    try {
      logEvent(analytics, 'property_card_view', {
        event_category: 'dashboard',
        event_label: 'impression',
        property_id: property.propertyId,
        property_type: property.assetType,
        property_status: property.status,
        is_listing: isListing,
        position_index: index,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging property card view:', error);
    }
  }, []);

  return (
    <StyledView
      key={property.propertyId}
      className={`mb-4 rounded-lg bg-white border border-gray-200 overflow-visible`}
      style={{ zIndex: 99999 - index }}
    >
      {/* Share Modal */}
      <ShareModal
        visible={isShareModalOpen}
        property={shareProperty}
        agentData={agentData}
        setProfileModalOpen={setIsShareModalOpen}
      />

      {/* Clickable Card */}
      <StyledTouchableOpacity
        activeOpacity={0.7}
        onPress={handleNavigateToPropertyDetails}
      >
        {/* Top Content Section */}
        <StyledView className="p-4">
          {/* Header section with Property ID and MicroMarket */}
          <StyledView className="flex flex-row justify-between items-center">
            {/* Property ID */}
            <StyledView>
              <StyledText className="text-xs text-gray-500 font-semibold border-b border-gray-200">
                {property.propertyId}
              </StyledText>
            </StyledView>

            {/* Micromarket and Share */}
            <StyledView className="flex flex-row items-center">
              <StyledView className="flex flex-row items-center bg-gray-500 px-3 py-1 rounded-full">
                <MaterialCommunityIcons
                  name="map-marker"
                  size={14}
                  color="#FAFBFC"
                />
                <StyledText className="text-white text-xs ml-1">
                  {property.micromarket || "-"}
                </StyledText>
              </StyledView>

              {/* Share icon */}
              <StyledTouchableOpacity
                style={styles.shareButton}
                onPress={handleSharePress}
              >
                <ShareIconOutSide />
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>

          {/* Property Name */}
          <StyledText className="text-base font-bold text-black mt-2 mb-4">
            {property.propertyName}
          </StyledText>

          {/* Tags section for Asset Type, Unit Type, and Facing */}
          <StyledView className="flex flex-row flex-wrap gap-2 px-0 mb-3">
            {[property.assetType, property.unitType, property.facing]
              .filter(Boolean)
              .map((tag, index) => (
                <StyledView
                  className="bg-gray-100 rounded-full px-3 py-1"
                  key={index}
                >
                  <StyledText className="text-xs text-gray-700">
                    {tag}
                  </StyledText>
                </StyledView>
              ))}
          </StyledView>

          {/* Price and SBUA (Super Built-Up Area) section */}
          <StyledView className="flex flex-row justify-between items-center border-t border-gray-200 pt-3 px-0 mb-0">
            {/* Total Ask Price */}
            <StyledView className="flex-1">
              <StyledText className="text-xs text-gray-500">
                Total Ask Price:
              </StyledText>
              <StyledText className="text-sm font-semibold">
                {formatCost2(property.totalAskPrice || null)}
              </StyledText>
            </StyledView>

            {/* SBUA */}
            <StyledView className="flex-1">
              <StyledText className="text-xs text-gray-500">SBUA:</StyledText>
              <StyledText className="text-sm font-semibold">
                {property.sbua ? `${property.sbua} Sq Ft` : "-"}
              </StyledText>
            </StyledView>
          </StyledView>
        </StyledView>

        {/* Bottom Status Section */}
        {!isListing && (
          <StyledView className="flex flex-row justify-between items-center p-4 bg-gray-50 rounded-b-lg">
            {/* Enquiries */}
            <StyledView>
              <StyledText className="text-sm text-black font-semibold">
                Enquiries Received:
              </StyledText>
              <StyledText className="text-sm font-semibold text-black mt-1">
                {matchingEnquiriesCount ?? "-"} Enquiry
              </StyledText>
            </StyledView>

            {/* Status Selector */}
            <StyledView className={`relative overflow-visible`}>
              <DashboardDropdown
                value={property.status || "Available"}
                setValue={(val) =>
                  property.propertyId &&
                  onStatusChange(property.propertyId, val)
                }
                options={[
                  { label: "Available", value: "Available" },
                  { label: "Hold", value: "Hold" },
                  { label: "Sold", value: "Sold" },
                ]}
                type={"inventory"}
                openDropdownUp={index === totalCount - 1 && totalCount > 1}
              />
            </StyledView>
          </StyledView>
        )}
      </StyledTouchableOpacity>
    </StyledView>
  );
};

const styles = StyleSheet.create({
  shareButton: {
    width: 30,
    height: 30,
    borderRadius: 22,
    backgroundColor: "#E3E3E3",
    justifyContent: "center",
    alignItems: "center",
    left: 10,
  },
});

export default React.memo(PropertyCard);

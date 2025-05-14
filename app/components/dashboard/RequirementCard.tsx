import { toCapitalizedWords } from "@/app/helpers/common";
import { Requirement } from "@/app/types";
import { setRequirementDataThunk } from "@/store/slices/requirementSlice";
import { RootState } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { router } from "expo-router";
import { styled } from "nativewind";
import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import DashboardDropdown from "./DashboardDropdown";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const RequirementCard = ({
  requirement,
  onStatusChange,
  index,
  totalCount,
}: {
  requirement: Requirement;
  onStatusChange: (id: string, status: string) => void;
  index: number;
  totalCount: number;
}) => {
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  useEffect(() => {
    try {
      logEvent(analytics, 'requirement_card_view', {
        event_category: 'dashboard',
        event_label: 'impression',
        requirement_id: requirement.requirementId,
        requirement_type: requirement.assetType,
        requirement_status: requirement.status,
        position_index: index,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging requirement card view:', error);
    }
  }, []);

  // Handler for card press - navigate to requirement details
  const handleNavigateToRequirementDetails = () => {
    try {
      logEvent(analytics, 'requirement_details_view', {
        event_category: 'dashboard',
        event_label: 'navigation',
        requirement_id: requirement.requirementId,
        requirement_type: requirement.assetType,
        requirement_status: requirement.status,
        budget_range: requirement.marketValue === "Market Value" 
          ? "market_price" 
          : `${requirement.budget?.from}-${requirement.budget?.to}`,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging requirement details view:', error);
    }

    // Set requirement data in Redux
    dispatch(setRequirementDataThunk(requirement));

    // Navigate to the requirement details screen
    router.push({
      pathname: "/components/requirement/RequirementDetailsScreen",
    });
  };

  return (
    <StyledTouchableOpacity
      className="mb-4 rounded-lg bg-white border border-gray-200 overflow-visible"
      activeOpacity={0.7}
      onPress={handleNavigateToRequirementDetails}
      style={{ zIndex: 99999 - index }}
      key={requirement.requirementId}
    >
      {/* Top section with ID */}
      <StyledView className="p-4 pb-2">
        <StyledView className="border-b border-gray-200 pb-1 mb-3 w-fit">
          <StyledText className="text-sm text-gray-600 font-semibold">
            {`${requirement.requirementId}`}
          </StyledText>
        </StyledView>

        {/* Requirement Title */}
        <StyledText className="text-lg font-bold text-black mb-4">
          {requirement.propertyName}
        </StyledText>

        {/* Budget */}
        <StyledView className="flex flex-row items-center mb-2">
          <StyledView className="mr-2">
            <Ionicons name="cash-outline" size={20} color="#4B5563" />
          </StyledView>
          <StyledText className="text-base text-gray-700">
            {requirement.marketValue === "Market Value"
              ? "Market Price"
              : requirement.budget?.from === 0
              ? `₹${requirement.budget?.to || 0} Cr`
              : requirement.budget?.from === requirement.budget?.to
              ? `₹${requirement.budget?.to || 0}`
              : `₹${requirement.budget?.from || 0} Cr - ₹${
                  requirement.budget?.to || 0
                } Cr`}
          </StyledText>
        </StyledView>

        {/* Property Type */}
        <StyledView className="flex flex-row items-center">
          <StyledView className="mr-2">
            <Ionicons name="home-outline" size={20} color="#4B5563" />
          </StyledView>
          <StyledText className="text-base text-gray-700">
            {toCapitalizedWords(requirement.assetType)}
            {requirement.configuration
              ? ` - ${requirement.configuration}`
              : requirement.area
              ? ` - ${requirement.area} sqft`
              : ""}
            {requirement.configuration && requirement.area
              ? ` / ${requirement.area} sqft`
              : ""}
          </StyledText>
        </StyledView>

        {/* Requirement details if available */}
        {requirement.requirementDetails && (
          <StyledText className="text-base text-gray-700 mt-2">
            {requirement.requirementDetails}
          </StyledText>
        )}
      </StyledView>

      {/* Bottom section with status */}
      <StyledView className="px-4 py-4">
        <StyledView className="flex flex-row justify-between items-center bg-gray-50 p-3 rounded-md">
          <StyledText className="text-base font-medium text-gray-700">
            Requirement Status :
          </StyledText>

          <StyledView className="relative">
            <DashboardDropdown
              value={requirement.status}
              options={[
                { label: "Open", value: "Pending" },
                { label: "Closed", value: "Closed" },
              ]}
              setValue={(val) =>
                onStatusChange(requirement.requirementId || "", val)
              }
              type={"requirement"}
              openDropdownUp={index === totalCount - 1 && totalCount > 1}
            />
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledTouchableOpacity>
  );
};

export default React.memo(RequirementCard);

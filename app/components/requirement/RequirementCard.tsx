import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Budget, Requirement } from '@/app/types';
import { formatCost2 } from '@/app/helpers/common';
import { useDispatch } from 'react-redux';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';
import { setRequirementDataThunk } from '@/store/slices/requirementSlice';

interface RequirementCardProps {
  requirement: Requirement;
  onCardClick?: (requirement: any) => void;
}

// Use React.memo to optimize rendering and fix the static flag issue
const RequirementCard = React.memo(({ requirement, onCardClick }: RequirementCardProps) => {
  const router = useRouter();
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  // Format budget display
  const formatBudget = (budget: Budget) => {
    if (!budget) return "N/A";

    const from = (budget?.from ? budget?.from * 100 : 0);
    const to = (budget?.to ? budget?.to * 100 : 0);

    if (budget.from === 0) {
      return formatCost2(to);
    }

    if (budget.from === budget.to) {
      return formatCost2(to);
    }

    return `${formatCost2(from)} - ${formatCost2(to)}`;
  };

  // Format property type and configuration
  const formatPropertyInfo = () => {
    const assetType = requirement.assetType;
    const capitalizedAssetType = assetType ? assetType.charAt(0).toUpperCase() + assetType.slice(1) : assetType;

    const config = requirement.configuration;
    const area = requirement.area ? `${requirement.area} sqft` : '';

    if (config && area) {
      return `${capitalizedAssetType} - ${config} / ${area}`;
    }

    if (config) {
      return `${capitalizedAssetType} - ${config}`;
    }

    if (area) {
      return `${capitalizedAssetType} - ${area}`;
    }

    return capitalizedAssetType;
  };

  // Handle card click to navigate to requirement details
  const handleCardPress = () => {
    // Call the original onCardClick for analytics or other purposes
    if (onCardClick) {
      onCardClick(requirement);
    }

    // Set requirement data in Redux
    dispatch(setRequirementDataThunk(requirement));
    
    // Navigate to requirement details screen
    router.push({
      pathname: "/components/requirement/RequirementDetailsScreen"
    });
  };

  return (
    <>
      <TouchableOpacity
        className="border border-[#CCCBCB] rounded-lg p-4 bg-white mb-4 flex-col"
        onPress={handleCardPress}
        activeOpacity={0.7}
      >
        {/* ID and name */}
        <View className="flex-col gap-2 mb-4">
          {/* Requirement ID */}
          <View className="flex-row">
            <Text className="text-[#4B5563] text-xs text-[14px] border-b border-[#E3E3E3]" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
              {requirement.requirementId}
            </Text>
          </View>

          {/* Project Name */}
          <Text className="text-black text-base" style={{ fontFamily: 'Montserrat_700Bold' }}>
            {(requirement.propertyName || requirement.title || '').charAt(0).toUpperCase() + (requirement.propertyName || requirement.title || '').slice(1)}
          </Text>
        </View>

      {/* Budget and type */}
      <View className="flex-col gap-1 mb-0">
        {/* Budget Section */}
        <View className="flex-row items-center gap-2">
          <Ionicons name="cash-outline" size={20} color="#4B5563" />
          <Text className="text-neutral-600 text-sm font-medium">
            {requirement?.marketValue ?
              "Market Value"
              :
              formatBudget(requirement?.budget)
            }
          </Text>
        </View>

          {/* Configuration and Area Section */}
          <View className="flex-row items-center gap-2">
            <Ionicons name="home-outline" size={20} color="#4B5563" />
            <Text className="text-neutral-600 text-sm font-medium mr-2">
              {formatPropertyInfo()}
            </Text>
          </View>
        </View>

      {/* Requirement Details */}
      {requirement.requirementDetails && (
        <Text
          className="text-neutral-600 text-sm font-medium mt-4 mb-0"
          numberOfLines={2}
        >
          {requirement.requirementDetails}
        </Text>
      )}
    </TouchableOpacity>
    </>
  );
});

// Set display name for debugging
RequirementCard.displayName = 'RequirementCard';

export default RequirementCard;
import React, { useState } from 'react';
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold, useFonts } from '@expo-google-fonts/montserrat';
import { View, Text, TouchableOpacity, Image, Linking, Alert, StyleSheet, FlatList } from 'react-native';
import { Ionicons, Octicons } from '@expo/vector-icons';
import PropertyDetailsScreen from './PropertyDetailsScreen';
import EnquiryCPModal from '@/app/modals/EnquiryCPModal';
import ConfirmModal from '@/app/modals/ConfirmModal';
import ShareModal from '@/app/modals/ShareModal';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Enquiry } from '@/app/types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/app/config/firebase';
import { handleIdGeneration } from '@/app/helpers/nextId';
import deductMonthlyCredit from '@/app/helpers/deductCredit';
import { showErrorToast, showSuccessToast } from '@/utils/toastUtils';
import { useDispatch } from 'react-redux';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import ShareIconOutSide from '@/assets/icons/svg/PropertiesPage/ShareIcon';
import DriveIcon from '@/assets/icons/svg/PropertiesPage/DriveIcon';
import { router } from 'expo-router';
import { setPropertyDataThunk } from '@/store/slices/propertySlice';

interface PropertyCardProps {
  property: {
    propertyId: string;
    title?: string;
    nameOfTheProperty?: string;
    micromarket?: string;
    assetType?: string;
    unitType?: string;
    facing?: string;
    totalAskPrice?: number;
    sbua?: number;
    driveLink?: string;
    cpId?: string;
    cpCode?: string;
  };
  onCardClick?: (property: any) => void;
}

interface IdGenerationResult {
  lastId: string;
  nextId: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onCardClick }) => {
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  const [selectedCPID, setSelectedCPID] = useState("");
  const [isConfirmModelOpen, setIsConfirmModelOpen] = useState(false);
  const [isEnquiryModelOpen, setIsEnquiryCPModelOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const agentData = useSelector((state: RootState) => state.agent.docData);
  const phoneNumber = useSelector((state: RootState) => state?.agent?.docData?.phonenumber);
  const monthlyCredits = useSelector((state: RootState) => state?.agent?.docData?.monthlyCredits);

  // Format price display
  const formatPrice = () => {
    if (!property.totalAskPrice) return "N/A";

    if (property.totalAskPrice >= 100) {
      return `₹${(property.totalAskPrice / 100).toFixed(2)} Cr`;
    } else {
      return `₹${property.totalAskPrice} L`;
    }
  };

  const generateNextEnqId = async (): Promise<string | null> => {
    try {
      const type = "lastEnqId";
      const result = await handleIdGeneration(type) as IdGenerationResult;
      if (!result || !result.nextId) {
        showErrorToast("Failed to generate Enquiry ID. Please try again later.");
        return null;
      }
      showSuccessToast("Enquiry ID generated successfully!", { isInModal: true });
      return result.nextId;
    } catch (error) {
      showErrorToast("Error generating Enquiry ID. Please try again later.", { isInModal: true });
      console.error("Error generating IDs:", error);
      return null;
    }
  };

  // Get property name with first letter capitalized
  const getPropertyName = () => {
    const name = property.title || property.nameOfTheProperty || '';
    if (!name) return "Unnamed Property";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Handle opening drive details
  const handleOpenDriveDetails = (e: any) => {
    e.stopPropagation();
    if (!property.driveLink) {
      showErrorToast("Drive link not available for this property.");
      return;
    }

    Linking.openURL(property.driveLink);
  };

  // Handle enquire button click
  const handleEnquireNowBtn = (e: any) => {
    e.stopPropagation(); // Prevent card click
    setSelectedCPID(property.cpCode || "")
    if (monthlyCredits > 0) {
      setIsConfirmModelOpen(true);
      return;
    }
    showErrorToast("You don't have enough credits Please contact your account manager.");
  };

  const handleCancel = () => {
    setIsConfirmModelOpen(false)
  };

  const submitEnquiry = async (nextEnqId: string) => {
    const enq: Enquiry = {} as Enquiry;

    try {
      const enquiryDocRef = doc(db, "enquiries", nextEnqId);
      await setDoc(enquiryDocRef, enq);
      showSuccessToast("Enquiry submitted successfully!", { isInModal: true });
    } catch (error) {
      showErrorToast("Failed to submit enquiry. Please try again.", { isInModal: true });
      console.error("Error in enquiry submission:", error);
    }
  };

  const onConfirmEnquiry = async () => {
    if (!selectedCPID) {
      showErrorToast("Error: Seller CPID is missing. Please try again.");
      setIsConfirmModelOpen(false);
      return;
    }

    if (!(monthlyCredits > 0)) {
      showErrorToast("You don't have enough credits. Please contact your account manager.");
      setIsConfirmModelOpen(false);
      return;
    }

    try {
      const nextEnqId = await generateNextEnqId()
      if (!nextEnqId) {
        setIsConfirmModelOpen(false);
        return;
      }

      // ✅ Deduct credits first
      await deductMonthlyCredit(phoneNumber, monthlyCredits, dispatch);

      if (typeof nextEnqId === "string") {
        await submitEnquiry(nextEnqId);
      }

      // ✅ Close the confirmation modal
      setIsConfirmModelOpen(false);

      // ✅ Open EnquireCPModal AFTER confirming
      setTimeout(() => {
        setIsEnquiryCPModelOpen(true);
      }, 100);
    } catch (error) {
      console.error("Error during enquiry process:", error);
      showErrorToast("An error occurred while processing your enquiry. Please try again.");
    }
  };

  const handleShareButton = (e: any) => {
    e.stopPropagation(); // Prevent card click
    setIsShareModalOpen(true);
  };

  // Function to open property details screen with routing
  const openPropertyDetails = () => {
    // First dispatch the property data to the Redux store
    if (property) {
      dispatch(setPropertyDataThunk(property));

      // Then navigate to the property details screen
      router.push({
        pathname: "/components/property/PropertyDetailsScreen",
        params: {
          parent: "properties"
        }
      });
    }
  };

  return (
    <>
      <TouchableOpacity
        className="border border-[#CCCBCB] rounded-lg p-4 bg-white mb-4 flex-col"
        onPress={openPropertyDetails}
      >
        <View className="flex-col mb-3">
          {/* Header section with Property ID and MicroMarket */}
          <View className="flex-row items-center">
            {/* Property ID on the left - using width fit-content approach */}
            <View className="flex-1" style={{ flexShrink: 1 }}>
              <View style={{ alignSelf: 'flex-start' }}>
                <Text className="text-gray-600 text-[14px]  border-b border-[#E3E3E3]" style={{ fontFamily: 'Montserrat_700Bold' }}>
                  {property.propertyId}
                </Text>
              </View>
            </View>

            {/* Micromarket in the middle-right */}
            <View className="flex-row items-center bg-[#747474] px-2 py-1 rounded-full mr-2">
              <Ionicons name="location-outline" size={14} color="#FAFBFC" />
              <Text className="text-[#FAFBFC] text-xs ml-1">
                {property.micromarket || "-"}
              </Text>
            </View>

            {/* Share button on the far right */}
            <TouchableOpacity style={styles.shareButton} onPress={handleShareButton}>
              <ShareIconOutSide />
            </TouchableOpacity>
          </View>


          {/* Property Name */}
          <Text className="text-black text-base mt-2 font-bold" style={{ fontFamily: 'Montserrat_700Bold' }}>
            {getPropertyName()}
          </Text>
        </View>

        {/* Tags section for Asset Type, Unit Type, and Facing */}
        <View className="flex-row flex-wrap gap-2 mb-3">
          {[
            property.assetType,
            property.unitType,
            property.facing
          ]
            .filter(Boolean) // Filter out any falsy values
            .map((tag, index) => (
              <View key={index} className="border border-[#E3E3E3] bg-white px-3 py-1 rounded-full bg-[#FAFAFA]">
                <Text className="text-neutral-600 text-xs text-[#525252]">
                  {tag}
                </Text>
              </View>
            ))}
        </View>

        {/* Price and SBUA (Super Built-Up Area) section */}
        <View className="flex-row justify-between items-start border-t border-[#E3E3E3] pt-2 mb-3">
          {/* Total Ask Price */}
          <View className="flex-col items-start">
            <Text className="text-gray-600 text-xs" style={{ fontFamily: 'Montserrat_600SemiBold' }}>Total Ask Price:</Text>
            <Text className="text-sm font-semibold text-gray-900">
              {formatPrice()}
            </Text>
          </View>

          {/* SBUA */}
          <View className="flex-col items-start">
            <Text className="text-gray-600 text-xs" style={{ fontFamily: 'Montserrat_600SemiBold' }}>SBUA:</Text>
            <Text className="text-sm font-semibold text-gray-900">
              {property.sbua ? `${property.sbua} Sq Ft` : "-"}
            </Text>
          </View>
        </View>

        {/* Buttons for Drive Details and Enquire Now */}
        <View className="flex-row gap-3 mt-1">
          {/* Drive Details Button */}
          <TouchableOpacity
            className="flex-1 border border-[#153E3B] rounded-md py-2 flex-row justify-center items-center"
            onPress={handleOpenDriveDetails}
          >
            <DriveIcon />
            <Text style={{ fontSize: 14 }} className="text-[#153E3B] font-medium text-xs ml-1">Details</Text>
          </TouchableOpacity>

          {/* Enquire Now Button */}
          <TouchableOpacity
            className="flex-1 bg-[#153E3B] rounded-md py-2 flex-row justify-center items-center"
            onPress={handleEnquireNowBtn}
          >
            <Ionicons name="call-outline" size={16} color="white" />
            <Text style={{ fontSize: 14 }} className="text-white font-medium text-xs ml-1">Enquire Now</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Modals */}
      <EnquiryCPModal
        setIsEnquiryCPModalOpen={setIsEnquiryCPModelOpen}
        generatingEnquiry={false}
        visible={isEnquiryModelOpen}
        selectedCPID={selectedCPID}
      />
      <ConfirmModal
        title="Confirm Enquiry"
        message={`Are you sure you want to enquire? You have ${monthlyCredits} credits remaining for this month.`}
        onConfirm={onConfirmEnquiry}
        onCancel={handleCancel}
        generatingEnquiry={false}
        visible={isConfirmModelOpen}
      />
      <ShareModal
        property={property}
        agentData={agentData}
        setProfileModalOpen={setIsShareModalOpen}
        visible={isShareModalOpen}
      />
    </>
  );
};

export default React.memo(PropertyCard);

const styles = StyleSheet.create({
  shareButton: {
    width: 30,
    height: 30,
    borderRadius: 22,
    backgroundColor: '#E3E3E3',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
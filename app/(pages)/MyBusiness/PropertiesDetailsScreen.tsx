import { useState, useEffect } from "react";
import { selectPropertyStateData } from "@/store/slices/propertySlice";
import { Text, View, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { inventoryFormConfig } from "@/app/config/AddInventoryFormConfig/inventoryFormConfig";
import { router } from "expo-router";
import { FormPreview } from "@/app/components/Listing/listingPropertyDetails";
import ShareIcon from "@/assets/icons/MyBusinessPage/share.svg";
import EditIcon from "@/assets/icons/MyBusinessPage/edit.svg";
import EditIcon2 from "@/assets/icons/MyBusinessPage/edit2.svg";
import ShareModal from "@/app/modals/ShareModal";
import { subscribeToPropertyById } from "@/app/services/property_services/propertyService";
import { setPropertyData } from "@/store/slices/propertySlice";

const PropertysDetailsScreen = () => {
  const property = useSelector(selectPropertyStateData);
  const agentData = useSelector((state: RootState) => state.agent.docData);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const dispatch = useDispatch();

  //---------------------- Real-time Firestore Listener ----------------------//
  useEffect(() => {
    if (!property?.propertyId) return;

    const unsubscribe = subscribeToPropertyById(
      property.propertyId,
      (updatedProperty) => {
        if (updatedProperty) {
          dispatch(setPropertyData(updatedProperty));
        }
      },
      property.stage != "live" ? "qc" : "verified",
      property.stage != "live" ? "qc" : "verified",
      (error: any) => {
        console.error("Error in property subscription:", error);
      }
    );

    return () => unsubscribe();
  }, [property?.propertyId]);

  //----------------------Utility Function----------------------//
  const handleShareButtonPress = () => {
    setShowShareModal(true);
  };

  const handleEditButtonPress = () => {
    const formType =
      property.stage !== "live" ? "underReviewEdit" : "verifiedEdit";
    router.push({
      pathname: "/(tabs)/AddInventoryForm",
      params: {
        item: JSON.stringify(property),
        formType: formType,
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <FormPreview
        config={inventoryFormConfig}
        data={property}
        previewType="myBusiness"
      />
      <FormPreview
        config={inventoryFormConfig}
        data={property}
        previewType="myBusiness"
      />
      {/* Navigation Buttons */}
      <View className="flex flex-row items-center justify-center gap-[13px] px-4 py-[14.5px]">
        {property?.stage !== "live" && (
          <TouchableOpacity
            className="w-full py-2 px-5 rounded-[4px] bg-[#10302D] gap-2"
            onPress={handleEditButtonPress}
          >
            <View className="flex flex-row items-center justify-center space-x-2 h-[18px]">
              <EditIcon2 height={18} width={18} />
              <Text className="text-xs font-bold text-white h-[18px]">
                Edit Property
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {property?.stage === "live" && (
          <View className="flex flex-row w-full space-x-3">
            <TouchableOpacity
              className="flex-1 py-2 px-5 rounded-[4px] bg-white border-[1.5px] border-[#153E3B] flex-row items-center justify-center"
              onPress={handleEditButtonPress}
            >
              <EditIcon height={18} width={18} />
              <Text className="text-xs font-bold text-black ml-2">
                Edit Property
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-2 px-3 rounded-[4px] bg-[#10302D] flex-row items-center justify-center"
              onPress={handleShareButtonPress}
            >
              <View className="flex flex-row items-center justify-center space-x-2 h-[18px]">
                <ShareIcon height={18} width={18} />
                <Text className="text-xs font-bold text-white h-[18px]">
                  Share
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <ShareModal
        property={property}
        agentData={agentData}
        setProfileModalOpen={setShowShareModal}
        visible={showShareModal}
      />
    </View>
  );
};

export default PropertysDetailsScreen;

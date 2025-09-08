import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  BackHandler,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { ScrollContext } from "@/app/ScrollContext";
import ModularPopup from "@/components/ModularPopup";
import { getTimeDifference } from "@/app/helpers/format/timestamp";

import { FormConfig, FormField } from "@/types/FormConfig";
import { useEnquiries } from "@/hooks/enquiryHooks/useEnquiries";
import { Property } from "@/app/types";
import { MediaUploadData } from "../../services/media_services/imageService";
import { PropertyImages } from "./property/PropertyImages";
import { BasicPropertyInfo } from "./property/BasicPropertyInfo";
import { DetailsSection } from "./property/DetailsSection";
import { LocationSection } from "./property/LocationSection";
import { ExtraDetailsSection } from "./property/ExtraDetailsSection";
import ArrowLeftIcon from "@/assets/icons/svg/Common/ArrowLeftIcon";
import ListedAgo from "@/assets/icons/svg/PropertyListing/PropertyDetails/ListedAgo.svg";
import DateOfLastChecked from "@/assets/icons/svg/PropertyListing/PropertyDetails/dateOfLastChecked.svg";
import EnquiriesReceivedCard from "../MyBusinessPage/EnquiriesReceivedCard";
import PropertiesStatusCard from "../MyBusinessPage/PropertyStatusCard";
import SaveAsDraft from "@/app/modals/SaveAsDraft";
import StatusInfoBottomSheet from "../property/StatusInfoBottomSheet";
import BottomSheetModal from "./statusUpdateModal"; // Assuming the BottomSheetModal is used here still
import StatusUpdateModal from "../property/statusUpdateModal";
import { toCapitalizedWords } from "@/app/helpers/common";
import { updateProperty } from "@/app/services/property_services/propertyService";

export type UIProperty = Omit<Property, "handOverDate"> & {
  handOverDate?: string;
  media?: MediaUploadData;
};

interface FormPreviewProps {
  config: FormConfig;
  data: Partial<UIProperty>;
  onMediaUpdate?: (media: MediaUploadData) => void;
  agentData?: any;
  propId?: string;
  previewType: string;
  handleDraftSave?: () => Promise<void>;
  showDraftModal?: boolean;
  setShowDraftModal?: (show: boolean) => void;
  setShowPreview?: (show: boolean) => void;
}

export const FormPreview: React.FC<FormPreviewProps> = ({
  config,
  data,
  onMediaUpdate,
  agentData,
  propId,
  previewType,
  handleDraftSave,
  showDraftModal,
  setShowDraftModal,
  setShowPreview,
}) => {
  const [statusUpdateModal, setStatusUpdateModal] = useState(false); // State to manage ModularPopup visibility
  const modalOpacityAnimation = useRef(new Animated.Value(0)).current;

  const { enquiryCount, newEnquiryCount, loading } = useEnquiries({
    propertyId: data?.propertyId || "",
  });

  const { isStatusInfoOpen, currentStatusInfo, closeStatusInfo } =
    useContext(ScrollContext);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (setShowPreview) {
          setShowPreview(false);
          return true;
        }
      }
    );

    return () => backHandler.remove();
  }, [setShowPreview]);

  // Define the items for the ModularPopup
  const statusItems = [
    {
      id: "1",
      text: "Available",
      onPress: () => {
        updateStatus("Available");
        setStatusUpdateModal(false); // Close popup after selection
      },
    },
    {
      id: "2",
      text: "Hold",
      onPress: () => {
        updateStatus("Hold");
        setStatusUpdateModal(false);
      },
    },
    // Conditionally add the last item based on the listing type
    ...(data?.listingType === "resale"
      ? [
          {
            id: "3",
            text: "Sold",
            onPress: () => {
              updateStatus("sold");
              setStatusUpdateModal(false);
            },
          },
        ]
      : []),
    ...(data?.listingType === "rental"
      ? [
          {
            id: "3",
            text: "Tenanted",
            onPress: () => {
              updateStatus("tenanted");
              setStatusUpdateModal(false);
            },
          },
        ]
      : []),
  ];

  // Function to handle the status update (assuming it's available in your context)
  const updateStatus = (status: string) => {
    if (data.propertyId)
      updateProperty(data.propertyId, { status }, "verified");
  };

  const getFieldValue = (obj: any, path: string) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  const isFieldVisible = (field: FormField): boolean => {
    if (!field.dependsOn) return true;

    if ("field" in field.dependsOn) {
      const currentValue = getFieldValue(data, field.dependsOn.field);
      return field.dependsOn.values.includes(currentValue);
    }

    if ("conditions" in field.dependsOn) {
      return field.dependsOn.conditions.every((condition) => {
        const currentValue = getFieldValue(data, condition.field);
        return condition.values.includes(currentValue);
      });
    }

    return true;
  };

  const processedSteps = config.steps
    .map((step) => {
      const fieldGroups = step.fields.reduce((acc, field) => {
        if (!acc[field.id]) acc[field.id] = [];
        acc[field.id].push(field);
        return acc;
      }, {} as Record<string, FormField[]>);

      const stepValues = Object.values(fieldGroups)
        .map((fields) => {
          const activeField = fields.find((f) => isFieldVisible(f));
          return activeField
            ? {
                id: activeField.id,
                label: activeField.label,
                suffix: activeField.suffix || "",
                prefix: activeField.prefix || "",
              }
            : null;
        })
        .filter(Boolean) as Array<{
        id: string;
        label: string;
        suffix: string;
        prefix: string;
      }>;

      return { ...step, stepValues };
    })
    .filter((s) => s.stepValues.length > 0);

  const legacyImages: string[] = [];
  const currentMedia: MediaUploadData = {
    photos: data.media?.photos ?? [],
    videos: data.media?.videos ?? [],
    documents: data.media?.documents ?? [],
  };

  useEffect(() => {
    if (statusUpdateModal) {
      Animated.timing(modalOpacityAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalOpacityAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [statusUpdateModal]);

  return (
    <>
      <ScrollView className="flex-1 bg-gray-50">
        <View className="absolute bg-transparent z-50 flex flex-row justify-between items-center px-4 py-3 w-full">
          <View className="flex flex-row gap-[10px]">
            <TouchableOpacity
              className="bg-[#FAFAFA] rounded-full p-[6px] h-[28px] w-[28px] flex items-center justify-center"
              onPress={() => {
                router.back();
              }}
            >
              <ArrowLeftIcon height={12} width={12} />
            </TouchableOpacity>
            <View className="bg-[#FAFAFA] py-2 px-3 rounded-[24px]">
              <Text className="leading-normal text-xs font-semibold text-[#153E3B]">
                {data?.propertyId}
              </Text>
            </View>
          </View>
          <View className="flex flex-row gap-[6px]">
            <View
              className={`${
                data?.listingType == "rental" ? "bg-[#FCE9BA]" : "bg-[#EADDFF]"
              } py-2 px-3 rounded-[24px]`}
            >
              <Text className="leading-normal text-xs font-semibold text-[#153E3B]">
                {toCapitalizedWords(data?.listingType)}
              </Text>
            </View>
            {data?.rentalInfo?.isPreLeased && (
              <View className="bg-[#F7C752] py-2 px-3 rounded-[24px]">
                <Text className="leading-normal text-xs font-semibold text-[#153E3B]">
                  Pre-Leased
                </Text>
              </View>
            )}
          </View>
        </View>

        <PropertyImages
          images={legacyImages}
          currentMedia={currentMedia}
          onMediaUpdate={onMediaUpdate}
          propId={propId}
          agentData={agentData}
          previewType={previewType}
        />
        <BasicPropertyInfo data={data} previewType={previewType} />

        {previewType == "myBusiness" && (
          <View className="flex-1 space-y-3">
            <PropertiesStatusCard
              data={data}
              statusUpdateModal={statusUpdateModal}
              setStatusUpdateModal={setStatusUpdateModal}
            />
            {enquiryCount > 0 && !loading && (
              <EnquiriesReceivedCard
                totalCount={enquiryCount}
                newCount={newEnquiryCount}
              />
            )}
          </View>
        )}

        {processedSteps.map((step) => {
          if (step.title === "Basic Details") return;
          let displayType: "list" | "tags" | "mixed" = "list";

          if (step.title === "More Details") {
            displayType = "mixed";
          } else if (
            step.title.toLowerCase().includes("more") ||
            step.title.toLowerCase().includes("extra")
          ) {
            displayType = "list";
          }

          if (step.title === "Pricing Details") {
            return (
              <>
                <DetailsSection
                  key={step.id}
                  title={step.title}
                  stepValues={step.stepValues}
                  data={data}
                  displayType={displayType}
                />
                <View className="bg-white px-6 py-4 rounded-lg">
                  <LocationSection data={data} />
                </View>
              </>
            );
          }
          return (
            <DetailsSection
              key={step.id}
              title={step.title}
              stepValues={step.stepValues}
              data={data}
              displayType={displayType}
            />
          );
        })}

        {data.extraDetails && (
          <ExtraDetailsSection extraDetails={data.extraDetails} />
        )}

        {setShowDraftModal && showDraftModal && handleDraftSave && (
          <SaveAsDraft
            visible={showDraftModal || false}
            onClose={() => setShowDraftModal(false)}
            handleSaveDraft={handleDraftSave}
            isSaving={false}
          />
        )}
        {previewType == "myBusiness" && (
          <View className="flex flex-col gap-y-3 px-4 py-3">
            <Text className="text-[14px] leading-[150%] font-bold text-black font-montserrat-bold">
              Inventory Details
            </Text>
            <View className="flex flex-row justify-between">
              <View className="flex flex-row items-center gap-x-2">
                <View className="p-[6px] bg-[#E0F7F4] rounded-md">
                  <ListedAgo />
                </View>
                <View className="flex flex-col">
                  <Text className="text-[14px] leading-[150%] font-bold text-[#5A5555] font-montserrat-bold">
                    Listed
                  </Text>
                  <Text className="text-[14px] leading-[150%] font-bold text-black font-montserrat-bold">
                    {getTimeDifference(data.added)}
                  </Text>
                </View>
              </View>
              <View className="flex flex-row items-center gap-x-2">
                <View className="p-[6px] bg-[#E0F7F4] rounded-md">
                  <DateOfLastChecked stroke={"#000000"} strokeWidth={0.3} />
                </View>
                <View className="flex flex-col">
                  <Text className="text-[14px] leading-[150%] font-bold text-[#5A5555] font-montserrat-bold">
                    Inventory Last checked
                  </Text>
                  <Text className="text-[14px] leading-[150%] font-bold text-black font-montserrat-bold">
                    {getTimeDifference(data.dateOfLastChecked)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Use ModularPopup for status update */}
      {statusUpdateModal && (
        <Animated.View
          style={[
            styles.popupContainerOverFooter,
            { opacity: modalOpacityAnimation },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.popupTouchOverFooter}
            onPress={() => setStatusUpdateModal(false)}
          >
            <ModularPopup
              items={statusItems} // Pass the status items
              slideAnimation={new Animated.Value(0)} // Add animation handling as needed
              onDragDown={() => setStatusUpdateModal(false)} // Close popup on drag down
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      <StatusInfoBottomSheet
        visible={isStatusInfoOpen}
        status={currentStatusInfo}
        onClose={closeStatusInfo}
      />
    </>
  );
};

const styles = StyleSheet.create({
  popupContainerOverFooter: {
    position: "absolute",
    zIndex: 105,
    width: "100%",
    height: "100%",
    backgroundColor: "#00000033",
  },
  popupTouchOverFooter: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    zIndex: 105,
  },
});

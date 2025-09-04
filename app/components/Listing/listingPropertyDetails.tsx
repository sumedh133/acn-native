import React from "react";
import { ScrollView, View, Text } from "react-native";
import { FormConfig, FormField } from "@/types/FormConfig";
import { useEnquiries } from "@/hooks/enquiryHooks/useEnquiries";
import { Property } from "@/app/types";
import { MediaUploadData } from "../../services/media_services/imageService";
import { router } from "expo-router";

import { PropertyImages } from "./property/PropertyImages";
import { BasicPropertyInfo } from "./property/BasicPropertyInfo";
import { DetailsSection } from "./property/DetailsSection";
import { LocationSection } from "./property/LocationSection";
import { ExtraDetailsSection } from "./property/ExtraDetailsSection";
import { toCapitalizedWords } from "@/app/helpers/common";

import ArrowLeftIcon from "@/assets/icons/svg/Common/ArrowLeftIcon";

import EnquiriesReceivedCard from "../MyBusinessPage/EnquiriesReceivedCard";
import PropertiesStatusCard from "../MyBusinessPage/PropertyStatusCard";
import { TouchableOpacity } from "react-native";

type UIProperty = Omit<Property, "handOverDate"> & {
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
}

export const FormPreview: React.FC<FormPreviewProps> = ({
  config,
  data,
  onMediaUpdate,
  agentData,
  propId,
  previewType
}) => {

  const {

    enquiryCount,
    newEnquiryCount,

  } = useEnquiries({ propertyId: data?.propertyId });

  const getFieldValue = (obj: any, path: string) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  const isFieldVisible = (field: FormField): boolean => {
    if (!field.dependsOn) return true;

    if ("field" in field.dependsOn) {
      // Single dependency
      const currentValue = getFieldValue(data, field.dependsOn.field);
      return field.dependsOn.values.includes(currentValue);
    }

    if ("conditions" in field.dependsOn) {
      // Multiple conditions with AND logic
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
            ? { id: activeField.id, label: activeField.label, suffix: activeField.suffix || '', prefix: activeField.prefix || '' }
            : null;
        })
        .filter(Boolean) as Array<{ id: string; label: string, suffix: string, prefix: string }>;

      return { ...step, stepValues };
    })
    .filter((s) => s.stepValues.length > 0);

  const legacyImages: string[] = [];
  const currentMedia: MediaUploadData = {
    photos: data.media?.photos ?? [],
    videos: data.media?.videos ?? [],
    documents: data.media?.documents ?? [],
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="absolute bg-transparent z-50 flex flex-row justify-between items-center px-4 py-3 w-full">
        <View className="flex flex-row gap-[10px]">
          <TouchableOpacity className="bg-[#FAFAFA] rounded-full p-[6px] h-[28px] w-[28px] flex items-center justify-center" onPress={() => { router.back() }}><ArrowLeftIcon height={12} width={12} /></TouchableOpacity>
          <View className="bg-[#FAFAFA] py-2 px-3 rounded-[24px]">

            <Text className="leading-normal text-xs font-semibold text-[#153E3B]">{data?.propertyId}</Text>
          </View>
        </View>
        <View className="flex flex-row gap-[6px]">
          <View className={`${data?.listingType == "rental" ? "bg-[#FCE9BA]" : "bg-[#EADDFF]"} py-2 px-3 rounded-[24px]`}>
            <Text className="leading-normal text-xs font-semibold text-[#153E3B]">{toCapitalizedWords(data?.listingType)}</Text>
          </View>
          {data?.rentalInfo?.isPreLeased || true && (
            <View className="bg-[#F7C752] py-2 px-3 rounded-[24px]">
              <Text className="leading-normal text-xs font-semibold text-[#153E3B]">Pre-Leased</Text>
            </View>)}
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

      {previewType == 'myBusiness' && (<>
        <PropertiesStatusCard data={data} />
        <EnquiriesReceivedCard totalCount={enquiryCount} newCount={newEnquiryCount} />
      </>)}


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
    </ScrollView>
  );
};
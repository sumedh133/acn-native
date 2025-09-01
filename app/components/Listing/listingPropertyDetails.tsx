import React from "react";
import { ScrollView, View } from "react-native";
import { FormConfig, FormField } from "@/types/FormConfig";
import { Property } from "@/app/types";
import { MediaUploadData } from "../../services/media_services/imageService";

import { PropertyImages } from "./property/PropertyImages";
import { BasicPropertyInfo } from "./property/BasicPropertyInfo";
import { DetailsSection } from "./property/DetailsSection";
import { LocationSection } from "./property/LocationSection";
import { ExtraDetailsSection } from "./property/ExtraDetailsSection";

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

  console.log("Shree Krishna", currentMedia)

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <PropertyImages
        images={legacyImages}
        currentMedia={currentMedia}
        onMediaUpdate={onMediaUpdate}
        propId={propId}
        agentData={agentData}
      />
      <BasicPropertyInfo data={data} previewType={previewType} />

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
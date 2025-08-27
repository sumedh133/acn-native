import React from "react";
import { ScrollView } from "react-native";
import { FormConfig, FormField } from "@/types/FormConfig";
import { Property } from "@/app/types";

import { PropertyImages } from "./property/PropertyImages";
import { BasicPropertyInfo } from "./property/BasicPropertyInfo";
import { DetailsSection } from "./property/DetailsSection";

interface FormPreviewProps {
  config: FormConfig;
  data: Partial<Property>;
}

export const FormPreview: React.FC<FormPreviewProps> = ({ config, data }) => {
  const getFieldValue = (obj: any, path: string) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  const isFieldVisible = (field: FormField): boolean => {
    if (!field.dependsOn) return true;
    const currentValue = getFieldValue(data, field.dependsOn.field);
    return field.dependsOn.values.includes(currentValue);
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
          return activeField ? { id: activeField.id, label: activeField.label } : null;
        })
        .filter(Boolean) as Array<{ id: string; label: string }>;

      return { ...step, stepValues };
    })
    .filter((s) => s.stepValues.length > 0);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <PropertyImages images={[]} />
      <BasicPropertyInfo data={data} />

      {processedSteps.map((step) => {
        const displayType =
          step.title.toLowerCase().includes("more") ||
          step.title.toLowerCase().includes("extra")
            ? "tags"
            : "list";
        return (
          <DetailsSection
            key={step.id}
            title={step.title}
            stepValues={step.stepValues}
            data={data}
            displayType={displayType as "list" | "tags"}
          />
        );
      })}
    </ScrollView>
  );
};

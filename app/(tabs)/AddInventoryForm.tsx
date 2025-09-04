import React, { useState } from "react";
import { PropertyFormScreen } from "@/app/components/addInventoryForm/PropertyFormScreen";
import { Property } from "../types";
import { createProperty, updateProperty } from "../services/property_services/propertyService";
import { convertMonthYearToUnix } from "../helpers/format/format";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";

type UIProperty = Omit<Property, "handOverDate"> & {
  handOverDate?: string;
};

const AddInventoryForm = () => {
  const { item, formType } = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const [editData, _] = useState<Partial<UIProperty> | undefined>(() => {
    if (item) {
      try {
        return JSON.parse(item as string) as Partial<UIProperty>;
      } catch (error) {
        console.error("Invalid JSON in item:", item);
        return undefined;
      }
    }
    return undefined;
  });



  const normalizePropertyBeforeSubmit = (
    data: Partial<UIProperty>
  ): Partial<Property> => {
    const temp: Partial<UIProperty> = { ...data };

    const normalized: Partial<Property> = {
      ...temp,
      handOverDate:
        typeof temp.handOverDate === "string"
          ? convertMonthYearToUnix(temp.handOverDate) ?? undefined
          : temp.handOverDate,
    };

    return normalized;
  };

  const handleFormComplete = async (data: Partial<UIProperty>) => {
    try {
      setIsSubmitting(true)
      // Normalize and clean data
      const normalizedData = normalizePropertyBeforeSubmit(data);
      const cleanData = JSON.parse(
        JSON.stringify(normalizedData, (_, value) => (value === undefined ? null : value))
      );

      console.log("Normalized & Cleaned Data:", cleanData);

      // Update for underReviewEdit
      if (formType === "underReviewEdit") {
        await updateProperty(cleanData.propertyId, cleanData, "qc", true);
        console.log("Property updated in QC review:", cleanData);
        showSuccessToast(`Property updated successfully and sent for QC review!`);
        setIsSubmitting(false)
        router.back();
        return;
      }

      // Update for verifiedEdit
      if (formType === "verifiedEdit") {
        await updateProperty(cleanData.propertyId, cleanData, "verified", true);
        console.log("Property updated in Verified stage:", cleanData);
        showSuccessToast(`Property updated successfully in verified stage!`);
        setIsSubmitting(false)
        router.back();
        return;
      }

      // If property is draft → move to pending
      if (cleanData.status === "draft") {
        await updateProperty(cleanData.propertyId, { ...cleanData, status: "pending" }, "qc");

        console.log("Draft property moved to pending QC:", cleanData);
        showSuccessToast(`Draft property submitted for QC verification!`);

      } else {
        // New property creation
        await createProperty(cleanData as Omit<Property, "propertyId">, "qc");
        console.log("New property created:", cleanData);
        showSuccessToast(`New property created and sent for verification!`);
      } fetch(
        `https://notification-server-acn.onrender.com/addinventory/${cleanData.propertyId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setIsSubmitting(false)

      // Navigation after success for create or draft update
      router.dismissAll();
      router.replace("/(tabs)/dashboardTab");


    } catch (error: any) {
      console.error("Error while saving/updating property:", error);

      if (editData) {
        showErrorToast(`Something went wrong while updating the property. Please try again.`);
      } else {
        showErrorToast(`Something went wrong while saving the property. Please try again.`);
      }
    }

  };

  return (
    <PropertyFormScreen
      initialData={editData}
      onComplete={handleFormComplete}
      isEdit={formType == "underReviewEdit" || formType == "verifiedEdit" ? true : false}
      isSubmitting={isSubmitting}
    />
  );
};
export default AddInventoryForm;

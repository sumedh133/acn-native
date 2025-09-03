import React, { useState } from "react";
import { Alert } from "react-native";
import { PropertyFormScreen } from "@/app/components/addInventoryForm/PropertyFormScreen";
import { Property } from "../types";
import { createProperty } from "../services/property_services/propertyService";
import { convertMonthYearToUnix } from "../helpers/format/format";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";

type UIProperty = Omit<Property, "handOverDate"> & {
  handOverDate?: string;
};

const AddInventoryForm = () => {
  const { item } = useLocalSearchParams();

  const [editData, setEditData] = useState<Partial<UIProperty> | undefined>(() => {
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

      const normalizedData = normalizePropertyBeforeSubmit(data);

      // Clean undefined/null fields
      const cleanData = JSON.parse(
        JSON.stringify(normalizedData, (key, value) =>
          value === undefined ? null : value
        )
      );

      if (editData) {
        // update flow
        console.log("Cleaned update data:", cleanData);

        showSuccessToast(`Property updated successfully!\n`)
      } else {
        if (cleanData.status == "draft") { }
        else {
          // create flow
          const newProperty = await createProperty(
            cleanData as Omit<Property, "propertyId">
          );
        }
        showSuccessToast("Property sent for verification!");
        router.dismissAll();
        router.replace("/(tabs)/dashboardTab");
      }
    } catch (error: any) {
      if (editData) { showErrorToast(`Something went wrong while updating the property.`) }
      else { showErrorToast(`Something went wrong while saving the property.`) }
      console.error("Error saving property:", error);
    }
  };


  return (
    <PropertyFormScreen
      initialData={editData}
      onComplete={handleFormComplete}
      isEdit={!!editData}
    />
  );
};
export default AddInventoryForm;

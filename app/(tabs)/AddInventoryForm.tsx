import React, { useState } from "react";
import { Alert } from "react-native";
import { PropertyFormScreen } from "@/app/components/addInventoryForm/PropertyFormScreen";
import { Property } from "../types";
import { createProperty } from "../services/property_services/propertyService";
import { convertMonthYearToUnix } from "../helpers/format/format";

type UIProperty = Omit<Property, "handOverDate"> & {
  handOverDate?: string;
};

const AddInventoryForm = () => {
  const [showForm, setShowForm] = useState(true);
  const [editData, setEditData] = useState<Partial<UIProperty> | undefined>();

  const normalizePropertyBeforeSubmit = (
    data: Partial<UIProperty>
  ): Partial<Property> => {
    const temp: Partial<UIProperty> = { ...data };

    const normalized: Partial<Property> = {
      ...temp,
      handOverDate:
        typeof temp.handOverDate === "string"
          ? convertMonthYearToUnix(temp.handOverDate) ?? undefined
          : temp.handOverDate, // already number or undefined
    };

    return normalized;
  };

  const handleFormComplete = async (data: Partial<UIProperty>) => {
    try {
      console.log("Raw form data:", data);
      Alert.alert("Debug Data", JSON.stringify(data, null, 2).slice(0, 300)); // show trimmed data

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

        Alert.alert(
          "Success",
          `Property updated successfully!\nID: ${editData.propertyId}`,
          [{ text: "OK", onPress: () => setShowForm(false) }]
        );
      } else {
        // create flow
        const newProperty = await createProperty(
          cleanData as Omit<Property, "propertyId">
        );
        console.log("Cleaned new property:", newProperty);

        Alert.alert(
          "Success",
          `Property added successfully!\nID: ${newProperty.propertyId}`,
          [{ text: "OK", onPress: () => setShowForm(false) }]
        );
      }
    } catch (error: any) {
      console.error("Error saving property:", error);
      Alert.alert("Error", "Something went wrong while saving the property.");
    }
  };

  const handleFormCancel = () => {
    Alert.alert(
      "Cancel",
      "Are you sure you want to cancel? All changes will be lost.",
      [
        { text: "Continue Editing", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => setShowForm(false),
        },
      ]
    );
  };

  if (!showForm) {
    // Return your main app UI here
    return null;
  }

  return (
    <PropertyFormScreen
      initialData={editData}
      onComplete={handleFormComplete}
      onCancel={handleFormCancel}
      isEdit={!!editData}
    />
  );
};
export default AddInventoryForm;

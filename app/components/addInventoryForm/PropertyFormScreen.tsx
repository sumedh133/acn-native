import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { createProperty, updateProperty } from "@/app/services/property_services/propertyService";
import { convertMonthYearToUnix } from "@/app/helpers/format/format";
import { showSuccessToast, showErrorToast } from "@/utils/toastUtils";
import { FormRenderer } from "./FormRenderer";
import { inventoryFormConfig } from "@/app/config/AddInventoryFormConfig/inventoryFormConfig";
import { DocsToUpload, Places, Property } from "@/app/types";
import ArrowLeftIcon from "@/assets/icons/svg/Common/ArrowLeftIcon";
import { getStepIcon } from "@/utils/iconUtils";
import { LinearGradient } from "expo-linear-gradient";
import { FormPreview } from "../Listing/listingPropertyDetails";
import { getMicromarketFromCoordinates } from "@/app/helpers/getMicromarketFromCoordinates";
import { FormField } from "@/types/FormConfig";
import SaveAsDraft from "@/app/modals/SaveAsDraft";

// Extend FormField to include our internal properties
interface FormFieldWithMeta extends FormField {
  _actualColspan?: number;
}

type UIProperty = Omit<Property, "handOverDate"> & {
  handOverDate?: string;
};

interface PropertyFormScreenProps {
  initialData?: Partial<UIProperty>;
  onComplete: (data: Partial<UIProperty>) => void;
  isEdit?: boolean;
}

export const PropertyFormScreen: React.FC<PropertyFormScreenProps> = ({
  initialData,
  onComplete,
  isEdit = false,
}) => {

  // --------------------  Redux State --------------------

  const agentData = useSelector((state: RootState) => state.agent.docData);

  // -------------------- State Management --------------------
  const [formData, setFormData] = useState<Partial<UIProperty>>(
    initialData || {
      cpId: agentData.cpId,
      agentName: agentData.agentName,
      agentPhoneNumber: agentData.agentPhoneNumber,
      kamName: agentData.kamName,
      kamId: agentData.kam,
      kamStatus: "pending",
      dataStatus: "pending",
      stage: "kam",
      status: "pending",
    }
  );
  const [selectedPlace, setSelectedPlace] = useState<Places>();
  const [docsToUpload, setDocsToUpload] = useState<DocsToUpload>({
    photo: [],
    video: [],
    document: [],
  });
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [maxStepIndex, setMaxStepIndex] = useState<number>(-1);
  const [isFormEmpty, setIsFormEmpty] = useState<boolean>(
    Object.keys(initialData || {}).length === 0
  );
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showDraftModal, setShowDraftModal] = useState<boolean>(false)


  // -------------------- Utility Functions --------------------

  /**
   * Check if a field should be visible based on its dependencies.
   */

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
  const isFieldVisible = (field: FormField): boolean => {
    if (!field.dependsOn) return true;

    // Case 1: Simple dependency
    if ("field" in field.dependsOn) {
      const fieldValue = getFieldValue(formData, field.dependsOn.field);
      const values = field.dependsOn.values;

      if (Array.isArray(values)) {
        return values.includes(fieldValue);
      }
      return false; // default: hide field if values missing
    }

    // Case 2: Multiple dependencies with AND
    if (
      "conditions" in field.dependsOn &&
      field.dependsOn.logicOperator === "AND"
    ) {
      return field.dependsOn.conditions.every((condition) => {
        const fieldValue = getFieldValue(formData, condition.field);
        const values = condition.values;

        if (Array.isArray(values)) {
          return values.includes(fieldValue);
        }
        return false;
      });
    }

    return false;
  };

  /**
   * Validate a single field.
   */
  const validateField = (field: FormField, value: any): string | null => {
    if (field.required) {
      const isEmpty =
        value === "" ||
        value === undefined ||
        value === null ||
        (Array.isArray(value) && value.length === 0);
      if (isEmpty) return `${field.label} is required`;
    }

    if (field.validation) {
      const { min, max, pattern, message } = field.validation;
      if (min !== undefined && Number(value) < min) {
        return message || `${field.label} must be at least ${min}`;
      }
      if (max !== undefined && Number(value) > max) {
        return message || `${field.label} must be at most ${max}`;
      }
      if (pattern && !pattern.test(String(value))) {
        return message || `${field.label} format is invalid`;
      }
    }

    return null;
  };

  /**
   * Filters visible fields based on conditional logic.
   */
  const getVisibleFields = (fields: FormField[]): FormFieldWithMeta[] =>
    fields.filter((field) => isFieldVisible(field)) as FormFieldWithMeta[];

  /**
   * Get the value of a nested field in an object based on dot notation.
   */
  const getFieldValue = (data: Record<string, any>, fieldPath: string): any => {
    return fieldPath.split(".").reduce((obj, key) => obj?.[key], data);
  };

  /**
   * Filter steps based on conditions defined in the form configuration.
   */
  const getVisibleSteps = () => {
    return inventoryFormConfig.steps.filter((step) => {
      if (!step.dependsOn) return true;

      const fieldValue = getFieldValue(formData, step.dependsOn.field);
      const values = step.dependsOn.values;

      if (Array.isArray(values)) {
        return values.includes(fieldValue);
      }
      return false;
    });
  };

  /**
   * Update the format data from Places API
   */
  useEffect(() => {
    if (selectedPlace) {
      const mm = getMicromarketFromCoordinates(selectedPlace);

      if (mm === null) return;

      setFormData((prevProperty) => ({
        ...prevProperty,
        propertyName: selectedPlace.name,
        address: selectedPlace.address,
        mapLocation: selectedPlace.mapLocation,
        micromarket: mm[0],
        zone: mm[1],
        _geoloc: {
          lat: selectedPlace.lat,
          lng: selectedPlace.lng,
        },
      }));
    } else {
      setFormData((prevProperty) => ({
        ...prevProperty,
        propertyName: undefined,
        address: undefined,
        mapLocation: undefined,
        micromarket: undefined,
        zone: undefined,
        _geoloc: {
          lat: undefined,
          lng: undefined,
        },
      }));
    }
  }, [selectedPlace]);
  /**
   * Validate all fields in the current step.
   */
  const validateCurrentStep = (): boolean => {
    const step = visibleSteps[currentStepIndex];
    if (!step) return false;

    const stepErrors: Record<string, string> = {};
    let isValid = true;

    getVisibleFields(step.fields).forEach((field) => {
      const value = getFieldValue(formData, field.id);
      const error = validateField(field, value);
      if (error) {

        stepErrors[field.id] = error;
        isValid = false;
      }
    });
    if (!isValid) { showErrorToast("Please fill all required fields.") }

    handleErrorsUpdate(stepErrors);
    return isValid;
  };

  // -------------------- Event Handlers --------------------

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    const visibleSteps = getVisibleSteps();
    if (currentStepIndex < visibleSteps.length - 1) {
      if (currentStepIndex > maxStepIndex) {
        setMaxStepIndex(currentStepIndex);
      }
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setShowPreview(true);
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStepIndex((prev) => prev - 1);
  };

  const handleFormUpdate = (updatedData: Partial<UIProperty>) => {
    setFormData(updatedData);
    setIsFormEmpty(false);
  };

  const handleErrorsUpdate = (updatedErrors: Record<string, string>) => {
    setErrors(updatedErrors);
  };

  const handleClear = () => {
    if (!isFormEmpty) {
      Alert.alert(
        "Clear Form",
        "Are you sure you want to clear all form data?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear",
            onPress: () => {
              setFormData({});
              setIsFormEmpty(true);
              setCurrentStepIndex(0);
              setErrors({});
            },
            style: "destructive",
          },
        ]
      );
    }
  };

  const handleStepChange = (index: number) => {
    setErrors({});
    if (currentStepIndex <= maxStepIndex) {
      if (!validateCurrentStep()) return;
    }
    const visibleSteps = getVisibleSteps();
    if (index <= maxStepIndex || index < visibleSteps.length) {
      setCurrentStepIndex(index);
    }
  };

  const handleFormCancel = () => {

    if (formData.propertyType || formData.assetType && formData.propertyName)
      setShowDraftModal(true);
    else router.back();

  };

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true)
      console.log("Raw draft data:", formData);

      const normalizedData = normalizePropertyBeforeSubmit(formData);

      const cleanData = JSON.parse(
        JSON.stringify(normalizedData, (key, value) =>
          value === undefined ? null : value
        )
      );

      if (cleanData.propertyId) {
        await updateProperty(cleanData.propertyId, {
          ...cleanData,
          status: "draft",
        });
        showSuccessToast(`Draft updated successfully!`);
      } else {
        const newProperty = await createProperty({
          ...(cleanData as Omit<Property, "propertyId">),
          status: "draft",
        });
        showSuccessToast(`Draft saved successfully!\nID: ${newProperty.propertyId}`);
      }
    } catch (error: any) {
      console.error("Error saving draft:", error);
      showSuccessToast(`Something went wrong while saving the draft.`);
    }
    finally { setIsSavingDraft(true) }
  };
  // -------------------- Effects --------------------




  // -------------------- Derived Values --------------------
  const visibleSteps = getVisibleSteps();

  if (showPreview) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F6F7]">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Preview */}
        <View className="flex-1">
          <FormPreview config={inventoryFormConfig} data={formData} previewType={isEdit ? "edit" : "add"} />
        </View>

        {/* Back & Submit buttons */}

        <View className="flex-row items-center justify-between gap-[13px] px-4 py-[14px] bg-white border-t border-t-[#EEEEEE]">
        <View className="flex-row items-center justify-between gap-[13px] px-4 py-[14px] bg-white border-t border-t-[#EEEEEE]">
          <TouchableOpacity
            className="flex-1 py-2 px-5 rounded-[4px] bg-white border border-[#153E3B]"
            onPress={() => {
              setShowPreview(false);
              setCurrentStepIndex(0);
            }}
          >
            <Text className="text-center text-base font-semibold text-black">
              Back
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-2 px-5 rounded-[4px] bg-[#153E3B] border border-[#153E3B]"
            onPress={() => onComplete(formData)}
          >
            <Text className="text-center text-base font-semibold text-white">
              {isEdit ? "Update" : "Submit"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------- Render --------------------
  return (
    <SafeAreaView className="flex-1 bg-[#F5F6F7]">
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Header */}
      <View className="w-full py-2 px-4 bg-[#FAFAFA] border-b border-[#E3E3E3]">
        <View className="flex-row items-center justify-between">
          {/* Back Button & Title */}
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={handleFormCancel}>
              <ArrowLeftIcon height={16} width={16} />
            </TouchableOpacity>
            <Text className="font-montserrat text-base font-bold text-[#2B3034B2]">
              {isEdit ? "Edit Property" : "Add Property"}
            </Text>
          </View>

          {/* Clear Button */}
          <TouchableOpacity
            className="flex-row items-center px-2 py-1"
            onPress={handleClear}
          >
            <Text
              className={`font-montserrat text-base font-bold underline ${isFormEmpty ? "text-[#9E9E9E]" : "text-[#D92D20]"
                }`}
            >
              Clear
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 flex-col gap-0 pt-3">
        {/* Step Navigation */}
        <View className="pb-[17px] bg-white">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="bg-white px-3 gap-[10px] pb-1"
          >
            {visibleSteps.map((step, index) => {
              const isActive = currentStepIndex === index;
              const isCompleted = index < currentStepIndex;

              return (
                <TouchableOpacity
                  key={step.id}
                  onPress={() => handleStepChange(index)}
                  style={{
                    borderRadius: 10,
                    height: 37,
                    justifyContent: "center",
                  }}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={["#10302D", "#32968D"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        borderRadius: 10,
                        padding: 1.5,
                        height: "100%", // ✅ Full height
                      }}
                    >
                      <View
                        style={{
                          borderRadius: 8,

                          backgroundColor: "#FFFFFF",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          paddingHorizontal: 12,
                          paddingVertical: 6.5,
                          height: "100%", // ✅ Match parent height
                          gap: 8,
                        }}
                      >
                        {getStepIcon(currentStepIndex + 1, "gradient")}
                        <Text
                          style={{
                            fontFamily: "Montserrat_500Medium",
                            fontSize: 14,
                            color: "#153E3B",
                            fontWeight: "700",
                          }}
                        >
                          {step.title}
                        </Text>
                      </View>
                    </LinearGradient>
                  ) : isCompleted ? (
                    <LinearGradient
                      colors={["#10302D", "#32968D"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        borderRadius: 10,
                        height: "100%", // ✅ Match height
                        paddingHorizontal: 12,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {getStepIcon(index + 1, "default")}
                    </LinearGradient>
                  ) : (
                    <View
                      style={{
                        borderRadius: 10,
                        borderColor: "#B5B3B3",
                        borderWidth: 1,
                        height: "100%",
                        paddingHorizontal: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      {getStepIcon(index + 1, "gray")}

                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

        </View>

        {/* Form Renderer */}
        <View className="flex-1">
          <FormRenderer
            config={inventoryFormConfig}
            formData={formData}
            errors={errors}
            currentStep={currentStepIndex}
            isEdit={isEdit}
            visibleSteps={visibleSteps}
            onFormUpdate={handleFormUpdate}
            onErrorsUpdate={handleErrorsUpdate}
            getFieldValue={getFieldValue}
            getVisibleFields={getVisibleFields}
            selectedPlace={selectedPlace}
            setSelectedPlace={setSelectedPlace}
            docsToUpload={docsToUpload}
            setDocsToUpload={setDocsToUpload}
          />
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row items-center justify-between gap-[13px] px-4 py-[14.5px] bg-red border-t border-t-[#EEEEEE]">
          {currentStepIndex && (
            <TouchableOpacity
              className="flex-1 w-1/2 py-2 px-5 rounded-[4px] bg-white border border-[#153E3B]"
              onPress={handleBack}
            >
              <Text className="text-center text-base font-semibold text-black">
                {"Back"}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="flex-1 w-1/2 py-2 px-5 rounded-[4px] bg-[#153E3B] border border-[#153E3B]"
            onPress={handleNext}
          >
            <Text className="text-center text-base font-semibold text-white leading-normal">
              {currentStepIndex === visibleSteps.length - 1
                ? isEdit
                  ? "Update"
                  : "Submit"
                : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <SaveAsDraft
        visible={showDraftModal}
        onClose={() => setShowDraftModal(false)}
        handleSaveDraft={handleSaveDraft}
        isSaving={isSavingDraft}
      />
    </SafeAreaView>
  );
};

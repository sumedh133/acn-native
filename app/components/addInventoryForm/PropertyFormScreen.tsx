import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { FormRenderer } from "./FormRenderer";
import { inventoryFormConfig } from "@/app/config/AddInventoryFormConfig/inventoryFormConfig";
import { Places, Property } from "@/app/types";
import ArrowLeftIcon from "@/assets/icons/svg/Common/ArrowLeftIcon";
import { LinearGradient } from "expo-linear-gradient";
import { FormPreview } from "../Listing/listingPropertyDetails";
import { getMicromarketFromCoordinates } from "@/app/helpers/getMicromarketFromCoordinates";
import { FormField } from "@/types/FormConfig";

// Extend FormField to include our internal properties
interface FormFieldWithMeta extends FormField {
  _actualColspan?: number;
}

type UIProperty = Omit<Property, "handOverDate"> & {
  handOverDate?: string;
  media?: {
    photos: string[];
    videos: string[];
    documents: string[];
  };
};

interface PropertyFormScreenProps {
  initialData?: Partial<UIProperty>;
  onComplete: (data: Partial<UIProperty>) => void;
  onCancel: () => void;
  isEdit?: boolean;
  agentData?: any; // Add agent data for upload metadata
}

export const PropertyFormScreen: React.FC<PropertyFormScreenProps> = ({
  initialData,
  onComplete,
  onCancel,
  isEdit = false,
  agentData,
}) => {
  // -------------------- State Management --------------------
  const [formData, setFormData] = useState<Partial<UIProperty>>(() => {
    // Initialize with proper media structure
    const defaultMedia = {
      photos: [],
      videos: [],
      documents: [],
    };
    
    return {
      ...initialData,
      media: initialData?.media || defaultMedia,
    };
  });
  
  const [selectedPlace, setSelectedPlace] = useState<Places>();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [maxStepIndex, setMaxStepIndex] = useState<number>(-1);
  const [isFormEmpty, setIsFormEmpty] = useState<boolean>(
    Object.keys(initialData || {}).length === 0
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState<boolean>(false);

  console.log("Form Data:", formData);

  // -------------------- Media Upload Handler --------------------
  const handleMediaUpdate = (media: { photos: string[], videos: string[], documents: string[] }) => {
    setFormData(prevData => ({
      ...prevData,
      media,
    }));
    setIsFormEmpty(false);
  };

  // -------------------- Utility Functions --------------------

  /**
   * Check if a field should be visible based on its dependencies.
   */
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

    handleErrorsUpdate(stepErrors);
    return isValid;
  };

  // -------------------- Event Handlers --------------------

  const handleNext = () => {
    // if (!validateCurrentStep()) {
    //   return;
    // }

    const visibleSteps = getVisibleSteps();
    if (currentStepIndex < visibleSteps.length - 1) {
      if (currentStepIndex > maxStepIndex) { setMaxStepIndex(currentStepIndex) }
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setShowPreview(true);
    }
  };

  const handleBack = () => {
    setErrors({});
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    } else {
      onCancel();
    }
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
              setFormData({
                media: {
                  photos: [],
                  videos: [],
                  documents: [],
                },
              });
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
    // if (currentStepIndex <= maxStepIndex) { if (!validateCurrentStep()) return }
    const visibleSteps = getVisibleSteps();
    if (index <= maxStepIndex || index < visibleSteps.length) {
      setCurrentStepIndex(index);
    }
  };

  // Generate unique prop ID for uploads
  const propId = formData.propertyId || `temp-${Date.now()}`;

  // -------------------- Derived Values --------------------
  const visibleSteps = getVisibleSteps();

  if (showPreview) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F6F7]">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Preview */}
        <View className="flex-1">
          <FormPreview 
            config={inventoryFormConfig} 
            data={formData}
            onMediaUpdate={handleMediaUpdate}
            agentData={agentData}
            propId={propId}
          />
        </View>

        {/* Back & Submit buttons */}

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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View className="w-full py-4 px-3 bg-white border-b border-b-[#EEEEEE]">
        <View className="flex-row items-center justify-between">
          {/* Back Button & Title */}
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={onCancel}>
              <ArrowLeftIcon />
            </TouchableOpacity>
            <Text className="font-montserrat text-base font-bold text-[#BABABA]">
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

      <View className="flex-1 flex-col">
        {/* Step Navigation */}
        <View className="pt-3 pb-4 bg-white">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="bg-white px-3 gap-4"
          >
            {visibleSteps.map((step, index) => (
              <TouchableOpacity
                key={step.id}
                onPress={() => handleStepChange(index)}
                style={{ borderRadius: 10 }}
              >
                {currentStepIndex === index ? (
                  <LinearGradient
                    colors={["#10302D", "#32968D"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 10,
                      padding: 2,
                    }}
                  >
                    <View
                      style={{
                        borderRadius: 8,
                        backgroundColor: "#FFFFFF",
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                      }}
                    >
                      <Text className="font-['Montserrat_500Medium'] text-sm text-[#153E3B] font-semibold">
                        {step.title}
                      </Text>
                    </View>
                  </LinearGradient>
                ) : index < currentStepIndex ? (
                  <LinearGradient
                    colors={["#10302D", "#32968D"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 10,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                    }}
                  >
                    <Text className="font-['Montserrat_500Medium'] text-sm text-white font-semibold">
                      {step.title}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View
                    style={{
                      borderRadius: 10,
                      backgroundColor: "#F5F6F7",
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                    }}
                  >
                    <Text className="font-['Montserrat_500Medium'] text-sm text-[#153E3B] font-semibold">
                      {step.title}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
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
            // Pass media upload handler
            onMediaUpdate={handleMediaUpdate}
            agentData={agentData}
            propId={propId}
          />
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row items-center justify-between gap-[13px] px-4 py-[14px] bg-white border-t border-t-[#EEEEEE]">
          {currentStepIndex && (
            <TouchableOpacity
              className="flex-1 py-2 px-5 rounded-[4px] bg-white border border-[#153E3B]"
              onPress={handleBack}
            >
              <Text className="text-center text-base font-semibold text-black">
                {"Back"}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="flex-1 py-2 px-5 rounded-[4px] bg-[#153E3B] border border-[#153E3B]"
            onPress={handleNext}
          >
            <Text className="text-center text-base font-semibold text-white">
              {currentStepIndex === visibleSteps.length - 1
                ? isEdit
                  ? "Update"
                  : "Submit"
                : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
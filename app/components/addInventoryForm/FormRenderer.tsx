import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { FormConfig, FormField, FormStep } from "@/types/FormConfig";
import { Property } from "@/app/types";

interface FormRendererProps {
  config: FormConfig;
  formData: Partial<Property>;
  errors: Record<string, string>;
  currentStep: number;
  isEdit: boolean;
  visibleSteps: FormStep[];
  onFormUpdate: (data: Partial<Property>) => void;
  onErrorsUpdate: (errors: Record<string, string>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  config,
  formData,
  errors,
  currentStep,
  visibleSteps,
  onFormUpdate,
  onErrorsUpdate,
  onNext,
  onBack
}) => {
  /**
   * Get nested field value by path (dot notation).
   */
  const getFieldValue = (data: Record<string, any>, path: string): any =>
    path.split(".").reduce((obj, key) => obj?.[key], data);

  /**
   * Set nested field value in formData.
   */
  const setFieldValue = (fieldPath: string, value: any) => {
    const keys = fieldPath.split(".");
    const newData = { ...formData };

    let current: any = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    resetDependentFields(fieldPath, newData);
    onFormUpdate(newData);
  };

  /**
   * Reset dependent fields when their parent changes.
   */
  const resetDependentFields = (changedFieldId: string, data: any) => {
    config.steps.forEach((step) => {
      step.fields.forEach((field) => {
        if (field.dependsOn?.field === changedFieldId) {
          clearFieldValue(field.id, data);
          resetDependentFields(field.id, data);
        }
      });
    });
  };

  /**
   * Clears a field value based on its dot path.
   */
  const clearFieldValue = (fieldPath: string, data: any) => {
    const keys = fieldPath.split(".");
    let current = data;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = undefined;
  };

  /**
   * Filters visible fields based on conditional logic.
   */
  const getVisibleFields = (fields: FormField[]): FormField[] =>
    fields.filter((field) => {
      if (!field.dependsOn) return true;
      const fieldValue = getFieldValue(formData, field.dependsOn.field);
      return field.dependsOn.values.includes(fieldValue);
    });

  /**
   * Validate a single field.
   */
  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (value === "" || value === undefined || value === null)) {
      return `${field.label} is required`;
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
   * Validate all fields in the current step.
   */
  const validateCurrentStep = (): boolean => {
    const step = visibleSteps[currentStep];
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

    onErrorsUpdate(stepErrors);
    return isValid;
  };

  /**
   * Handles "Next" button click.
   */
  const handleNext = () => {
    if (validateCurrentStep()) onNext();
  };

  /**
   * Render a field based on its type.
   */
  const renderField = (field: FormField) => {
    const value = getFieldValue(formData, field.id);
    const error = errors[field.id];

    const commonLabel = (
      <Text className="text-base font-semibold text-[#333] mb-2">
        {field.label}
        {field.required && <Text className="text-[#d32f2f]">*</Text>}
      </Text>
    );

    switch (field.type) {
      case "text":
      case "number":
        return (
          <View key={field.id} className="mb-5">
            {commonLabel}
            <TextInput
              className={`border rounded-lg p-3 text-base bg-white ${error ? "border-[#d32f2f]" : "border-[#ddd]"
                }`}
              value={value?.toString() || ""}
              onChangeText={(text) =>
                setFieldValue(field.id, field.type === "number" ? Number(text) : text)
              }
              placeholder={field.placeholder}
              keyboardType={field.type === "number" ? "numeric" : "default"}
            />
            {error && <Text className="text-[#d32f2f] text-sm mt-1">{error}</Text>}
          </View>
        );

      case "textarea":
        return (
          <View key={field.id} className="mb-5">
            {commonLabel}
            <TextInput
              className={`border rounded-lg p-3 text-base bg-white min-h-[100px] ${error ? "border-[#d32f2f]" : "border-[#ddd]"
                }`}
              style={{ textAlignVertical: "top" }}
              value={value?.toString() || ""}
              onChangeText={(text) => setFieldValue(field.id, text)}
              placeholder={field.placeholder}
              multiline
              numberOfLines={4}
            />
            {error && <Text className="text-[#d32f2f] text-sm mt-1">{error}</Text>}
          </View>
        );

      case "select":
        return (
          <View key={field.id} className="mb-5">
            {commonLabel}
            <View className="flex-row flex-wrap gap-2">
              {field.options?.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`px-4 py-2.5 border rounded-full ${value === option.value
                      ? "bg-[#2e7d32] border-[#2e7d32]"
                      : "bg-white border-[#ddd]"
                    }`}
                  onPress={() => setFieldValue(field.id, option.value)}
                >
                  <Text
                    className={`text-sm ${value === option.value ? "text-white" : "text-[#333]"
                      }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {error && <Text className="text-[#d32f2f] text-sm mt-1">{error}</Text>}
          </View>
        );

      case "multiselect":
        const multiValue = value || [];
        return (
          <View key={field.id} className="mb-5">
            {commonLabel}
            <View className="flex-row flex-wrap gap-2">
              {field.options?.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`px-4 py-2.5 border rounded-full ${multiValue.includes(option.value)
                      ? "bg-[#2e7d32] border-[#2e7d32]"
                      : "bg-white border-[#ddd]"
                    }`}
                  onPress={() => {
                    const newValue = multiValue.includes(option.value)
                      ? multiValue.filter((v: any) => v !== option.value)
                      : [...multiValue, option.value];
                    setFieldValue(field.id, newValue);
                  }}
                >
                  <Text
                    className={`text-sm ${multiValue.includes(option.value) ? "text-white" : "text-[#333]"
                      }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {error && <Text className="text-[#d32f2f] text-sm mt-1">{error}</Text>}
          </View>
        );

      case "boolean":
        return (
          <View key={field.id} className="mb-5 flex-row justify-between items-center">
            <Text className="text-base font-semibold text-[#333]">
              {field.label}
              {field.required && <Text className="text-[#d32f2f]">*</Text>}
            </Text>
            <Switch
              value={value || false}
              onValueChange={(newValue) => setFieldValue(field.id, newValue)}
            />
            {error && <Text className="text-[#d32f2f] text-sm mt-1">{error}</Text>}
          </View>
        );

      default:
        return null;
    }
  };

  // -------------------- Render --------------------
  if (!visibleSteps[currentStep]) return null;

  const currentStepConfig = visibleSteps[currentStep];
  const visibleFields = getVisibleFields(currentStepConfig.fields);
  const progress = ((currentStep + 1) / visibleSteps.length) * 100;

  return (
    <View className="flex-1">
      {/* Progress Bar */}
      <View className="h-1 bg-[#e0e0e0] mx-5 mt-5 rounded-sm">
        <View
          className="h-full bg-[#2e7d32] rounded-sm"
          style={{ width: `${progress}%` }}
        />
      </View>
      <Text className="text-center mt-2 text-sm font-semibold text-[#666]">
        {Math.round(progress)}%
      </Text>

      {/* Header */}
      <View className="px-5 pt-5 pb-2.5">
        <Text className="text-2xl font-bold text-[#333] mb-2">
          {currentStepConfig.title}
        </Text>
        {currentStepConfig.description && (
          <Text className="text-base text-[#666] leading-6">
            {currentStepConfig.description}
          </Text>
        )}
      </View>

      {/* Fields */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {visibleFields.map(renderField)}
      </ScrollView>

    </View>
  );
};

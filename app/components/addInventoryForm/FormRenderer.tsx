import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
} from "react-native";
import { FormConfig, FormField } from "../../types/FormConfig";
import { Property } from "@/app/types";
import { FormPreview } from "./listingPropertyDetails";

interface FormRendererProps {
  config: FormConfig;
  initialData?: Partial<Property>;
  onComplete: (data: Partial<Property>) => void;
  onCancel: () => void;
  isEdit?: boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  config,
  initialData = {},
  onComplete,
  onCancel,
  isEdit = false,
  currentStep,
  setCurrentStep,
}) => {
  //const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Property>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const getFieldValue = (data: any, fieldPath: string) => {
    return fieldPath.split(".").reduce((obj, key) => obj?.[key], data);
  };

  const visibleSteps = config.steps.filter((step) => {
    if (!step.dependsOn) return true;
    const fieldValue = getFieldValue(formData, step.dependsOn.field);
    return step.dependsOn.values.includes(fieldValue);
  });

  const currentStepConfig = visibleSteps[currentStep];

  const setFieldValue = (fieldPath: string, value: any) => {
    const keys = fieldPath.split(".");
    const newData = { ...formData };

    // set new value
    let current:any = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    // reset dependents if parent changes
    resetDependentFields(fieldPath, newData);

    setFormData(newData);
  };

  // recursively reset dependents
  const resetDependentFields = (changedFieldId: string, data: any) => {
    config.steps.forEach((step) => {
      step.fields.forEach((field) => {
        if (field.dependsOn?.field === changedFieldId) {
          // clear value
          const keys = field.id.split(".");
          let current = data;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = undefined;

          // recursively reset children of this field
          resetDependentFields(field.id, data);
        }
      });
    });
  };

  const validateField = (field: FormField, value: any): string | null => {
    if (
      field.required &&
      (!value || value === "" || value === null || value === undefined)
    ) {
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

  const validateCurrentStep = (): boolean => {
    const stepErrors: Record<string, string> = {};
    let isValid = true;

    const visibleFields = getVisibleFields(currentStepConfig.fields);

    visibleFields.forEach((field) => {
      const value = getFieldValue(formData, field.id);
      const error = validateField(field, value);
      if (error) {
        stepErrors[field.id] = error;
        isValid = false;
      }
    });

    setErrors(stepErrors);
    return isValid;
  };

  const getVisibleFields = (fields: FormField[]): FormField[] => {
    return fields.filter((field) => {
      if (!field.dependsOn) return true;
      const fieldValue = getFieldValue(formData, field.dependsOn.field);
      return field.dependsOn.values.includes(fieldValue);
    });
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < visibleSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete(formData);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };

  const renderField = (field: FormField) => {
    const value = getFieldValue(formData, field.id);
    const error = errors[field.id];

    switch (field.type) {
      case "text":
      case "number":
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
              style={[styles.textInput, error && styles.errorInput]}
              value={value?.toString() || ""}
              onChangeText={(text) =>
                setFieldValue(
                  field.id,
                  field.type === "number" ? Number(text) : text
                )
              }
              placeholder={field.placeholder}
              keyboardType={field.type === "number" ? "numeric" : "default"}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case "textarea":
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
              style={[styles.textArea, error && styles.errorInput]}
              value={value?.toString() || ""}
              onChangeText={(text) => setFieldValue(field.id, text)}
              placeholder={field.placeholder}
              multiline
              numberOfLines={4}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case "select":
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}>*</Text>}
            </Text>
            <View style={styles.selectContainer}>
              {field.options?.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.selectOption,
                    value === option.value && styles.selectedOption,
                  ]}
                  onPress={() => setFieldValue(field.id, option.value)}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      value === option.value && styles.selectedOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case "multiselect":
        const multiValue = value || [];
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}>*</Text>}
            </Text>
            <View style={styles.selectContainer}>
              {field.options?.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.selectOption,
                    multiValue.includes(option.value) && styles.selectedOption,
                  ]}
                  onPress={() => {
                    const newValue = multiValue.includes(option.value)
                      ? multiValue.filter((v: any) => v !== option.value)
                      : [...multiValue, option.value];
                    setFieldValue(field.id, newValue);
                  }}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      multiValue.includes(option.value) &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case "boolean":
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <View style={styles.switchContainer}>
              <Text style={styles.fieldLabel}>
                {field.label}
                {field.required && <Text style={styles.required}>*</Text>}
              </Text>
              <Switch
                value={value || false}
                onValueChange={(newValue) => setFieldValue(field.id, newValue)}
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      default:
        return null;
    }
  };

  if (!currentStepConfig) return null;

  const visibleFields = getVisibleFields(currentStepConfig.fields);
  const progress = ((currentStep + 1) / visibleSteps.length) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{Math.round(progress)}%</Text>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.stepTitle}>{currentStepConfig.title}</Text>
        {currentStepConfig.description && (
          <Text style={styles.stepDescription}>
            {currentStepConfig.description}
          </Text>
        )}
      </View>

      {/* Form Fields */}
      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        {visibleFields.map(renderField)}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>
            {currentStep === 0 ? "Cancel" : "Back"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === visibleSteps.length - 1
              ? isEdit
                ? "Update"
                : "Submit"
              : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 2,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2e7d32",
    borderRadius: 2,
  },
  progressText: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#d32f2f",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 100,
    textAlignVertical: "top",
  },
  errorInput: {
    borderColor: "#d32f2f",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    marginTop: 4,
  },
  selectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  selectedOption: {
    backgroundColor: "#2e7d32",
    borderColor: "#2e7d32",
  },
  selectOptionText: {
    fontSize: 14,
    color: "#333",
  },
  selectedOptionText: {
    color: "#fff",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  backButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#2e7d32",
  },
  nextButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

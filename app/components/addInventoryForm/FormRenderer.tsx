import React from "react";
import { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  DimensionValue,
} from "react-native";
import { showErrorToast } from "@/utils/toastUtils";
import { FormConfig, FormStep } from "@/types/FormConfig";
import { DocsToUpload, Places, Property } from "@/app/types";
import MonthYearPicker from "../Listing/MonthYearPicker";
import Checkbox from "../Listing/CheckBox";
import { FormField } from "@/types/FormConfig";
import TotalAskPrice from "../Listing/TotalAskPrice";
import TextInputField from "../Listing/TextInput";
import MultiCheckbox from "../MultiCheckbox";
import DropdownSelect from "../Listing/Dropdown";
import PlacesSearch from "../Listing/PlacesSearch";
import Document from "../Listing/document/Document";
import PlusIcon from "../../../assets/icons/svg/AddInventory/FormIcons/plus_icon.svg";
import CorrectIcon from "../../../assets/icons/svg/AddInventory/FormIcons/correct_icon.svg";
import PhotoVideoPicker from "../Listing/PhotoVideoPicker";

type UIProperty = Omit<Property, "handOverDate"> & {
  handOverDate?: string;
};

// Extend FormField to include our internal properties
interface FormFieldWithMeta extends FormField {
  _actualColspan?: number;
}

interface FormRendererProps {
  config: FormConfig;
  formData: Partial<UIProperty>;
  errors: Record<string, string>;
  currentStep: number;
  isEdit: boolean;
  visibleSteps: FormStep[];
  onFormUpdate: (data: Partial<UIProperty>) => void;
  onErrorsUpdate: (errors: Record<string, string>) => void;
  getFieldValue: (data: Record<string, any>, fieldPath: string) => any;
  getVisibleFields: (fields: FormField[]) => FormField[];

  selectedPlace?: Places;
  setSelectedPlace: (place?: Places) => void;
  onMediaUpdate: (media?: any) => void;
  agentData?: any;
  propId?: any;
  docsToUpload: DocsToUpload;
  setDocsToUpload: (docsToUpload: DocsToUpload) => void;
}

// Total number of columns in our grid system
const TOTAL_COLS = 12;

export const FormRenderer: React.FC<FormRendererProps> = ({
  config,
  formData,
  errors,
  isEdit,
  currentStep,
  visibleSteps,
  onFormUpdate,
  getFieldValue,
  getVisibleFields,
  selectedPlace,
  setSelectedPlace,
  docsToUpload,
  setDocsToUpload,
}) => {
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

    // store timestamp directly for handoverDate
    current[keys[keys.length - 1]] = value;

    resetDependentFields(fieldPath, newData);
    onFormUpdate(newData);
  };

  /**
   * Check if a field depends on the changed field.
   */
  const isDependentField = (
    field: FormField,
    changedFieldId: string
  ): boolean => {
    if (!field.dependsOn) return false;

    // Case 1: Simple dependency
    if ("field" in field.dependsOn) {
      return field.dependsOn.field === changedFieldId;
    }

    // Case 2: Multiple dependencies with AND
    if ("conditions" in field.dependsOn) {
      return field.dependsOn.conditions.some(
        (condition) => condition.field === changedFieldId
      );
    }

    return false;
  };

  /**
   * Reset dependent fields when their parent changes.
   */
  const resetDependentFields = (changedFieldId: string, data: any) => {
    config.steps.forEach((step) => {
      step.fields.forEach((field) => {
        if (isDependentField(field, changedFieldId)) {
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
      if (!current[keys[i]]) return; // Path doesn't exist, nothing to clear
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = undefined;
  };

  /**
   * Organize fields into rows based on colspan.
   * - Each row has a maximum total width of TOTAL_COLS.
   * - Single fields in a row take full width.
   */
  const organizeFieldsIntoRows = (
    fields: FormFieldWithMeta[]
  ): FormFieldWithMeta[][] => {
    const rows: FormFieldWithMeta[][] = [];
    let currentRow: FormFieldWithMeta[] = [];
    let currentWidth = 0;

    fields.forEach((field) => {
      const colspan =
        field.colspan && field.colspan > 0 && field.colspan <= TOTAL_COLS
          ? field.colspan
          : TOTAL_COLS;

      // If adding this field exceeds the limit, finalize current row
      if (currentWidth + colspan > TOTAL_COLS && currentRow.length) {
        if (currentRow.length === 1) {
          currentRow[0]._actualColspan = TOTAL_COLS;
        }
        rows.push(currentRow);
        currentRow = [];
        currentWidth = 0;
      }

      currentRow.push({ ...field, _actualColspan: colspan });
      currentWidth += colspan;

      // If row is perfectly filled, finalize it
      if (currentWidth === TOTAL_COLS) {
        rows.push(currentRow);
        currentRow = [];
        currentWidth = 0;
      }
    });

    // Handle remaining fields
    if (currentRow.length) {
      if (currentRow.length === 1) {
        currentRow[0]._actualColspan = TOTAL_COLS;
      }
      rows.push(currentRow);
    }

    return rows;
  };

  /**
   * Calculate field width percentage based on colspan
   */
  const getFieldWidth = (field: FormFieldWithMeta): DimensionValue => {
    const colspan = field._actualColspan || field.colspan || TOTAL_COLS;
    return `${(colspan / TOTAL_COLS) * 100}%`;
  };

  /**
   * Render a field based on its type.
   */
  const renderField = (field: FormFieldWithMeta) => {
    const value = getFieldValue(formData, field.id);
    const error = errors[field.id];
    const fieldWidth = getFieldWidth(field);


    const commonLabel = (
      <Text className="text-base font-semibold mb-3">
        {field.label}
        {field.required && <Text>*</Text>}
      </Text>
    );

    const errorMessage = error && (
      <Text className="text-[#d32f2f] text-sm mt-1">{error}</Text>
    );

    const fieldContent = () => {
      switch (field.type) {
        case "placesApi":
          return (
            <View>
              <PlacesSearch
                selectedPlace={selectedPlace}

                setSelectedPlace={setSelectedPlace}
                communityType={formData.communityType}
                disabled={isEdit}
              />
              {errorMessage}
            </View>
          );

        case "text":
        case "number": // backward compatibility
          return (
            <>
              {commonLabel}
              <TextInputField
                value={value}
                setValue={(val) => setFieldValue(field.id, val)}
                placeholder={field.placeholder}
                required={field.required}
                keyboardType={field.keyBoardType || "default"}
                {...(field.prefix ? { prefix: field.prefix } : {})}
                {...(field.suffix ? { suffix: field.suffix } : {})}
                {...(field.numberToStringFooter
                  ? { numberToStringFooter: field.numberToStringFooter }
                  : {})}
                {...(field.footer ? { footer: field.footer } : {})}
              />

              {errorMessage}
            </>
          );

        case "textarea":
          return (
            <>
              {commonLabel}
              <TextInput
                className={`border rounded-lg p-3 text-base bg-white min-h-[100px] ${
                  error ? "border-[#d32f2f]" : "border-[#ddd]"
                }`}
                style={{ textAlignVertical: "top" }}
                value={value?.toString() || ""}
                onChangeText={(text) => setFieldValue(field.id, text)}
                placeholder={field.placeholder}
                multiline
                numberOfLines={4}
              />
              {errorMessage}
            </>
          );
        case "showStepper":
          return (
            <>
              <View className="flex-row items-center justify-between w-[100%]">
                <View className="w-32">{commonLabel}</View>

                <TextInputField
                  value={value as number}
                  setValue={(val) => setFieldValue(field.id, val)}
                  title={""} // hide internal title
                  keyboardType="number-pad"
                  showStepper={true} // enables + / - buttons
                />

                {errorMessage}
              </View>
            </>
          );

        case "select":
          return (
            <>
              {commonLabel}
              <View className="flex-row flex-wrap gap-2">
                {field.options?.map((option) => {
                  const isSelected = value === option.value;
                  const isDisabled = currentStep === 0 && isEdit; // Disable condition
                  return (
                    <TouchableOpacity
                      key={option.value}
                      className={`px-3 py-2 border ${
                        currentStep ? "rounded-[8px]" : "rounded-[30px]"
                      } ${
                        isSelected
                          ? `bg-[#F0FFFE] border-[#153E3B]`
                          : `${
                              currentStep ? "bg-[#FAFAFA]" : "bg-white"
                            } border-[#BABABA]`
                      }`}
                      onPress={() => {
                        if (isDisabled) {
                          showErrorToast("You cannot edit these fields");
                          return;
                        }
                        if (isSelected) {
                          setFieldValue(field.id, null);
                        } else {
                          setFieldValue(field.id, option.value);
                        }
                      }}
                    >
                      <Text
                        className={`${currentStep ? "" : "px-[10px]"} text-sm font-medium ${isSelected
                          ? "text-[#153E3B] font-bold"
                          : "text-[#2B2928]"
                          } leading-normal`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errorMessage}
            </>
          );

        case "multiselect":
          const multiValue = value || [];
          return (
            <>
              {commonLabel}
              <View className="flex-row flex-wrap gap-2">
                {field.options?.map((option) => {
                  const isSelected = multiValue.includes(option.value);

                  // Same logic as single-select
                  const baseStyle = "px-[12px] py-[8px] border";
                  const borderRadius = currentStep
                    ? "rounded-[8px]"
                    : "rounded-[30px]";
                  const bgColor = isSelected
                    ? "bg-[#F0FFFE] border-[#153E3B]"
                    : currentStep
                    ? "bg-[#FAFAFA] border-[#BABABA]"
                    : "bg-white border-[#BABABA]";

                  return (
                    <TouchableOpacity
                      key={option.value}
                      className={`${baseStyle} ${borderRadius} ${bgColor}`}
                      onPress={() => {
                        const newValue = isSelected
                          ? multiValue.filter((v: any) => v !== option.value)
                          : [...multiValue, option.value];
                        setFieldValue(field.id, newValue);
                      }}
                    >
                      <View className="flex-row items-center gap-[5px]">
                        {isSelected ? <CorrectIcon /> : <PlusIcon />}
                        <Text
                          className={`${
                            currentStep ? "" : "px-[10px]"
                          } text-sm font-medium ${
                            isSelected
                              ? "text-[#153E3B] font-bold"
                              : "text-[#2B2928]"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errorMessage}
            </>
          );

        case "boolean":
          return (
            <View className="flex-row justify-between items-center">
              <Checkbox
                checked={value || false}
                setChecked={(newValue: boolean) =>
                  setFieldValue(field.id, newValue)
                }
                label={field.label}
                required={field.required}
              />
              {errorMessage}
            </View>
          );
        case "multiCheckbox":
          return (
            <>
              {commonLabel}
              <MultiCheckbox
                options={field.options || []}
                selectedOptions={value || []}
                setSelectedOptions={(selected: string[]) =>
                  setFieldValue(field.id, selected)
                }
              />
              {errorMessage}
            </>
          );

        case "dropdown":
          return (
            <>
              {commonLabel}
              <DropdownSelect
                value={value as string | null}
                setValue={(val: string | null) => setFieldValue(field.id, val)}
                options={[
                  { label: field.placeholder || "Please select", value: null },
                  ...(field.options ?? []),
                ]}
                placeholder={field.placeholder || "Select an option"}
                required={field.required}
              />
              {errorMessage}
            </>
          );

        case "dropdownWithInput":
          return (
            <>
              {commonLabel}
              <TotalAskPrice
                initialPrice={getFieldValue(formData, field.id)}
                onPriceChange={(fieldKey, value) =>
                  setFieldValue(fieldKey, value)
                }
                required={false}
              />
              {errorMessage}
            </>
          );
        case "date":
          return (
            <>
              {commonLabel}
              <MonthYearPicker
                value={value as string | undefined}
                setValue={(val: string) => setFieldValue(field.id, val)}
                placeholder={field.placeholder || "MM/YYYY"}
                required={field.required}
                minYear={1900}
                maxYear={2100}
                disabled={false}
              />
              {errorMessage}
            </>
          );
        case "dateRange":
          const startDate = getFieldValue(
            formData,
            field?.dateFields?.[0]?.value || ""
          );
          const endDate = getFieldValue(
            formData,
            field?.dateFields?.[1]?.value || ""
          );

          return (
            <>
              {commonLabel}
              <View className="flex-row items-center justify-between gap-1 w-full">
                {/* Start Date Picker */}
                <MonthYearPicker
                  value={startDate}
                  setValue={(val: string) => {
                    if (field?.dateFields?.[0]?.value) {
                      setFieldValue(field.dateFields[0].value, val);
                    }
                  }}
                  placeholder={
                    field.dateFields?.[0]?.label || "Start (MM/YYYY)"
                  }
                  required={field.required}
                  minYear={1900}
                  maxYear={2100}
                  disabled={false}
                  width={"48%"}
                />

                <Text className="mx-2">to</Text>

                {/* End Date Picker */}
                <MonthYearPicker
                  value={endDate}
                  setValue={(val: string) => {
                    if (field?.dateFields?.[1]?.value) {
                      const [startMonth, startYear] = startDate
                        ? startDate.split("/").map(Number)
                        : [null, null];
                      const [endMonth, endYear] = val.split("/").map(Number);

                      if (
                        startDate &&
                        (endYear < startYear ||
                          (endYear === startYear && endMonth < startMonth))
                      ) {
                        alert("End date cannot be earlier than start date");
                        return;
                      }

                      setFieldValue(field.dateFields[1].value, val);
                    }
                  }}
                  placeholder={field.dateFields?.[1]?.label || "End (MM/YYYY)"}
                  required={field.required}
                  minYear={1900}
                  maxYear={2100}
                  width={"48%"}
                  disabled={!startDate}
                />
              </View>

              {errorMessage}
            </>
          );

        case "documents":
          return (
            <>
              <Document
                docsToUpload={docsToUpload}
                setDocsToUpload={setDocsToUpload}
              />
            </>
          );
        case "photos/videos":
          return (
            <>
              <PhotoVideoPicker />
            </>
          );
        default:
          return null;
      }
    };

    return (
      <View key={field.id} style={{ width: fieldWidth }} className="mb-3 px-2">
        {fieldContent()}
      </View>
    );
  };
  // -------------------- Effect --------------------

  useEffect(() => {
    if (!visibleSteps[currentStep]) return;

    const currentStepConfig = visibleSteps[currentStep];
    const visibleFields = getVisibleFields(currentStepConfig.fields);

    visibleFields.forEach((field) => {
      if (field.type === "boolean") {
        const value = getFieldValue(formData, field.id);
        if (value === undefined) {
          setFieldValue(field.id, false);
        }
      }
    });
  }, [visibleSteps, currentStep]);




  // -------------------- Render --------------------
  if (!visibleSteps[currentStep]) return null;

  const currentStepConfig = visibleSteps[currentStep];
  const visibleFields = getVisibleFields(currentStepConfig.fields);
  const progress = ((currentStep + 1) / visibleSteps.length) * 100;

  // Organize fields into rows
  const fieldRows = organizeFieldsIntoRows(visibleFields);
  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-3 mb-3">
        {/* Progress Bar */}
        <View className="flex-1 h-1 bg-[#E3E3E3] rounded-sm overflow-hidden">
          <View
            className="h-full bg-[#153E3B] rounded-sm font-lato"
            style={{ width: `${progress}%` }}
          />
        </View>

        {/* Percentage Text */}
        <Text className="ml-2 text-xs font-bold text-[#153E3B] leading[21px]">
          {Math.round(progress)}%
        </Text>
      </View>

      {/* Fields */}
      <ScrollView className="flex px-3 " showsVerticalScrollIndicator={false}>
        {fieldRows.map((row, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            className="flex-row flex-wrap mx-[-2px]"
            style={{
              justifyContent: row.length > 1 ? "space-between" : "flex-start",
            }}
          >
            {row.map(renderField)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

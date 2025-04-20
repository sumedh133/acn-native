import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ARSecondaryButton from '../components/Button/ARSecondaryButton';
import ARPrimaryButton from '../components/Button/ARPrimaryButton';
import { FontAwesome } from '@expo/vector-icons';
import { Requirement } from '../types';
import submitRequirement from '../helpers/submitRequirement';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import CustomSelectDropdown from '../components/CustomSelectDropdown';
import { showErrorToast, showInfoToast, showSuccessToast } from '@/utils/toastUtils';
import Offline from '../components/Offline';

const UserRequirementForm = () => {
  const cpId = useSelector((state: RootState) => state?.agent?.docData?.cpId) || null;

  const [focusedFields, setFocusedFields] = useState<{ [key: string]: boolean }>({});
  const handleFocus = (fieldName: string) => {
    setFocusedFields((prev) => ({ ...prev, [fieldName]: true }));
  };
  const handleBlur = (fieldName: string) => {
    setFocusedFields((prev) => ({ ...prev, [fieldName]: false }));
  };

  const [propertyName, setPropertyName] = useState('');
  const [requirementDetails, setRequirementDetails] = useState('');
  const [assetType, setAssetType] = useState('');
  const [area, setArea] = useState<string>('');
  const [configuration, setConfiguration] = useState('');
  const [budgetFrom, setBudgetFrom] = useState<string>('');
  const [budgetTo, setBudgetTo] = useState<string>('');
  const [marketValue, setMarketValue] = useState(false);

  const [error, setError] = useState<{
    propertyName?: string;
    assetType?: string;
    configuration?: string;
    budget?: string;
  }>({});

  const isConnectedToInternet = useSelector((state: RootState) => state.app.isConnectedToInternet);

  const assetTypes = [
    { label: "Select Asset Type", value: "" },
    { label: "Apartment", value: "apartment" },
    { label: "Plot", value: "plot" },
    { label: "Villa", value: "villa" },
    { label: "Duplex", value: "duplex" },
    { label: "Penthouse", value: "penthouse" },
    { label: "Independent Building", value: "independent building" },
    { label: "Commercial Building", value: "commercial building" },
    { label: "Row House", value: "rowhouse" },
    { label: "Bungalow", value: "bungalow" },
    { label: "Villament", value: "villament" }
  ];

  const getConfigurations = () => {
    switch (assetType) {
      case "apartment":
        return [
          "1 BHK",
          "2 BHK",
          "2.5 BHK",
          "3 BHK",
          "3.5 BHK",
          "4 BHK",
          "5 BHK",
        ];
      case "plot":
        return [];
      case "villa":
      case "duplex":
      case "penthouse":
      case "rowhouse":
      case "bungalow":
      case "villament":
        return ["2BHK", "3BHK", "3.5BHK", "4BHK", "4.5BHK", "5BHK", "5+BHK"];
      case "commercial building":
        return ["Commercial Building"];
      case "independent building":
        return [
          "2BHK",
          "3BHK",
          "3.5BHK",
          "4BHK",
          "4.5BHK",
          "5BHK",
          "5+BHK",
          "Commercial Building",
        ];
      default:
        return [];
    }
  };

  const isConfigurationDisabled = assetType === "plot";

  const handleMarketValueCheckbox = () => {
    setMarketValue(!marketValue);
    if (!marketValue) {
      // If enabling market value, clear budget fields
      setBudgetFrom('');
      setBudgetTo('');
    }
  };

  const clearForm = () => {
    // Reset form fields
    setPropertyName('');
    setRequirementDetails('');
    setAssetType('');
    setArea('');
    setConfiguration('');
    setBudgetFrom('');
    setBudgetTo('');
    setMarketValue(false); // Reset to default value

    // Clear errors
    setError({});

    // Reset focus states
    setFocusedFields({});
    showInfoToast("Form cleared successfully!");
  };

  const isBudgetValidRange = () => {
    if (marketValue) {
      // If "As per Market Price" is checked, skip budget validation
      return true;
    }

    if (budgetTo === '') {
      return false; // Max budget (budgetTo) is required
    }

    if (budgetFrom === '') {
      return true; // Min budget (budgetFrom) can be skipped
    }

    return parseFloat(budgetTo) >= parseFloat(budgetFrom); // Validate range
  };

  const handleSubmit = async () => {
    const newErrors: any = {};

    if (!propertyName.trim()) {
      newErrors.propertyName = "Please enter property name or location";
    }

    if (!assetType.trim()) {
      newErrors.assetType = "Please select asset type";
    }

    if (assetType !== "plot" && !configuration.trim()) {
      newErrors.configuration = "Please select a configuration";
    }

    if (!marketValue && !isBudgetValidRange()) {
      newErrors.budget = "Please enter a valid maximum budget or select 'As per Market Price'.";
    }

    setError(newErrors);

    if (Object.keys(newErrors).length !== 0) {
      return;
    }

    setSaving(true);

    try {
      const userRequirement: Requirement = {
        propertyName,
        requirementDetails,
        assetType,
        area: area ? parseFloat(area) : undefined,
        configuration,
        budget: {
          from: budgetFrom ? parseFloat(budgetFrom) : undefined,
          to: budgetTo ? parseFloat(budgetTo) : undefined,
        },
        marketValue: marketValue === true ? "Market Value" : "",
      }

      await submitRequirement(userRequirement, cpId);
      clearForm();
      showSuccessToast("Requirement submitted successfully!");
    } catch (error) {
      showErrorToast("An error occurred while submitting the requirement. Please try again.");
      console.error("An error occurred:", error);
    } finally {
      setSaving(false);
    }
  };

  const [saving, setSaving] = useState(false);

  // Calculate if form is valid for submit button
  const isSubmitEnabled = propertyName.trim() !== '' &&
    assetType.trim() !== '' &&
    (marketValue || isBudgetValidRange());

  if (!isConnectedToInternet)
    return (<Offline />)

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>

        {/* Scrollable Content */}
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Project Name / Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Project Name / Location <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={propertyName}
              onChangeText={(text) => {
                setPropertyName(text);
                setError((prev) => ({ ...prev, propertyName: undefined }));
              }}
              onFocus={() => handleFocus('propertyName')}
              onBlur={() => handleBlur('propertyName')}
              placeholder="Type here"
              style={[
                styles.textInput,
                focusedFields['propertyName'] && styles.focusedInput
              ]}
            />
            {error.propertyName && (
              <Text style={styles.errorText}>{error.propertyName}</Text>
            )}
          </View>

          {/* Requirement Details */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Requirement Details</Text>
            <TextInput
              value={requirementDetails}
              onChangeText={setRequirementDetails}
              onFocus={() => handleFocus('requirementDetails')}
              onBlur={() => handleBlur('requirementDetails')}
              placeholder="Enter the details"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={[
                styles.textInput,
                styles.textArea,
                focusedFields['requirementDetails'] && styles.focusedInput
              ]}
            />
          </View>

          {/* Asset Container */}
          <View style={styles.containerBox}>
            {/* Asset Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Asset Type <Text style={styles.required}>*</Text>
              </Text>
              <View style={[

                focusedFields['assetType'] && styles.focusedInput
              ]}>
                {/* <Picker
                  selectedValue={assetType}
                  onValueChange={(itemValue) => {
                    setAssetType(itemValue);
                    setError((prev) => ({ ...prev, assetType: "" }));
                    // Reset configuration when asset type changes
                    setConfiguration('');
                  }}
                  onFocus={() => handleFocus('assetType')}
                  onBlur={() => handleBlur('assetType')}
                  style={styles.picker}
                >
                  {assetTypes.map((item, index) => (
                    <Picker.Item 
                      key={index} 
                      label={item.label} 
                      value={item.value} 
                      style={styles.pickerItem} 
                    />
                  ))}
                </Picker> */}
                <CustomSelectDropdown
                  selectedValue={assetType}
                  onValueChange={setAssetType}
                  options={assetTypes}
                  placeholder="Select an asset type"
                />
              </View>
              {error.assetType && (
                <Text style={styles.errorText}>{error.assetType}</Text>
              )}
            </View>

            {/* Configuration + Area Row */}
            <View style={styles.rowContainer} className='mb-[-24px]'>
              {/* Configuration */}
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>
                  Configuration <Text style={styles.required}>*</Text>
                </Text>
                <View style={[

                  focusedFields['configuration'] && styles.focusedInput,
                  isConfigurationDisabled && styles.disabledInput
                ]}>
                  {/* <Picker
                    selectedValue={configuration}
                    onValueChange={(itemValue) => {
                      setConfiguration(itemValue);
                      setError((prev) => ({ ...prev, configuration: "" }));
                    }}
                    onFocus={() => handleFocus('configuration')}
                    onBlur={() => handleBlur('configuration')}
                    enabled={!isConfigurationDisabled}
                    style={styles.picker}
                  >
                    <Picker.Item
                      label={isConfigurationDisabled ? "Not applicable" : "Select Configuration"}
                      value=""
                      style={styles.pickerItem}
                    />
                    {getConfigurations().map((config, index) => (

                      <Picker.Item
                        key={index}
                        label={config}
                        value={config}
                        style={styles.pickerItem}
                      />
                    ))}
                  </Picker> */}
                  <CustomSelectDropdown
                    selectedValue={configuration}
                    onValueChange={setConfiguration}
                    options={[
                      { label: "Select Configuration", value: "" },
                      ...getConfigurations().map((config) => ({
                        label: config,
                        value: config,
                      })),
                    ]}
                    placeholder="Select Configuration"
                  // disabled={isConfigurationDisabled}
                  />
                </View>
                {error.configuration && (
                  <Text style={styles.errorText}>{error.configuration}</Text>
                )}
              </View>

              {/* Area */}
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Area (Sqft)</Text>
                <TextInput
                  value={area}
                  onChangeText={(text) => {
                    // Allow only numbers and decimals
                    const numericValue = text.replace(/[^0-9.]/g, "");
                    // Handle multiple decimal points
                    const parts = numericValue.split(".");
                    if (parts.length > 2) {
                      setArea(`${parts[0]}.${parts[1]}`);
                    } else {
                      setArea(numericValue);
                    }
                  }}
                  onFocus={() => handleFocus('area')}
                  onBlur={() => handleBlur('area')}
                  placeholder="0000"
                  keyboardType="decimal-pad"
                  style={[
                    styles.textInput,
                    focusedFields['area'] && styles.focusedInput
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Budget Container */}
          <View style={styles.containerBox}>
            {/* Budget */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Budget (Cr) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.rowContainer}>
                {/* Budget From */}
                <TextInput
                  placeholder="From"
                  value={budgetFrom}
                  onChangeText={(text) => {
                    // Allow only numbers and decimals
                    const numericValue = text.replace(/[^0-9.]/g, "");
                    // Handle multiple decimal points
                    const parts = numericValue.split(".");
                    if (parts.length > 2) {
                      setBudgetFrom(`${parts[0]}.${parts[1]}`);
                    } else if (parts.length > 1) {
                      // Limit to 2 decimal places
                      parts[1] = parts[1].slice(0, 2);
                      setBudgetFrom(`${parts[0]}.${parts[1]}`);
                    } else {
                      setBudgetFrom(numericValue);
                    }
                    setError((prev) => ({ ...prev, budget: "" }));
                  }}
                  onFocus={() => handleFocus('budgetFrom')}
                  onBlur={() => handleBlur('budgetFrom')}
                  keyboardType="decimal-pad"
                  editable={!marketValue}
                  style={[
                    styles.textInput,
                    styles.budgetInput,
                    focusedFields['budgetFrom'] && styles.focusedInput,
                    marketValue && styles.disabledInput
                  ]}
                />

                <Text style={styles.toText}>To</Text>

                {/* Budget To */}
                <TextInput
                  placeholder="To"
                  value={budgetTo}
                  onChangeText={(text) => {
                    // Allow only numbers and decimals
                    const numericValue = text.replace(/[^0-9.]/g, "");
                    // Handle multiple decimal points
                    const parts = numericValue.split(".");
                    if (parts.length > 2) {
                      setBudgetTo(`${parts[0]}.${parts[1]}`);
                    } else if (parts.length > 1) {
                      // Limit to 2 decimal places
                      parts[1] = parts[1].slice(0, 2);
                      setBudgetTo(`${parts[0]}.${parts[1]}`);
                    } else {
                      setBudgetTo(numericValue);
                    }
                    setError((prev) => ({ ...prev, budget: "" }));
                  }}
                  onFocus={() => handleFocus('budgetTo')}
                  onBlur={() => handleBlur('budgetTo')}
                  keyboardType="decimal-pad"
                  editable={!marketValue}
                  style={[
                    styles.textInput,
                    styles.budgetInput,
                    focusedFields['budgetTo'] && styles.focusedInput,
                    marketValue && styles.disabledInput
                  ]}
                />
              </View>
              {error.budget && (
                <Text style={styles.errorText}>{error.budget}</Text>
              )}
            </View>

            {/* Market Value Checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={handleMarketValueCheckbox}
            >
              <View style={[styles.checkbox, marketValue && styles.checkedBox]}>
                {marketValue && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>As per Market Price</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom spacing */}
        </ScrollView>

        {/* Fixed Footer */}
        <View style={styles.footerButtons}>
          {/* Clear Button */}
          <ARSecondaryButton onPress={clearForm} style={styles.clearButton} >
            Clear
          </ARSecondaryButton>

          {/* Submit Button */}
          <ARPrimaryButton onPress={handleSubmit} style={styles.submitButton} disabled={saving}>
            {saving ? <ActivityIndicator size={'small'} color={'white'} /> : "Submit"}
          </ARPrimaryButton>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 60,
  },
  modalContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    // paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F6F7",
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily:'Montserrat_700Bold',
  },
  required: {
    color: 'red',
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  focusedInput: {
    borderColor: '#F59E0B', // Yellow-600 equivalent
    borderWidth: 2,
  },
  disabledInput: {
    backgroundColor: '#F5F5F4', // Stone-100 equivalent
    color: '#6B7280', // Gray-500 equivalent
    opacity: 0.5,
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 45,

  },
  pickerItem: {
    fontSize: 14,

  },
  containerBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  halfWidth: {
    width: '48%',
  },
  budgetInput: {
    flex: 1,
  },
  toText: {
    marginHorizontal: 8,
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 12,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#9CA3AF', // Gray-400 equivalent
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#3B82F6', // Blue-500 equivalent
    borderColor: '#2563EB', // Blue-600 equivalent
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444', // Red-500 equivalent
    fontSize: 12,
    marginTop: 4,
  },

  footerButtons: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: "60%",
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },

  clearButton: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#999',
    flexShrink: 1,
  },

  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: '#153E3B',
    flexShrink: 1,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB', // Gray-300
  },
});

export default UserRequirementForm;
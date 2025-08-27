import React, { useState } from 'react';
import {
    SafeAreaView,
    StatusBar,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert
} from 'react-native';
import { FormRenderer } from './FormRenderer';
import { inventoryFormConfig } from '@/app/config/AddInventoryFormConfig/inventoryFormConfig';
import { Property } from '@/app/types';
import ArrowLeftIcon from '@/assets/icons/svg/Common/ArrowLeftIcon';
import { FormPreview } from '../Listing/listingPropertyDetails';

interface PropertyFormScreenProps {
    initialData?: Partial<Property>;
    onComplete: (data: Partial<Property>) => void;
    onCancel: () => void;
    isEdit?: boolean;
}

export const PropertyFormScreen: React.FC<PropertyFormScreenProps> = ({
    initialData,
    onComplete,
    onCancel,
    isEdit = false
}) => {
    // -------------------- State Management --------------------
    const [formData, setFormData] = useState<Partial<Property>>(initialData || {});
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
    const [isFormEmpty, setIsFormEmpty] = useState<boolean>(Object.keys(initialData || {}).length === 0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPreview, setShowPreview] = useState<boolean>(false);

    // -------------------- Utility Functions --------------------

    /**
     * Get the value of a nested field in an object based on dot notation.
     */
    const getFieldValue = (data: Record<string, any>, fieldPath: string): any => {
        return fieldPath.split('.').reduce((obj, key) => obj?.[key], data);
    };

    /**
     * Filter steps based on conditions defined in the form configuration.
     */
    const getVisibleSteps = () => {
        return inventoryFormConfig.steps.filter(step => {
            if (!step.dependsOn) return true;
            const fieldValue = getFieldValue(formData, step.dependsOn.field);
            return step.dependsOn.values.includes(fieldValue);
        });
    };

    // -------------------- Event Handlers --------------------

    const handleNext = () => {
        const visibleSteps = getVisibleSteps();
        if (currentStepIndex < visibleSteps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            //onComplete(formData);
            setShowPreview(true);
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        } else {
            onCancel();
        }
    };

    const handleFormUpdate = (updatedData: Partial<Property>) => {
        setFormData(updatedData);
        setIsFormEmpty(false);
    };

    const handleErrorsUpdate = (updatedErrors: Record<string, string>) => {
        setErrors(updatedErrors);
    };

    const handleClear = () => {
        if (!isFormEmpty) {
            Alert.alert(
                'Clear Form',
                'Are you sure you want to clear all form data?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Clear',
                        onPress: () => {
                            setFormData({});
                            setIsFormEmpty(true);
                            setCurrentStepIndex(0);
                            setErrors({});
                        },
                        style: 'destructive'
                    }
                ]
            );
        }
    };

    const handleStepChange = (index: number) => {
        const visibleSteps = getVisibleSteps();
        if (index <= currentStepIndex || index < visibleSteps.length) {
            setCurrentStepIndex(index);
        }
    };

    // -------------------- Derived Values --------------------
    const visibleSteps = getVisibleSteps();

    if (showPreview) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F6F7]">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Header */}
        <View className="w-full bg-white">
          <View className="flex-row items-center px-3 h-12 justify-between">
            <View className="flex-row items-center gap-2.5">
              <TouchableOpacity onPress={() => setShowPreview(false)}>
                <ArrowLeftIcon />
              </TouchableOpacity>
              <Text className="font-['Montserrat_700Bold'] text-lg font-semibold text-black">
                Preview Property
              </Text>
            </View>
          </View>
        </View>

        {/* Preview */}
        <View className="flex-1">
          <FormPreview config={inventoryFormConfig} data={formData} />
        </View>

        {/* Back & Submit buttons */}
        <View className="flex-row px-5 py-5 gap-3">
          <TouchableOpacity
            className="flex-1 py-4 rounded-lg bg-[#f5f5f5] border border-[#ddd]"
            onPress={() => {
              setShowPreview(false);
              setCurrentStepIndex(0);
            }}
          >
            <Text className="text-center text-base font-semibold text-[#666]">
              Back
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-4 rounded-lg bg-[#2e7d32]"
            onPress={() => onComplete(formData)}
          >
            <Text className="text-center text-base font-semibold text-white">
              {isEdit ? 'Update' : 'Submit'}
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
            <View className="w-full bg-white">
                <View className="flex-row items-center px-3 h-12 justify-between">
                    {/* Back Button & Title */}
                    <View className="flex-row items-center gap-2.5">
                        <TouchableOpacity onPress={onCancel}>
                            <ArrowLeftIcon />
                        </TouchableOpacity>
                        <Text className="font-['Montserrat_700Bold'] text-lg font-semibold text-black">
                            {isEdit ? 'Edit Property' : 'Add Property'}
                        </Text>
                    </View>

                    {/* Clear Button */}
                    <TouchableOpacity
                        className="flex-row items-center px-2 py-1"
                        onPress={handleClear}
                    >
                        <Text
                            className={`font-['Montserrat_500Medium'] text-base ${isFormEmpty ? 'text-[#9E9E9E]' : 'text-[#D92D20]'
                                }`}
                        >
                            Clear
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-1 flex-col">
                {/* Step Navigation */}
                <View className="h-16 py-2 bg-white">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="bg-white border-b border-b-[#EEEEEE] px-3 py-1"
                    >
                        {visibleSteps.map((step, index) => (
                            <TouchableOpacity
                                key={step.id}
                                className={`px-3 py-1 mr-2 rounded-full ${currentStepIndex === index ? 'bg-[#E6F0EF]' : 'bg-[#F5F6F7]'
                                    }`}
                                onPress={() => handleStepChange(index)}
                            >
                                <Text
                                    className={`font-['Montserrat_500Medium'] text-sm ${currentStepIndex === index
                                        ? 'text-[#153E3B] font-semibold'
                                        : 'text-[#666]'
                                        }`}
                                >
                                    {step.title}
                                </Text>
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
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                </View>

                {/* Navigation Buttons */}
                <View className="flex-row px-5 py-5 gap-3">
                    <TouchableOpacity
                        className="flex-1 py-4 rounded-lg bg-[#f5f5f5] border border-[#ddd]"
                        onPress={handleBack}
                    >
                        <Text className="text-center text-base font-semibold text-[#666]">
                            {currentStepIndex === 0 ? "Cancel" : "Back"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 py-4 rounded-lg bg-[#2e7d32]"
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

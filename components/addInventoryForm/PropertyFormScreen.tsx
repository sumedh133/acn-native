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
    const [formData, setFormData] = useState<Partial<Property>>(initialData || {});
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [grayed, setGrayed] = useState(Object.keys(initialData || {}).length === 0);

    // Get visible steps based on formData
    const getVisibleSteps = () => {
        return inventoryFormConfig.steps.filter(step => {
            if (!step.dependsOn) return true;

            const fieldValue = step.dependsOn.field.split('.').reduce((obj, key) =>
                obj && obj[key] !== undefined ? obj[key] : undefined,
                formData as any
            );

            return step.dependsOn.values.includes(fieldValue);
        });
    };

    const visibleSteps = getVisibleSteps();

    const handleClear = () => {
        if (!grayed) {
            Alert.alert(
                "Clear Form",
                "Are you sure you want to clear all form data?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Clear",
                        onPress: () => {
                            setFormData({});
                            setGrayed(true);
                            setCurrentStepIndex(0);
                        },
                        style: "destructive"
                    }
                ]
            );
        }
    };

    const handleStepChange = (index: number) => {
        if (index <= currentStepIndex || index < visibleSteps.length) {
            setCurrentStepIndex(index);
        }
    };

    const handleFormUpdate = (updatedData: Partial<Property>) => {
        setFormData(updatedData);
        setGrayed(false);
    };

    const handleComplete = (finalData: Partial<Property>) => {
        onComplete(finalData);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F5F6F7]">
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View className="w-full bg-white">
                <View className="flex-row items-center px-3 h-12 justify-between">
                    <View className="flex-row items-center gap-2.5">
                        <TouchableOpacity onPress={onCancel}>
                            <ArrowLeftIcon />
                        </TouchableOpacity>
                        <Text className="font-['Montserrat_700Bold'] text-lg font-semibold text-black">
                            {isEdit ? 'Edit Property' : 'Add Property'}
                        </Text>
                    </View>

                    <TouchableOpacity className="flex-row items-center px-2 py-1" onPress={handleClear}>
                        <Text className={`font-['Montserrat_500Medium'] text-base ${grayed ? 'text-[#9E9E9E]' : 'text-[#D92D20]'}`}>
                            Clear
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex flex-col">
                <View className="h-[7vh] py-2 bg-white">

                    {/* Step Navigation */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="bg-white border-b border-b-[#EEEEEE] px-3 py-1"
                    >
                        {visibleSteps.map((step, index) => (
                            <TouchableOpacity
                                key={step.id}
                                className={`px-3 py-1 mr-2 rounded-full ${currentStepIndex === index ? 'bg-[#E6F0EF]' : 'bg-[#F5F6F7]'}`}
                                onPress={() => handleStepChange(index)}
                            >
                                <Text className={`font-['Montserrat_500Medium'] text-sm ${currentStepIndex === index ? 'text-[#153E3B] font-semibold' : 'text-[#666]'}`}>
                                    {step.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                <View className="h-[1vh]">
                    {/* Progress Bar */}
                    {/* <View className="h-1 bg-[#E6E6E6] w-full rounded-full">
                        <View
                            className="h-full bg-[#153E3B] rounded-full"
                            style={{ width: `${((currentStepIndex + 1) / visibleSteps.length) * 100}%` }}
                        />
                    </View> */}

                </View>
                <View className="h-[85vh]">
                    {/* Form Renderer */}
                    <FormRenderer
                        config={inventoryFormConfig}
                        initialData={formData}
                        onComplete={handleComplete}
                        onCancel={onCancel}
                        isEdit={isEdit}
                        currentStep={currentStepIndex}
                        setCurrentStep={setCurrentStepIndex}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

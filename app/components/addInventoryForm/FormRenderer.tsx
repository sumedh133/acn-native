import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Switch
} from 'react-native';
import { FormConfig, FormField } from '../../../types/FormConfig';
import { Property } from '@/app/types';

interface FormRendererProps {
    config: FormConfig;
    initialData?: Partial<Property>;
    onComplete: (data: Partial<Property>) => void;
    onCancel: () => void;
    isEdit?: boolean;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
    config,
    initialData = {},
    onComplete,
    onCancel,
    isEdit = false
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<Partial<Property>>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const getFieldValue = (data: any, fieldPath: string) => {
        return fieldPath.split('.').reduce((obj, key) => obj?.[key], data);
    };

    const visibleSteps = config.steps.filter(step => {
        if (!step.dependsOn) return true;
        const fieldValue = getFieldValue(formData, step.dependsOn.field);
        return step.dependsOn.values.includes(fieldValue);
    });

    const currentStepConfig = visibleSteps[currentStep];

    const setFieldValue = (fieldPath: string, value: any) => {
        const keys = fieldPath.split('.');
        const newData = { ...formData };

        let current: Record<string, any> = newData;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        setFormData(newData);
    };


    const validateField = (field: FormField, value: any): string | null => {
        if (field.required && (!value || value === '' || value === null || value === undefined)) {
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

        visibleFields.forEach(field => {
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
        return fields.filter(field => {
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
            case 'text':
            case 'number':
                return (
                    <View key={field.id} className="mb-5">
                        <Text className="text-base font-semibold text-gray-800 mb-2">
                            {field.label}
                            {field.required && <Text className="text-red-600">*</Text>}
                        </Text>
                        <TextInput
                            className={`border border-gray-300 rounded-lg p-3 text-base bg-white ${error ? 'border-red-600' : ''}`}
                            value={value?.toString() || ''}
                            onChangeText={(text) => setFieldValue(field.id, field.type === 'number' ? Number(text) : text)}
                            placeholder={field.placeholder}
                            keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                        />
                        {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
                    </View>
                );

            case 'textarea':
                return (
                    <View key={field.id} className="mb-5">
                        <Text className="text-base font-semibold text-gray-800 mb-2">
                            {field.label}
                            {field.required && <Text className="text-red-600">*</Text>}
                        </Text>
                        <TextInput
                            className={`border border-gray-300 rounded-lg p-3 text-base bg-white min-h-[100px] ${error ? 'border-red-600' : ''}`}
                            style={{ textAlignVertical: 'top' }}
                            value={value?.toString() || ''}
                            onChangeText={(text) => setFieldValue(field.id, text)}
                            placeholder={field.placeholder}
                            multiline
                            numberOfLines={4}
                        />
                        {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
                    </View>
                );

            case 'select':
                return (
                    <View key={field.id} className="mb-5">
                        <Text className="text-base font-semibold text-gray-800 mb-2">
                            {field.label}
                            {field.required && <Text className="text-red-600">*</Text>}
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {field.options?.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    className={`px-4 py-2.5 border border-gray-300 rounded-full bg-white ${value === option.value ? 'bg-green-700 border-green-700' : ''
                                        }`}
                                    onPress={() => setFieldValue(field.id, option.value)}
                                >
                                    <Text className={`text-sm ${value === option.value ? 'text-white' : 'text-gray-800'
                                        }`}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
                    </View>
                );

            case 'multiselect':
                const multiValue = value || [];
                return (
                    <View key={field.id} className="mb-5">
                        <Text className="text-base font-semibold text-gray-800 mb-2">
                            {field.label}
                            {field.required && <Text className="text-red-600">*</Text>}
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {field.options?.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    className={`px-4 py-2.5 border border-gray-300 rounded-full bg-white ${multiValue.includes(option.value) ? 'bg-green-700 border-green-700' : ''
                                        }`}
                                    onPress={() => {
                                        const newValue = multiValue.includes(option.value)
                                            ? multiValue.filter((v: any) => v !== option.value)
                                            : [...multiValue, option.value];
                                        setFieldValue(field.id, newValue);
                                    }}
                                >
                                    <Text className={`text-sm ${multiValue.includes(option.value) ? 'text-white' : 'text-gray-800'
                                        }`}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
                    </View>
                );

            case 'boolean':
                return (
                    <View key={field.id} className="mb-5">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-base font-semibold text-gray-800">
                                {field.label}
                                {field.required && <Text className="text-red-600">*</Text>}
                            </Text>
                            <Switch
                                value={value || false}
                                onValueChange={(newValue) => setFieldValue(field.id, newValue)}
                            />
                        </View>
                        {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
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
        <View className="flex-1 bg-gray-100">
            {/* Progress Bar */}
            <View className="h-1 bg-gray-300 mx-5 mt-5 rounded-sm">
                <View
                    className="h-full bg-green-700 rounded-sm"
                    style={{ width: `${progress}%` }}
                />
            </View>
            <Text className="text-center mt-2 text-sm font-semibold text-gray-600">
                {Math.round(progress)}%
            </Text>

            {/* Header */}
            <View className="px-5 pt-5 pb-2.5">
                <Text className="text-2xl font-bold text-gray-800 mb-2">
                    {currentStepConfig.title}
                </Text>
                {currentStepConfig.description && (
                    <Text className="text-base text-gray-600 leading-6">
                        {currentStepConfig.description}
                    </Text>
                )}
            </View>

            {/* Form Fields */}
            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {visibleFields.map(renderField)}
            </ScrollView>

            {/* Navigation Buttons */}
            <View className="flex-row px-5 py-5 gap-3">
                <TouchableOpacity
                    className="flex-1 py-4 rounded-lg bg-gray-100 border border-gray-300"
                    onPress={handleBack}
                >
                    <Text className="text-center text-base font-semibold text-gray-600">
                        {currentStep === 0 ? 'Cancel' : 'Back'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-1 py-4 rounded-lg bg-green-700"
                    onPress={handleNext}
                >
                    <Text className="text-center text-base font-semibold text-white">
                        {currentStep === visibleSteps.length - 1 ? (isEdit ? 'Update' : 'Submit') : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
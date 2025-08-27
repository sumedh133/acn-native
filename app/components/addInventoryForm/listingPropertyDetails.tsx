import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { FormConfig, FormField } from "../../types/FormConfig";
import { Property } from "@/app/types";

interface FormPreviewProps {
  config: FormConfig;
  data: Partial<Property>;
}

export const FormPreview: React.FC<FormPreviewProps> = ({ config, data }) => {
  // helper to fetch nested values like "pricing.rent"
  const getFieldValue = (obj: any, path: string) => {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  };

  const renderFieldValue = (field: FormField) => {
    const value = getFieldValue(data, field.id);

    if (!value || (Array.isArray(value) && value.length === 0)) return null;

    return (
      <View key={field.id} style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>{field.label}:</Text>
        <Text style={styles.fieldValue}>
          {Array.isArray(value) ? value.join(", ") : String(value)}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {config.steps.map((step) => {
        const visibleFields = step.fields || [];
        const stepValues = visibleFields
          .map((field) => renderFieldValue(field))
          .filter(Boolean);

        if (stepValues.length === 0) return null;

        return (
          <View key={step.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{step.title}</Text>
            {stepValues}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  section: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#222",
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  fieldLabel: {
    fontWeight: "600",
    marginRight: 8,
    color: "#333",
  },
  fieldValue: {
    flexShrink: 1,
    color: "#555",
  },
});

import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

interface RadioButtonSelectProps {
  value: string | null;
  setvalue: (value: string | null) => void;
  title: string;
  options: Array<{ label: string; value: string }>;
    required: boolean;
}

const RadioButtonSelect = ({
  value,
  setvalue,
  title,
  options,
    required,
}: RadioButtonSelectProps) => {
  const handleSelect = (val: string) => {
    console.log(val, "value");
    if (value === val) {
      setvalue(null);
    } else {
      setvalue(val);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.headingContainer}>
        <Text style={styles.sectionHeading}>{title}</Text>
        {required && <Text style={styles.compulsoryStar}>*</Text>}
      </View>

      <View style={styles.optionContainer}>
        {options.map((option, index) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={index}
              style={styles.options}
              onPress={() => handleSelect(option.value)}>
              <View style={styles.radioCircle}>
                {isSelected && <View style={styles.selectedRadioCircle} />}
              </View>
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    width: "100%",
  },
  headingContainer: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  sectionHeading: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
  },
  compulsoryStar: {
    fontFamily: "sans-serif",
    color: "#DC3545",
    fontSize: 14,
    fontWeight: "400",
  },
  optionContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  options: {
    flex: 1,
    height: 40,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E3E6",
  },
  radioCircle: {
    height: 14,
    width: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedRadioCircle: {
    width: 8.4,
    height: 8.4,
    borderRadius: 16,
    backgroundColor: "#000000",
  },
  optionText: {
    fontFamily: "sans-serif",
    fontWeight: "400",
    fontSize: 14,
    color: "#000000",
  },
});

export default RadioButtonSelect;

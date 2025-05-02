import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";

interface MultiSelectSliderProps {
  value: string[];  // Array of selected values
  setvalue: (value: string[]) => void;  // Function to update the array
  title: string;
  options: Array<{ label: string; value: string }>;
  required: boolean;
  footer?: string;  // Make it optional with a default
}

const MultiSelectSlider = ({
  value,
  setvalue,
  title,
  options,
  required,
  footer = '',
}: MultiSelectSliderProps) => {
  const minSelection = 0;
  const maxSelection = Infinity;
  const handleSelect = (val: string) => {
    if (value.includes(val)) {
      // If already selected and we're above minSelection, remove it
      if (!required || value.length > minSelection) {
        setvalue(value.filter((item) => item !== val));
      }
    } else {
      // If not at max selection limit, add it
      if (value.length < maxSelection) {
        setvalue([...value, val]);
      }
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.headingContainer}>
        <Text style={styles.sectionHeading}>{title}</Text>
        {required && <Text style={styles.compulsoryStar}>*</Text>}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionContainer}
      >
        {options.map((option) => {
          const isSelected = value.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.options, isSelected && styles.selectedOption]}
              onPress={() => handleSelect(option.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {footer !== '' && (
        <Text style={styles.priceInWords}>
          {footer}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    width: "100%",
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 6,
  },
  headingContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
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
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  options: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderColor: "#E1E3E6",
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  selectedOption: {
    borderColor: "#2B3034",
    backgroundColor: "#DFF4F3",
  },
  optionText: {
    fontFamily: "sans-serif",
    fontWeight: "400",
    fontSize: 14,
    color: "#000000",
  },
  selectionLimitText: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
  },
  priceInWords: {
    fontSize: 12,
    color: "#757575",
  },
  selectedCountContainer: {
    marginTop: 8,
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});

export default MultiSelectSlider;
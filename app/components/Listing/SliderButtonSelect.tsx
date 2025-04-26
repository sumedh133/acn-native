import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";

interface SliderButtonSelectProps {
  value: string | null;
  setvalue: (value: string | null) => void;
  title: string;
  options: Array<{ label: string; value: string }>;
}

const SliderButtonSelect = ({
  value,
  setvalue,
  title,
  options,
}: SliderButtonSelectProps) => {
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
        <Text style={styles.compulsoryStar}>*</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionContainer}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
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
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    width: "100%",
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 8,
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
    paddingVertical: 6,
  },
  options: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderColor: "#E1E3E6",
    backgroundColor: "#FFFFFF",
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
});

export default SliderButtonSelect;

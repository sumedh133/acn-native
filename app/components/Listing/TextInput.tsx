import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ViewStyle,
  DimensionValue,
} from "react-native";

interface TextInputFieldProps {
  value: string | number | null;
  setValue: (value: string | number) => void;
  title: string;
  placeholder?: string;
  required?: boolean;
  keyboardType?:
    | "default"
    | "number-pad"
    | "decimal-pad"
    | "numeric"
    | "email-address"
    | "phone-pad";
  maxLength?: number;
  suffix?: string;
  prefix?: string;
  numberToStringFooter?: boolean;
  footer?: string;
}

const TextInputField = ({
  value,
  setValue,
  title,
  placeholder = "",
  required = false,
  keyboardType = "default",
  maxLength,
  suffix,
  prefix,
  numberToStringFooter = false,
  footer = "",
}: TextInputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChangeText = (text: string) => {
    if (
      keyboardType === "numeric" ||
      keyboardType === "number-pad" ||
      keyboardType === "decimal-pad"
    ) {
      // Convert to number if the input is a numeric type
      if (text === "") {
        setValue(""); // Or you might want to set it to null or 0 depending on your requirements
      } else {
        const numericValue =
          keyboardType === "decimal-pad"
            ? parseFloat(text)
            : parseInt(text, 10);
        setValue(isNaN(numericValue) ? 0 : numericValue);
      }
    } else {
      // For non-numeric inputs, keep as string
      setValue(text);
    }
  };

  // Calculate the total in words (for display below the input)
  /**
 * Converts a price value to a formatted string representation in words
 * @param value - The price value to convert (can be string, number, or null)
 * @returns A formatted string representation of the price
 */
const getPriceInWords = (): string => {
  if (!value) 
    return "Eg. 7.5 K | 7500 Rupees only";
  
  // Convert string values to number
  const numericPrice = typeof value === 'string' 
    ? parseFloat(value.replace(/,/g, ""))
    : value;
  
  if (isNaN(numericPrice)) return "";

  if (numericPrice >= 10000000) {
    return `${(numericPrice / 10000000).toFixed(2)} Cr | ${numberToWords(
      numericPrice
    )}`;
  } else if (numericPrice >= 100000) {
    return `${(numericPrice / 100000).toFixed(2)} Lakh | ${numberToWords(
      numericPrice
    )}`;
  } else if (numericPrice >= 1000) {
    return `${(numericPrice / 1000).toFixed(2)} K | ${numberToWords(
      numericPrice
    )}`;
  }
  return numberToWords(numericPrice);
};

/**
 * Converts a numeric price to its word representation in Indian currency format
 * @param num - The numeric price to convert
 * @returns The price in words (Indian currency format)
 */
const numberToWords = (num: number): string => {
  // This is a simplified implementation
  if (num >= 10000000) {
    const crores = Math.floor(num / 10000000);
    const lakhs = Math.floor((num % 10000000) / 100000);
    return `${crores} Crore ${lakhs} Lakh Rupees only`;
  } else if (num >= 100000) {
    const lakhs = Math.floor(num / 100000);
    return `${lakhs} Lakh Rupees only`;
  }
  return `${num} Rupees only`;
};

  return (
    <View style={styles.section}>
      <View style={styles.headingContainer}>
        <Text style={styles.sectionHeading}>{title}</Text>
        {required && <Text style={styles.compulsoryStar}>*</Text>}
      </View>

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInputContainer,
        ]}
      >
        {prefix && <Text style={styles.suffixText}>{prefix}</Text>}
        <TextInput
          style={styles.inputField}
          value={value?.toString() || ""}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          maxLength={maxLength}
        />
        {suffix && <Text style={styles.suffixText}>{suffix}</Text>}
      </View>
      {numberToStringFooter ? <Text style={styles.priceInWords}>{getPriceInWords()}</Text> : <></>}
      {footer === "" ? <></> :  <Text style={styles.priceInWords}>{footer}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 6,
    width: "100%",
  },
  headingContainer: {
    flexDirection: "row",
    gap: 6,
    width: "100%",
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
  inputField: {
    flex: 1,
    width: "100%",
    height: 32,
    borderColor: "#E1E3E6",
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    fontFamily: "sans-serif",
    color: "#000000",
  },
  inputContainer: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E1E3E6",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  focusedInputContainer: {
    borderColor: "#2B3034",
  },
  suffixText: {
    fontSize: 14,
    fontFamily: "sans-serif",
    color: "#757575",
    marginLeft: 4,
  },
  priceInWords: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
  },
});

export default TextInputField;

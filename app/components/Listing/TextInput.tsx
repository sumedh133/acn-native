import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";

interface TextInputFieldProps {
  value: string | number | null;
  setValue: (value: string | number) => void;
  title?: string;
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
  showStepper?: boolean; // New prop for number stepper
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
  showStepper = false,
}: TextInputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleChangeText = (text: string) => {
    if (
      keyboardType === "numeric" ||
      keyboardType === "number-pad" ||
      keyboardType === "decimal-pad"
    ) {
      if (text === "") setValue(0);
      else {
        const numericValue =
          keyboardType === "decimal-pad"
            ? parseFloat(text)
            : parseInt(text, 10);
        setValue(isNaN(numericValue) ? 0 : numericValue);
      }
    } else {
      setValue(text);
    }
  };

  // Convert number to words (simplified for Indian currency)
  const numberToWords = (num: number): string => {
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

  const getPriceInWords = (): string => {
    if (!value) return "Eg. 7.5 K | 7500 Rupees only";
    const numericPrice =
      typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
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

  return (
    <View style={styles.section}>
      {title && (
        <View style={styles.headingContainer}>
          <Text style={styles.sectionHeading}>{title}</Text>
          {required && <Text style={styles.compulsoryStar}>*</Text>}
        </View>)}
      {showStepper ? (
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() =>
              setValue(typeof value === "number" ? Math.max(0, value - 1) : 0)
            }
          >
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.stepperValue}>{value?.toString() || "0"}</Text>

          <TouchableOpacity
            style={styles.circleButton}
            onPress={() =>
              setValue(typeof value === "number" ? value + 1 : 1)
            }
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      ) : (

        <View
          style={[styles.inputContainer, isFocused && styles.focusedInputContainer]}
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
        </View>)}

      {numberToStringFooter && <Text style={styles.priceInWords}>{getPriceInWords()}</Text>}
      {footer !== "" && <Text style={styles.priceInWords}>{footer}</Text>}
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
  inputField: {
    flex: 1,
    width: "100%",
    height: 32,
    fontSize: 14,
    fontFamily: "sans-serif",
    color: "#000000",
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
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  circleButton: {
    width: 24,
    height: 24,
    borderRadius: 18,
    borderColor: "#C8C7C7",
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "300",
    
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: "700",
    minWidth: 40,
    textAlign: "center",
    color: "#153E3B"
  },
});

export default TextInputField;

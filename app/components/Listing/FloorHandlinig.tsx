import React from "react";
import { View, Text } from "react-native";
import TextInputField from "../Listing/TextInput"; // Assuming you have this component

type Props = {
  value?: number | null;
  setValue: (val: number | null) => void;
  placeholder?: string;
  required?: boolean;
  keyboardType?: "default" | "numeric" | "number-pad" | "decimal-pad";
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  numberToStringFooter?: boolean;
  footer?: React.ReactNode;
  errorMessage?: string | null;
  label: string;
  labelNote?: string;
};

export const FloorField: React.FC<Props> = ({
  value,
  setValue,
  placeholder,
  required,
  keyboardType = "default",
  prefix,
  suffix,
  numberToStringFooter,
  footer,
  errorMessage,
  label,
  labelNote,
}) => {
  const handleChange = (text: string) => {
    const floor = text ? parseInt(text, 10) : null;
    setValue(floor);
  };

  return (
    <>
      <View className="mb-3">
        <Text className="text-base font-semibold">
          {label}
          {required && <Text>*</Text>}
        </Text>
        {labelNote && (
          <Text className="font-lato-light text-[11px] leading-[150%]">
            {labelNote}
          </Text>
        )}
      </View>

      <TextInputField
        value={value !== null && value !== undefined ? String(value) : ""}
        setValue={handleChange}
        placeholder={placeholder}
        required={required}
        keyboardType={keyboardType}
        {...(prefix ? { prefix } : {})}
        {...(suffix ? { suffix } : {})}
        {...(numberToStringFooter ? { numberToStringFooter } : {})}
        {...(footer ? { footer } : {})}
      />

      {errorMessage && (
        <Text className="text-[#d32f2f] text-sm mt-1">{errorMessage}</Text>
      )}
    </>
  );
};

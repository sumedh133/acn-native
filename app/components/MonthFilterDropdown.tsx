import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface MonthFilterOption {
  label: string;
  value: string;
}

interface MonthFilterDropdownProps {
  options: MonthFilterOption[];
  value: string;
  setValue: (value: string) => void;
  setBuffering: (buffer: boolean) => void;
  setBatchSize: (batch: number) => void;
}

const MonthFilterDropdown = ({
  options,
  value,
  setValue,
  setBuffering,
  setBatchSize,
}: MonthFilterDropdownProps) => {
  const allOptions = [{ label: "All", value: "" }, ...options];
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const userType = useSelector((state: RootState) => state.agent?.docData?.userType) || "free";

  useEffect(() => {
    if (!value || value === "") {
      setSelectedLabel("All");
    } else {
      const selected = allOptions?.find(
        (option) => option?.value === value
      )?.label;
      if (selected) {
        setSelectedLabel(selected);
      }
    }
  }, [value, allOptions]);

  const toggleDropdown = () => {
    try {
      logEvent(analytics, isOpen ? 'close_month_filter' : 'open_month_filter', {
        event_category: 'filters',
        event_label: isOpen ? 'close' : 'open',
        current_value: value,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging month filter toggle:', error);
    }
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (optionValue: string) => {
    if (value !== optionValue) {
      try {
        const selectedOption = allOptions.find(opt => opt.value === optionValue);
        logEvent(analytics, 'select_month_filter', {
          event_category: 'filters',
          event_label: 'select',
          previous_value: value,
          new_value: optionValue,
          new_label: selectedOption?.label,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging month selection:', error);
      }

      setBuffering(true);
      setBatchSize(10);
      setTimeout(() => {
        setValue(optionValue);
      }, 0);
    }
    setIsOpen(false);
  };

  return (
    <StyledView className="flex flex-row items-center justify-between bg-gray-100 px-[9px] py-[6px] m-3 rounded-md z-[999999999]">
      <StyledText className="text-sm text-gray-700 font-medium">
        Filter by month:
      </StyledText>

      <StyledView className="relative z-[999999999]">
        <StyledTouchableOpacity onPress={toggleDropdown}>
          <StyledView className="flex flex-row items-center justify-between bg-white min-w-[145px] p-[5px] rounded-[5px] border border-gray-200">
            <StyledText className="text-xs font-medium text-black">
              {selectedLabel}
            </StyledText>
            <Ionicons
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={14}
              color="#0A0B0A"
            />
          </StyledView>
        </StyledTouchableOpacity>

        {isOpen && (
          <StyledView className="absolute top-10 right-0 p-1 bg-white border border-gray-200 rounded-lg shadow-md z-[999999999] min-w-[145px]">
            {allOptions.map((option, index) => (
              <StyledTouchableOpacity
                key={index}
                className="rounded-md w-full px-3 py-2 mb-1"
                style={{
                  backgroundColor:
                    option.value === value ? "#F2F2F2" : "transparent",
                }}
                onPress={() => handleOptionClick(option.value)}
              >
                <StyledText className="font-medium text-sm text-black">
                  {option.label}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </StyledView>
        )}
      </StyledView>
    </StyledView>
  );
};

export default MonthFilterDropdown;

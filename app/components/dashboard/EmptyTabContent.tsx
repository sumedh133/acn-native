import { styled } from "nativewind";
import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native"; // Adjust import based on your setup

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
// Define props type
type EmptyTabContentProps = {
  text: string;
  sub_text: string;
  icon: React.ReactNode; // Use ReactNode for JSX elements like icons
  handleOnPress: () => void; // Specific function type
  buttonText: string;
  loading: boolean;
};

// Define component
const EmptyTabContent: React.FC<EmptyTabContentProps> = ({
  text,
  sub_text,
  icon,
  handleOnPress,
  buttonText,
  loading,
}) => {
  if (loading) return <ActivityIndicator className="mt-8" />;
  return (
    <StyledView className="flex-1 items-center justify-center gap-[24px] mt-8">
      <StyledView className="flex flex-col items-center justify-center gap-[12px]">
        <StyledText className="text-lg text-[#2B2928] text-center">
          {text}
        </StyledText>
        <StyledText className="text-base text-[#111827] text-center">
          {sub_text}
        </StyledText>
      </StyledView>
      <StyledTouchableOpacity
        className="flex-row items-center justify-center bg-[#153E3B] py-3 px-4 rounded-lg mb-4"
        onPress={handleOnPress}
      >
        {icon}
        <StyledText className="text-base font-medium text-white ml-2">
          {buttonText}
        </StyledText>
      </StyledTouchableOpacity>
    </StyledView>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(EmptyTabContent);

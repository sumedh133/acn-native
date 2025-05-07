import React, { ReactNode } from 'react';
import { View } from 'react-native';

interface OnboardingCardProps {
  children: ReactNode;
}

const OnboardingCard: React.FC<OnboardingCardProps> = ({ children }) => {
  return (
    <View className="bg-white pb-4 px-4 w-full rounded-t-[12px]">
      {children}
    </View>
  );
};

export default OnboardingCard;
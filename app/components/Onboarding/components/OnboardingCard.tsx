import React, { ReactNode } from 'react';
import { View } from 'react-native';

interface OnboardingCardProps {
  children: ReactNode;
}

const OnboardingCard: React.FC<OnboardingCardProps> = ({ children }) => {
  return (
    <View className="bg-white p-4 w-full">
      {children}
    </View>
  );
};

export default OnboardingCard;
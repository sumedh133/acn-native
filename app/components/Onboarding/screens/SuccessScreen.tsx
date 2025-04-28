import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import OnboardingCard from '../components/OnboardingCard';
import PrimaryButton from '../components/PrimaryButton';

interface SuccessScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ onComplete, onSkip }) => {
  return (
    <View>
      <OnboardingCard>
        <TouchableOpacity className="self-end" onPress={onSkip}>
          <Text className="text-gray-400">✕</Text>
        </TouchableOpacity>
        
        <View className="items-center mb-6 mt-4">
          <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center">
            <Text className="text-green-500 text-2xl">✓</Text>
          </View>
        </View>
        
        <Text className="text-lg font-bold text-center mb-1">
          Congratulations! Your ACN Premium Free Trial Has Been Activated
        </Text>
        
        <Text className="text-sm text-center text-gray-500 mb-6">
          You now have all access for the next 30 days to all premium services.
        </Text>
        
        <PrimaryButton 
          title="Go to Properties" 
          onPress={onComplete || (() => {})}
        />
      </OnboardingCard>
    </View>
  );
};

SuccessScreen.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired
};

export default SuccessScreen;
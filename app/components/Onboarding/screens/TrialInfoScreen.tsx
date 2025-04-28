import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import OnboardingCard from '../components/OnboardingCard';
import PrimaryButton from '../components/PrimaryButton';

interface TrialInfoScreenProps {
  onContinue: () => void;
  onSkip: () => void;
}

const TrialInfoScreen: React.FC<TrialInfoScreenProps> = ({ onContinue, onSkip }) => {
  return (
    <View className="">
      <OnboardingCard>
        <TouchableOpacity className="self-end" onPress={onSkip}>
          <Text className="text-gray-400">✕</Text>
        </TouchableOpacity>
        
        <View className="bg-black py-1 px-4 self-center rounded-2xl mb-4">
          <Text className="text-white text-xs">WELCOME OFFER</Text>
        </View>
        
        <Text className="text-lg font-bold text-center mb-3">
          You're In! Let's Set You Up for Success
        </Text>
        
        <Text className="text-sm text-center text-gray-500 mb-6">
          Unlock unlimited inquiries, virtual agent contacts & priority supplier-led referrals
        </Text>
        
        <View className="items-center mb-8">
          <Image 
            source={require('../../../../assets/images/gift-image.png')} 
            className="w-screen h-80"
            resizeMode="contain"
          />
        </View>
        
        <PrimaryButton 
          title="Start Free Trial" 
          onPress={onContinue || (() => {})} 
          className="mb-2"
        />
        
        <TouchableOpacity className="items-center">
          <Text className="text-gray-500 text-sm">See past plans</Text>
        </TouchableOpacity>
        
        <Text className="text-xs text-gray-400 text-center mt-4">
          You can upgrade or cancel anytime, change your features and no extra costs to the future plans
        </Text>
      </OnboardingCard>
    </View>
  );
};

TrialInfoScreen.propTypes = {
  onContinue: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired
};

export default TrialInfoScreen;
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import OnboardingCard from '../components/OnboardingCard';
import PrimaryButton from '../components/PrimaryButton';
import BenefitItem from '../components/BenefitItem';

interface BenefitsScreenProps {
  onContinue: () => void;
  onSkip: () => void;
}

const BenefitsScreen: React.FC<BenefitsScreenProps> = ({ onContinue, onSkip }) => {
  const benefits: string[] = [
    "100 Enquiries/Month",
    "Unlimited inventory listing every month (no empty limits)",
    "Unlimited negotiated listings every month (no inquiry limits)",
    "Priority XRM Access",
    "Exclusive Access to Realestate Market Data and Marketplace Reports"
  ];

  return (
    <View>
      <OnboardingCard>
        <TouchableOpacity className="self-end" onPress={onSkip}>
          <Text className="text-gray-400">✕</Text>
        </TouchableOpacity>
        
        <View className="items-center mb-6">
          <Image 
            source={require('../../../../assets/images/benefits-image.png')} 
            className="w-40 h-40 rounded-md"
            resizeMode="contain"
          />
        </View>
        
        <Text className="text-lg font-medium text-center mb-6">
          What you will get?
        </Text>
        
        <View className="mb-3">
          {benefits.map((benefit, index) => (
            <BenefitItem key={index} text={benefit} />
          ))}
        </View>
        
        <PrimaryButton 
          title="Start My Free Trial" 
          onPress={onContinue || (() => {})} 
          className="mt-4"
        />
        
        <Text className="text-xs text-gray-400 text-center mt-4">
          You can cancel at anytime in the account settings
        </Text>
      </OnboardingCard>
    </View>
  );
};

BenefitsScreen.propTypes = {
  onContinue: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired
};

export default BenefitsScreen;
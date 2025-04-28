import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import OnboardingCard from '../components/OnboardingCard';
import PrimaryButton from '../components/PrimaryButton';

interface WelcomeScreenProps {
  onContinue: () => void;
  onSkip: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue, onSkip }) => {
  return (
    <View className="w-full">
      
      <OnboardingCard>
          <TouchableOpacity className="ml-auto" onPress={onSkip}>
            <Text className="text-gray-400">✕</Text>
          </TouchableOpacity>
        <View className="items-center mb-4">
          <Image 
            source={require('../../../../assets/images/welcome-image.png')} 
            className="w-56 h-56 rounded-md"
            resizeMode="contain"
          />
        </View>
        
        <Text className="text-xs text-gray-400 text-center mb-2">WELCOME TO ACN</Text>
        
        <Text className="text-lg font-bold text-center mb-6">
          Multiple Agents. One Mission.{'\n'}One Network.
        </Text>
        
        <PrimaryButton 
          title="Continue →" 
          onPress={onContinue || (() => {})} 
        />
      </OnboardingCard>
    </View>
  );
};

WelcomeScreen.propTypes = {
  onContinue: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired
};

export default WelcomeScreen;
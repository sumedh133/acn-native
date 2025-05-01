import React from 'react';
import { Modal, View,Text, StyleSheet, SafeAreaView } from 'react-native';
import PropTypes from 'prop-types';
import { OnboardingProvider, useOnboardingContext } from './OnboardingContext';
import WelcomeScreen from '../screens/WelcomeScreen';
import TrialInfoScreen from '../screens/TrialInfoScreen';
import BenefitsScreen from '../screens/BenefitsScreen';
import SuccessScreen from '../screens/SuccessScreen';

interface OnboardingFlowProps {
  visible: boolean;
  onComplete: () => void;
  onClose: () => void;
}

const OnboardingFlowContent: React.FC<OnboardingFlowProps> = ({ visible, onComplete, onClose }) => {
  const { currentStep, nextStep, resetOnboarding, onboardingCompleted } = useOnboardingContext();

  // When onboarding is completed, call the onComplete callback
  React.useEffect(() => {
    if (onboardingCompleted) {
      onComplete();
    }
  }, [onboardingCompleted, onComplete]);

  const closeOnboarding = (): void => {
    resetOnboarding();
    onClose();
  };
  
  const completeOnboarding = (): void => {
    // Mark onboarding as completed using context's nextStep
    // This will trigger the effect that calls onComplete
    nextStep();
  };

  const renderCurrentStep = (): React.ReactNode => {
    switch (currentStep) {
      case 0:
        return <WelcomeScreen onContinue={nextStep} onSkip={closeOnboarding} />;
      case 1:
        return <TrialInfoScreen onContinue={nextStep} onSkip={closeOnboarding} />;
      case 2:
        return <BenefitsScreen onContinue={nextStep} onSkip={closeOnboarding} />;
      case 3:
        return <SuccessScreen onComplete={completeOnboarding} onSkip={closeOnboarding} />;
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeOnboarding}
      
    >
      <SafeAreaView
       className='absolute bottom-0 left-0 right-0 bg-[#EEEEEE]'
       >
          {renderCurrentStep()}
      </SafeAreaView>
    </Modal>
  );
};

const OnboardingFlow: React.FC<OnboardingFlowProps> = (props) => {
  return (
    <OnboardingProvider>
      <OnboardingFlowContent {...props} />
    </OnboardingProvider>
  );
};

OnboardingFlow.propTypes = {
  visible: PropTypes.bool.isRequired,
  onComplete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default OnboardingFlow;
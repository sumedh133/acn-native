import React from 'react';
import { Modal, View,Text, StyleSheet, SafeAreaView } from 'react-native';
import PropTypes from 'prop-types';
import { OnboardingProvider, useOnboardingContext } from './OnboardingContext';
import WelcomeScreen from '../screens/WelcomeScreen';
import TrialInfoScreen from '../screens/TrialInfoScreen';
import BenefitsScreen from '../screens/BenefitsScreen';
import SuccessScreen from '../screens/SuccessScreen';
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';


interface OnboardingFlowProps {
  visible: boolean;
  onComplete: () => void;
  onClose: () => void;
}

const OnboardingFlowContent: React.FC<OnboardingFlowProps> = ({ visible, onComplete, onClose }) => {
  const { currentStep, nextStep, resetOnboarding, onboardingCompleted } = useOnboardingContext();
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  React.useEffect(() => {
    if (onboardingCompleted) {
      try {
        logEvent(analytics, 'onboarding_flow_complete', {
          event_category: 'onboarding',
          event_label: 'completion',
          total_steps: 4,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging onboarding completion:', error);
      }
      onComplete();
    }
  }, [onboardingCompleted, onComplete]);

  const closeOnboarding = (): void => {
    try {
      logEvent(analytics, 'onboarding_flow_exit', {
        event_category: 'onboarding',
        event_label: 'interaction',
        exit_step: currentStep,
        completed: false,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging onboarding exit:', error);
    }
    resetOnboarding();
    onClose();
  };
  
  const completeOnboarding = async() => {
    try {
      logEvent(analytics, 'onboarding_flow_success', {
        event_category: 'onboarding',
        event_label: 'success',
        steps_completed: currentStep + 1,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging onboarding success:', error);
    }
    nextStep();
    resetOnboarding();
  };

  const getScreenName = (step: number): string => {
    switch (step) {
      case 0: return 'Welcome';
      case 1: return 'Trial Info';
      case 2: return 'Benefits';
      case 3: return 'Success';
      default: return 'Unknown';
    }
  };

  React.useEffect(() => {
    if (visible) {
      try {
        logEvent(analytics, 'onboarding_screen_view', {
          event_category: 'onboarding',
          event_label: 'screen_view',
          screen_name: getScreenName(currentStep),
          step: currentStep,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging screen view:', error);
      }
    }
  }, [currentStep, visible]);

  console.log(currentStep, "le current step")
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
       style={{ flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
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
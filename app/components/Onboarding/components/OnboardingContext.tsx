import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingContextType {
  currentStep: number;
  nextStep: () => void;
  resetOnboarding: () => void;
  onboardingCompleted: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps): JSX.Element {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  
  // Initialize state from AsyncStorage on component mount
  useEffect(() => {
    const initializeState = async () => {
      try {
        // Load onboarding step
        const savedStep = await AsyncStorage.getItem('onboardingStep');
        if (savedStep !== null) {
          setCurrentStep(parseInt(savedStep, 10));
        }
        
        // Load onboarding completion status
        const completed = await AsyncStorage.getItem('onboardingCompleted');
        if (completed === 'true') {
          setOnboardingCompleted(true);
        }
      } catch (error) {
        console.error('Error loading onboarding state:', error);
      }
    };
    
    initializeState();
  }, []);
  
  const saveOnboardingProgress = async (step: number): Promise<void> => {
    try {
      await AsyncStorage.setItem('onboardingStep', step.toString());
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    }
  };
  
  const nextStep = (): void => {
    const newStep = currentStep + 1;
    setCurrentStep(newStep);
    saveOnboardingProgress(newStep);
    
    // Check if this is the last step and mark onboarding as completed if needed
    // You may need to adjust the final step number based on your flow
    if (newStep === 3) { // Assuming 3 is the final step index
      setOnboardingCompleted(true);
      AsyncStorage.setItem('onboardingCompleted', 'true').catch(error =>
        console.error('Error saving onboarding completion status:', error)
      );
    }
  };
  
  const resetOnboarding = (): void => {
    setCurrentStep(0);
    setOnboardingCompleted(false);
    saveOnboardingProgress(0);
    
    // Clear onboarding completed flag
    AsyncStorage.setItem('onboardingCompleted', 'false').catch(error =>
      console.error('Error resetting onboarding completion status:', error)
    );
  };
  
  const value: OnboardingContextType = {
    currentStep,
    nextStep,
    resetOnboarding,
    onboardingCompleted
  };
  
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext(): OnboardingContextType {
  const context = useContext(OnboardingContext);
  
  if (context === undefined) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider');
  }
  
  return context;
}
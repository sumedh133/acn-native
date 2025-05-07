import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/config/firebase';
import { updateAgentDocData } from '@/store/slices/agentSlice';
import { formatUnixDateTime, formatUnixDateWithMonth } from '@/app/helpers/getUnixDateTime';

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
  const dispatch = useDispatch();
  const cpId = useSelector((state: RootState) => state?.agent?.docData?.cpId);

  const nextStep = async() => {
    const newStep = currentStep + 1;
    setCurrentStep(newStep);

    if (newStep === 3) {
          const agentRef = doc(db, "agents", cpId);
          const updatedData={
            onboardingComplete: true,
            trialStartedAt: Math.floor(Date.now()/1000),
            monthlyCredits: 100,
            userType: "Trial",
            trialUsed:true,
          }
          await updateDoc(agentRef, updatedData);
          dispatch(updateAgentDocData(updatedData));
          setOnboardingCompleted(true);
    }
  };
  
  const resetOnboarding = (): void => {
    setCurrentStep(0);
    setOnboardingCompleted(false);
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
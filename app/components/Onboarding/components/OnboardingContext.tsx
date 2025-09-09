import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { updateAgentDocData } from "@/store/slices/agentSlice";
import {
  formatUnixDateTime,
  formatUnixDateWithMonth,
  getUnixDateTime,
} from "@/app/helpers/getUnixDateTime";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

interface OnboardingContextType {
  currentStep: number;
  nextStep: () => void;
  resetOnboarding: () => void;
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({
  children,
}: OnboardingProviderProps): JSX.Element {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [onboardingCompleted, setOnboardingCompleted] =
    useState<boolean>(false);
  const dispatch = useDispatch();
  const cpId = useSelector((state: RootState) => state?.agent?.docData?.cpId);
  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";

  const nextStep = async () => {
    const newStep = currentStep + 1;
    setCurrentStep(newStep);

    try {
      logEvent(analytics, "onboarding_step_complete", {
        event_category: "onboarding",
        event_label: "progress",
        previous_step: currentStep,
        new_step: newStep,
        user_type: userType,
      });

      if (newStep === 3) {
        const agentRef = doc(db, "acnAgents", cpId);
        const updatedData = {
          onboardingComplete: true,
          trialStartedAt: getUnixDateTime(),
          monthlyCredits: 100,
          userType: "Trial",
          trialUsed: true,
        };
        await updateDoc(agentRef, updatedData);
        dispatch(updateAgentDocData(updatedData));
        // setOnboardingCompleted(true);

        logEvent(analytics, "onboarding_complete", {
          event_category: "onboarding",
          event_label: "success",
          trial_activated: true,
          monthly_credits: 100,
          user_type: "Trial",
        });
      }
    } catch (error) {
      logEvent(analytics, "onboarding_error", {
        event_category: "onboarding",
        event_label: "error",
        step: newStep,
        error_message: error instanceof Error ? error.message : "Unknown error",
        user_type: userType,
      });
    }
  };

  const resetOnboarding = async () => {
    try {
      const agentRef = doc(db, "acnAgents", cpId);
      const updatedData = {
        onboardingComplete: false,
      };
      await updateDoc(agentRef, updatedData);
      dispatch(updateAgentDocData(updatedData));
      setCurrentStep(0);
      setOnboardingCompleted(false);

      logEvent(analytics, "onboarding_reset", {
        event_category: "onboarding",
        event_label: "interaction",
        previous_step: currentStep,
        user_type: userType,
      });
    } catch (error) {
      logEvent(analytics, "onboarding_reset_error", {
        event_category: "onboarding",
        event_label: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
        user_type: userType,
      });
    }
  };

  const value: OnboardingContextType = {
    currentStep,
    nextStep,
    resetOnboarding,
    onboardingCompleted,
    setOnboardingCompleted,
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
    throw new Error(
      "useOnboardingContext must be used within an OnboardingProvider"
    );
  }

  return context;
}

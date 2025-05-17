import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import OnboardingCard from "../components/OnboardingCard";
import PrimaryButton from "../components/PrimaryButton";
import BenefitItem from "../components/BenefitItem";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface BenefitsScreenProps {
  onContinue: () => void;
  onSkip: () => void;
}

const BenefitsScreen: React.FC<BenefitsScreenProps> = ({
  onContinue,
  onSkip,
}) => {
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";
  const benefits: string[] = [
    "100 Enquiries/Month",
    "Unlimited inventory listings every month (no enquiry limits)",
    "Unlimited requirement listings every month (no enquiry limits)",
    "Priority KAM Access",
    "Exclusive Access to Realestate Market Data and Marketplace Reports",
  ];

  const handleContinue = () => {
    try {
      logEvent(analytics, 'benefits_start_trial_click', {
        event_category: 'onboarding',
        event_label: 'interaction',
        benefits_shown: benefits.length,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging benefits continue:', error);
    }
    onContinue();
  };

  const handleSkip = () => {
    try {
      logEvent(analytics, 'benefits_skip', {
        event_category: 'onboarding',
        event_label: 'interaction',
        benefits_shown: benefits.length,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging benefits skip:', error);
    }
    onSkip();
  };

  return (
    <View>
      <OnboardingCard>
        <View className="justify-between px-3 pt-9 pb-5">
          <TouchableOpacity className="self-end" onPress={handleSkip}>
            <Text className="text-gray-400 text-2xl">✕</Text>
          </TouchableOpacity>

          <View className="items-center mb-6">
            <Image
              source={require("../../../../assets/images/benefits-image.png")}
              className="w-85 h-60 rounded-md opacity-90"
              resizeMode="contain"
            />
          </View>

          <Text
            className="text-lg text-[#433F3E] text-center mb-6"
            style={{ fontFamily: "Montserrat_700Bold" }}
          >
            What you will get?
          </Text>

          <View className="mb-12 ">
            {benefits.map((benefit, index) => (
              <BenefitItem key={index} text={benefit} />
            ))}
          </View>
          
          <View className="px-6">
          <PrimaryButton
            title="Start My Free Trial"
            onPress={handleContinue}
            className="mt-4"
          />
          </View>

          <Text className="text-[10px] text-[#726C6C] text-center mt-4">
            You can upgrade or cancel anytime.**
          </Text>
        </View>
      </OnboardingCard>
    </View>
  );
};

BenefitsScreen.propTypes = {
  onContinue: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
};

export default BenefitsScreen;

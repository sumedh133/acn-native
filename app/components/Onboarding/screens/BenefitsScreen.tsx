import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import OnboardingCard from "../components/OnboardingCard";
import PrimaryButton from "../components/PrimaryButton";
import BenefitItem from "../components/BenefitItem";

interface BenefitsScreenProps {
  onContinue: () => void;
  onSkip: () => void;
}

const BenefitsScreen: React.FC<BenefitsScreenProps> = ({
  onContinue,
  onSkip,
}) => {
  const benefits: string[] = [
    "100 Enquiries/Month",
    "Unlimited inventory listing every month (no empty limits)",
    "⁠⁠⁠Unlimited requirement listings every month (no enquiry limits)",
    "Priority KAM Access",
    "Exclusive Access to Realestate Market Data and Marketplace Reports",
  ];

  return (
    <View>
      <OnboardingCard>
        <View className="justify-between px-3 pt-9 pb-5">
          <TouchableOpacity className="self-end" onPress={onSkip}>
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
            onPress={onContinue || (() => {})}
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

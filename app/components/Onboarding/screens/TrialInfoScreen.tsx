import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import OnboardingCard from "../components/OnboardingCard";
import PrimaryButton from "../components/PrimaryButton";
import { router } from "expo-router";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface TrialInfoScreenProps {
  onContinue: () => void;
  onSkip: () => void;
}

const TrialInfoScreen: React.FC<TrialInfoScreenProps> = ({
  onContinue,
  onSkip,
}) => {
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  const handleClick = () => {
    try {
      logEvent(analytics, 'trial_info_see_plans', {
        event_category: 'onboarding',
        event_label: 'navigation',
        destination: 'compare_plans',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging see plans:', error);
    }
    router.push("/(pages)/ComparePlans");
    onSkip();
  };

  const handleContinue = () => {
    try {
      logEvent(analytics, 'trial_info_start_trial', {
        event_category: 'onboarding',
        event_label: 'interaction',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging trial start:', error);
    }
    onContinue();
  };

  const handleSkip = () => {
    try {
      logEvent(analytics, 'trial_info_skip', {
        event_category: 'onboarding',
        event_label: 'interaction',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging skip:', error);
    }
    onSkip();
  };

  return (
    <View className="">
      <OnboardingCard>
        <View className="justify-between pt-[124px] px-6 pb-9">
          <TouchableOpacity
            className="self-end -top-10 -right-5 size[28px]"
            onPress={handleSkip}
          >
            <Text className="text-gray-400 text-[26px]">✕</Text>
          </TouchableOpacity>

          <View className="gap-4">
            <View className="bg-[#0A0B0A] py-2 px-2 self-center rounded-[4px] ">
              <Text className="text-white text-[10px] items-center font-bold">
                WELCOME OFFER!
              </Text>
            </View>

            <Text
              className="text-lg  text-center mb-3 text-[#433F3E]"
              style={{ fontFamily: "Montserrat_700Bold" }}
            >
              You're In! Let's Set You Up for Success
            </Text>

            <Text className="text-sm text-center font-medium text-[#464748] ">
              Unlock unlimited enquiries, verified-agent contacts & priority
              support—no card needed.
            </Text>
          </View>

          <View className="items-center ">
            <Image
              source={require("../../../../assets/images/gift-image.png")}
              className="w-screen h-80 opacity-90"
              resizeMode="contain"
            />
          </View>

          <PrimaryButton
            title="Start Free Trial"
            onPress={handleContinue}
            className="mb-2"
          />

          <TouchableOpacity 
            className="items-center pt-2"
            onPress={handleClick}
          >
            <Text className="text-[#1B665D] text-xs font-bold" style={{fontFamily:"Lato"}}>See paid plans</Text>
          </TouchableOpacity>

          <Text className="text-[10px] font-normal text-[#726C6C] text-center mt-4">
            You can upgrade or cancel anytime. Listings are hidden once limits are reached in the limited plan.**
          </Text>
        </View>
      </OnboardingCard>
    </View>
  );
};

TrialInfoScreen.propTypes = {
  onContinue: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
};

export default TrialInfoScreen;

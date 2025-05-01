import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import OnboardingCard from "../components/OnboardingCard";
import PrimaryButton from "../components/PrimaryButton";

interface TrialInfoScreenProps {
  onContinue: () => void;
  onSkip: () => void;
}

const TrialInfoScreen: React.FC<TrialInfoScreenProps> = ({
  onContinue,
  onSkip,
}) => {
  return (
    <View className="">
      <OnboardingCard>
        <View className="justify-between pt-[124px] px-6 pb-9">
          <TouchableOpacity
            className="self-end -top-10 -right-5 size[28px]"
            onPress={onSkip}
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
              You’re In! Let’s Set You Up for Success
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
            onPress={onContinue || (() => {})}
            className="mb-2"
          />

          <TouchableOpacity className="items-center pt-1">
            <Text className="text-[#1B665D] text-xs" style={{ fontFamily: "Montserrat_700Bold" }}>See paid plans</Text>
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

import React from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import PropTypes from "prop-types";
import OnboardingCard from "../components/OnboardingCard";
import PrimaryButton from "../components/PrimaryButton";

interface WelcomeScreenProps {
  onContinue: () => void;
  onSkip: () => void;
}
const { width, height } = Dimensions.get("window");

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onContinue,
  onSkip,
}) => {
  return (
    <View className="w-full">
      <OnboardingCard >
        <View className="items-center mb-4  w-full relative">
          <TouchableOpacity
            className="absolute -right-2 top-5 z-10 px-1.5 py-1 rounded-full bg-gray-400 "
            onPress={onSkip}
          >
            <Text className="text-white text-md font-bold">✕</Text>
          </TouchableOpacity>
          <Image
            source={require("../../../../assets/images/welcome-image.png")}
            className="rounded-md"
            style={{width:width ,height:width*0.9}}
            resizeMode="contain"
          />
        </View>

        <Text className="text-xs text-[#898483] font-bold text-center mb-2">
          WELCOME TO ACN
        </Text>

        <Text className="text-lg text-center mb-6" style={{fontFamily: "Montserrat_700Bold"}}>
          Multiple Agents. One Mission.{"\n"}One Network.
        </Text>

        <PrimaryButton title="Continue →" onPress={onContinue || (() => {})} />
      </OnboardingCard>
    </View>
  );
};

WelcomeScreen.propTypes = {
  onContinue: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
};

export default WelcomeScreen;

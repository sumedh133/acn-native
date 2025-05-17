import React from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import PropTypes from "prop-types";
import OnboardingCard from "../components/OnboardingCard";
import PrimaryButton from "../components/PrimaryButton";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface WelcomeScreenProps {
  onContinue: () => void;
  onSkip: () => void;
}
const { width, height } = Dimensions.get("window");

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onContinue,
  onSkip,
}) => {
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";

  const handleContinue = () => {
    try {
      logEvent(analytics, 'welcome_continue', {
        event_category: 'onboarding',
        event_label: 'interaction',
        screen_width: width,
        screen_height: height,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging continue:', error);
    }
    onContinue();
  };

  const handleSkip = () => {
    try {
      logEvent(analytics, 'welcome_skip', {
        event_category: 'onboarding',
        event_label: 'interaction',
        screen_width: width,
        screen_height: height,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging skip:', error);
    }
    onSkip();
  };

  return (
    <View className="w-full">
      <OnboardingCard >
        <View className="items-center mb-4  w-full relative">
          <TouchableOpacity
            className="absolute -right-1.5 top-2 z-10 px-2 py-1 rounded-full bg-[#BABABA] "
            onPress={handleSkip}
          >
            <Text className="text-black text-md font-bold">✕</Text>
          </TouchableOpacity>
          <Image
            source={require("../../../../assets/images/welcome-image.png")}
            className="-top-2"
            style={{width:width ,height:width*0.9,
              borderTopLeftRadius: 12,  
              borderTopRightRadius: 12, 
              overflow: 'hidden',
              opacity:80, 
              }}
            // resizeMode="contain"
          />
        </View>

        <Text className="text-xs text-[#898483] font-bold text-center mb-2">
          WELCOME TO ACN
        </Text>

        <Text className="text-lg text-center mb-6" style={{fontFamily: "Montserrat_700Bold"}}>
          Multiple Agents. One Mission.{"\n"}One Network.
        </Text>

        <PrimaryButton title="Continue →" onPress={handleContinue} />
      </OnboardingCard>
    </View>
  );
};

WelcomeScreen.propTypes = {
  onContinue: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
};

export default WelcomeScreen;

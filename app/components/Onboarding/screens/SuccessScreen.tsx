import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import OnboardingCard from "../components/OnboardingCard";
import PrimaryButton from "../components/PrimaryButton";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface SuccessScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({
  onComplete,
  onSkip,
}) => {
  return (
    <View>
      <OnboardingCard>
        <View className="px-3 py-5">
          <TouchableOpacity className="self-end" onPress={onSkip}>
            <Text className="text-[#9F9C9C] text-2xl">✕</Text>
          </TouchableOpacity>

          <View className="items-center mb-6 mt-4">
              <MaterialIcons name="verified" size={70} color="#09B285" />
          </View>

          <Text
            className="text-lg text-center mb-1"
            style={{ fontFamily: "Montserrat_700Bold" }}
          >
            Congratulations! Your ACN Premium Free Trial Has Been Activated.
          </Text>

          <Text className="text-sm text-center font-medium text-[#464748] mb-6 px-3">
            You now have full access for the next 30 days to all premium
            services.
          </Text>
          <View className="px-3">
          <PrimaryButton
            title="Go to Properties"
            onPress={onComplete || (() => {})}
          />
          </View>
        </View>
      </OnboardingCard>
    </View>
  );
};

SuccessScreen.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
};

export default SuccessScreen;

import DoubleRightArrowIcon from "@/assets/icons/svg/Common/DoubleRightArrow";
import PremiumIcon from "@/assets/icons/svg/ProfilePage/PremiumIcon";
import { RootState } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSelector } from "react-redux";
import OnboardingFlow from "../Onboarding";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

const GetPremiumCard = ({
  handleClick,
  slug,
}: {
  handleClick: (slug: string) => void;

  slug: string;
}) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const trialUsed: boolean | null =
    useSelector(
      (state: RootState) => state?.agent?.docData?.trialUsed
    ) || false;
  const userType = useSelector((state: RootState) => state?.agent?.docData?.userType) || "free";
    

  const handleStartTrial = () => {
    try {
      logEvent(analytics, 'premium_trial_click', {
        event_category: 'profile',
        event_label: 'interaction',
        trial_used: trialUsed,
        platform: Platform.OS,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging trial start:', error);
    }

    if (!trialUsed) {
      setShowOnboarding(true);
    } else {
      if (Platform.OS !== "ios") {
            router.push({
              pathname: "/CheckoutScreen",
              params: { planId: "premium" },
            });
          } else {
            router.push("/billings");
          }
    }
  };

  const handleComparePlans = () => {
    try {
      logEvent(analytics, 'compare_plans_click', {
        event_category: 'profile',
        event_label: 'navigation',
        source: 'premium_card',
        platform: Platform.OS,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging compare plans:', error);
    }
    handleClick(slug);
  };

  return (
    <>
      <LinearGradient
        colors={["#153E3B", "#05635C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientContainer}
      >
        <View className="flex-row justify-between">
          <View>
            <Text
              className="text-white text-lg"
              style={{ fontFamily: "Montserrat_700Bold" }}
            >
              ACN Premium
            </Text>
            <Text className="text-white text-xl font-extrabold mt-1">
              {/* {Platform.OS !== 'ios' && */}
                ₹10,000/year!
              {/* } */}
            </Text>
          </View>
          <View className="justify-center">
            <Ionicons
              name="people-circle-outline"
              size={40}
              color="rgba(255,255,255,0.8)"
            />
          </View>
        </View>

        <View className="border-t border-[#FAFAFA] my-4" />

        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <View className="w-2 h-2 bg-white font-normal rounded-full mr-2" />
            <Text className="text-white text-sm" style={{ fontFamily: "Lato_400Regular" }}>Unlimited enquiries</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <View className="w-2 h-2 bg-white rounded-full mr-2" />
            <Text className="text-white text-sm" style={{ fontFamily: "Lato_400Regular" }}>Priority KAM support</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 bg-white rounded-full mr-2" />
            <Text className="text-white text-sm" style={{ fontFamily: "Lato_400Regular" }}>Exclusive market features</Text>
          </View>
        </View>

        {/* {Platform.OS !== 'ios' ? ( */}
          <TouchableOpacity
            className=" py-3 rounded-md mb-2 bg-white"
            onPress={handleStartTrial}
          >
            <Text
              className="text-center text-sm text-[#153E3B]"
              style={{ fontFamily: "Lato_700Bold" }}
            >
              {!trialUsed ? "1 month free trial" : 'Get Premium'}
            </Text>
          </TouchableOpacity>
        {/* ) : null} */}

        <TouchableOpacity
          className={`flex-row justify-center items-center gap-1 text-white`}
          // ${Platform.OS === 'ios' ? "bg-white  py-3 rounded-md mb-2" : "text-white"}
          onPress={handleComparePlans}
        >
          <Text
            className={`text-sm text-white`}
            // ${Platform.OS === 'ios' ? "text-[#10302D]" : "text-white"}
            style={{ fontFamily: "Lato_700Bold" }}
          >
            {/* {Platform.OS === 'ios' ? "View Details" : */}
              Compare Plans
            {/* } */}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={"white"}
            // Platform.OS === 'ios' ? "#10302D" : "white"
          />
        </TouchableOpacity>
      </LinearGradient>
      {showOnboarding && (
        <OnboardingFlow
          visible={showOnboarding}
          onComplete={() => {
            setShowOnboarding(false);
          }}
          onClose={() => {
            setShowOnboarding(false);
          }}
        />
      )}
    </>
  );
};

export default React.memo(GetPremiumCard);

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: 8,
    padding: 20,
    overflow: "hidden",
  },

  card: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 24,
    backgroundColor: "#1B665D",
    borderWidth: 1,
    borderColor: "#10302D",
    borderRadius: 24,
    marginBottom: 17,
  },
  informationContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  textContainer: {
    width: 215,
  },
  text: {
    fontFamily: "Lato",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: 500,
    color: "#CCCBCB",
  },
  textBold: {
    fontFamily: "Lato",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: 700,
    color: "#FFFFFF",
  },
  button: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F9D274",
    borderRadius: 6,
    marginBottom: -17,
  },
  buttonText: {
    fontFamily: "Lato",
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 21,
    color: "#000000",
  },
});

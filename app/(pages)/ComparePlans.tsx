import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Offline from "../components/Offline";
import OnboardingFlow from "../components/Onboarding";
import { logEvent } from "@react-native-firebase/analytics";
import { analytics } from "../config/firebase";

import Basic from "@/assets/icons/paperPlane.svg";
import Premium from "@/assets/icons/paperPlanePremium.svg";

const ComparePlans = () => {
  const router = useRouter();
  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  const { docData: agentData } = useSelector((state: RootState) => state.agent);
  const userType = agentData?.userType || "free";

  const [showOnboarding, setShowOnboarding] = useState(false);

  // Add page view tracking
  useEffect(() => {
    try {
      logEvent(analytics, "compare_plans_page_view", {
        event_category: "plans",
        event_label: "page_view",
        platform: Platform.OS,
        user_type: userType,
        trial_used: agentData?.trialUsed || false,
      });
    } catch (error) {
      console.error("Error logging page view:", error);
    }
  }, [agentData, userType]);

  if (!isConnectedToInternet) return <Offline />;

  const handlePremiumPlanClick = () => {
    try {
      logEvent(analytics, "premium_plan_click", {
        event_category: "plans",
        event_label: "premium_subscription",
        platform: Platform.OS,
        price: "10000",
        currency: "INR",
        billing_period: "yearly",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging premium plan click:", error);
    }

    if (Platform.OS !== "ios") {
      router.push({
        pathname: "/CheckoutScreen",
        params: { planId: "premium" },
      });
    } else {
      // router.push("/billings");
      router.push({
        pathname: "/billings",
        params: { planId: "premium" },
      });
    }
  };

  const handleTrialStart = () => {
    try {
      logEvent(analytics, "trial_start_click", {
        event_category: "plans",
        event_label: "free_trial",
        platform: Platform.OS,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging trial start:", error);
    }
    setShowOnboarding(true);
  };

  const handleSupportClick = () => {
    try {
      logEvent(analytics, "support_click", {
        event_category: "plans",
        event_label: "support",
        platform: Platform.OS,
        source: "compare_plans",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging support click:", error);
    }
    const whatsappUrl = `https://wa.me/+919415006092`;
    Linking.openURL(whatsappUrl);
  };

  const plans = [
    {
      name: "ACN Basic",
      label: "Current Plan",
      tagline: "For New Agents",
      price: "₹0",
      period: "per year",
      color: "text-[#2D635E]",
      textColor: "text-black",
      bgColor: "bg-white",
      borderColor: "border-[#E5E7EB]",
      iconBgColor: "bg-[#E0F9F6]",
      iconColor: "#1E3A37",
      features: [
        { name: "5 Enquiry Credits/Month", included: true },
        {
          name: "Unlimited Inventory Listings (until 5 enquiries)",
          included: true,
        },
        {
          name: "Unlimited Requirement Listings (until 5 enquiries)",
          included: true,
        },
        { name: "Standard KAM Support", included: true },
      ],
      description:
        "Get started with limited features. Perfect for testing the platform.",
      primaryButton: {
        text: "Current Plan",
        disabled: true,
      },
    },
    {
      name: "ACN Premium",
      label: "Recommended",
      tagline: "For Professionals",
      price: "₹9,999",
      period: Platform.OS === "ios" ? "for one year" : "per year",
      monthlyPrice:
        Platform.OS === "ios" ? "(inclusive of all taxes)" : "(₹833/month)",
      color: "text-white",
      textColor: "text-white",
      bgColor: "bg-[#1E3A37]",
      borderColor: "border-[#1E3A37]",
      iconBgColor: "bg-[#E0F9F6]",
      iconColor: "#1E3A37",
      features: [
        { name: "100 Enquiries/Month", included: true },
        {
          name: "Unlimited inventory listings every month (no enquiry limits)",
          included: true,
        },
        {
          name: "Unlimited requirement listings every month (no enquiry limits)",
          included: true,
        },
        { name: "Priority KAM Access", included: true },
        {
          name: "Exclusive Access to Resale Market Data and Micromarket Reports",
          included: true,
        },
        // {
        //   name: "Validity: 1 year",
        //   included: true,
        // },
      ],
      description: "Unlock ACN's full potential with additional features.",
      primaryButton: {
        text: "Unlock Full Access",
        action: handlePremiumPlanClick,
      },
      secondaryButton: {
        text: "Start 1 month trial",
        action: handleTrialStart,
      },
    },
  ];

  return (
    <>
      <SafeAreaView className="flex-1 pb-2">
        <ScrollView className="pb-2 bg-[#EEEEEE] gap-6">
          <View className="px-4 pt-6 mt-2">
            {Platform.OS != "ios" && (
              <Text
                className="text-lg  text-black text-center mb-2"
                style={{ fontFamily: "Montserrat_700Bold" }}
              >
                Choose the right plan for you
              </Text>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: 10,
              gap: 16,
            }}
          >
            {plans.map((plan, index) => (
              <View
                key={index}
                style={{ width: Dimensions.get("window").width * 0.75 }}
                className={`rounded-xl border ${
                  index === 0
                    ? "bg-white border-[#E5E7EB]"
                    : "bg-[#1E3A37] border-[#1E3A37]"
                } p-5`}
              >
                <View className="py-1 mr-auto w-auto">
                  <View className="px-3 py-1 rounded-[8px] -mt-2.5 bg-[#FFF2D9]">
                    <Text className="text-[14px] font-medium text-[#000000]">
                      {plan.label}
                    </Text>
                  </View>
                </View>

                <View className="flex flex-row pt-4 mt-4 mb-3 gap-4">
                  <View className="mb-2">
                    {/* <View className="w-14 h-14 rounded-full bg-[#E0F9F6] items-center justify-center">
                      <View
                        className={`${
                          index === 0
                            ? "w-5 h-5 rounded-full"
                            : "w-4 h-4 rounded-full"
                        } bg-[#1E3A37]`}
                      />
                    </View> */}
                    {index === 0 ? <Basic /> : <Premium />}
                  </View>
                  <View>
                    <Text
                      className={`text-sm font-medium mb-1 ${
                        index === 0 ? "text-[#726C6C]" : "text-[#CCCBCB]"
                      }`}
                    >
                      {plan.tagline}
                    </Text>
                    <Text
                      style={{ fontFamily: "Montserrat_700Bold" }}
                      className={`text-[16px] mb-2 leading-[150%] tracking-[0.25px] align-middle ${
                        index === 0 ? "text-[#0A0B0A]" : "text-white"
                      }`}
                    >
                      {plan.name}
                    </Text>
                  </View>
                </View>

                <Text
                  className={`text-sm font-medium mb-4 ${
                    index === 0 ? "text-[#0A0B0A]" : "text-white"
                  }`}
                >
                  {plan.description}
                </Text>

                {/* {Platform.OS !== "ios" && ( */}
                <View className="flex flex-row items-end mb-4 gap-2">
                  <Text
                    style={{ fontFamily: "Montserrat_700Bold" }}
                    className={`text-3xl  ${
                      index === 0 ? "text-[#111827]" : "text-white"
                    }`}
                  >
                    {plan.price}
                  </Text>
                  <View>
                    <Text
                      style={{ fontFamily: "Montserrat_500Medium" }}
                      className={`text-lg  ${
                        index === 0 ? "text-[#6B7280]" : "text-[#CCCBCB]"
                      }`}
                    >
                      {plan.period}
                    </Text>
                    {plan.monthlyPrice && (
                      <Text
                        style={{ fontFamily: "Montserrat_500Medium" }}
                        className={`text-[16px]  ${
                          index === 0 ? "text-[#6B7280]" : "text-[#CCCBCB]"
                        }`}
                      >
                        {plan.monthlyPrice}
                      </Text>
                    )}
                  </View>
                </View>
                {/* )} */}

                {/* <View className="h-px bg-gray-200 my-4" /> */}

                <Text
                  style={{ fontFamily: "Montserrat_700Bold" }}
                  className={`text-base mb-4 ${
                    index === 0 ? "text-[#000000]" : "text-white"
                  }`}
                >
                  What's included :
                </Text>

                <View className="mb-4">
                  {plan?.features?.map((feature, fidx) => (
                    <View key={fidx} className="flex-row items-start mb-3">
                      <View
                        className={`w-5 h-5 rounded-full justify-center items-center mr-2 mt-0.5 ${
                          index === 0 ? "bg-[#153E3B]" : "bg-[#F4FBF8]"
                        }`}
                      >
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={index === 0 ? "#FFFFFF" : "#153E3B"}
                        />
                      </View>
                      <Text
                        className={`text-base font-medium flex-1 ${
                          index === 0 ? "text-[#0A0B0A]" : "text-[#F4FBF8]"
                        }`}
                      >
                        {feature.name}
                      </Text>
                    </View>
                  ))}
                  {Platform.OS === "ios" && index != 0 && (
                    <View className="flex-row items-start mb-3">
                      <View
                        className={`w-5 h-5 rounded-full justify-center items-center mr-2 mt-0.5 bg-[#F4FBF8]`}
                      >
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={"#153E3B"}
                        />
                      </View>
                      <Text
                        className={`text-base font-medium flex-1 text-[#F4FBF8]`}
                      >
                        Validity: 1 Year
                      </Text>
                    </View>
                  )}
                </View>

                {/* {Platform.OS === "ios" ? (
                  <>
                    {index === 1 && (
                      <View className="mt-4">
                        <Text className="text-sm text-white/70">
                          <Text className="font-bold">Note:</Text>{" "}
                          <Text>
                            Credit top-ups aren't available through the app. For
                            assistance, please contact{" "}
                            <Text
                              className="text-[#007AFF] underline"
                              onPress={handleSupportClick}
                            >
                              ACN Support.
                            </Text>
                          </Text>
                        </Text>
                      </View>
                    )}
                  </>
                ) : ( */}
                <View className="gap-2 mt-auto">
                  {index === 1 && (
                    <>
                      {!agentData.trialUsed && (
                        <TouchableOpacity
                          className="py-2 h-[40px] rounded-md items-center bg-white"
                          onPress={plan.secondaryButton?.action}
                        >
                          <Text className="text-sm font-medium text-[#153E3B]">
                            {plan.secondaryButton?.text}
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        className="py-2 h-[40px] rounded-md items-center bg-[#1E3A37] border border-white"
                        onPress={plan.primaryButton.action}
                      >
                        <Text className="text-sm font-medium text-white">
                          {plan.primaryButton.text}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
                {/* )} */}
              </View>
            ))}
          </ScrollView>

          {Platform.OS === "ios" && (
            <Text className="w-full px-[16px] py-[6px] items-center justify-center text-center font-lato font-medium text-[12px] leading-[150%] text-[#8A8A8A]">
              Please read our{" "}
              <Text
                className="font-bold underline p-2"
                onPress={() =>
                  router.push({
                    pathname: "/(pages)/Legal",
                    params: { id: "privacy" },
                  })
                }
              >
                Privacy Policy
              </Text>{" "}
              and{" "}
              <Text
                className="font-bold underline p-2"
                onPress={() =>
                  router.push({
                    pathname: "/(pages)/Legal",
                    params: { id: "tnc" },
                  })
                }
              >
                Terms of Use
              </Text>
              .
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
      {showOnboarding && (
        <OnboardingFlow
          visible={showOnboarding}
          onComplete={() => {
            try {
              logEvent(analytics, "trial_onboarding_complete", {
                event_category: "plans",
                event_label: "onboarding",
                platform: Platform.OS,
                user_type: userType,
              });
            } catch (error) {
              console.error("Error logging onboarding completion:", error);
            }
            setShowOnboarding(false);
          }}
          onClose={() => {
            try {
              logEvent(analytics, "trial_onboarding_closed", {
                event_category: "plans",
                event_label: "onboarding",
                platform: Platform.OS,
                user_type: userType,
              });
            } catch (error) {
              console.error("Error logging onboarding closure:", error);
            }
            setShowOnboarding(false);
          }}
        />
      )}
    </>
  );
};

export default React.memo(ComparePlans);

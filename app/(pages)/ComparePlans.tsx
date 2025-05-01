import React from "react";
import {
  SafeAreaView,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Offline from "../components/Offline";

const ComparePlans = () => {
  const router = useRouter();
  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  if (!isConnectedToInternet) return <Offline />;

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
      price: "₹10,000",
      period: "per year",
      monthlyPrice: "(₹833/month)",
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
      ],
      description: "Unlock ACN's full potential with additional features.",
      primaryButton: {
        text: "Unlock Full Access",
        action: () => router.push("/billings"),
      },
      secondaryButton: {
        text: "Start 1 month trial",
        action: () => router.push("/billings"),
      },
    },
  ];

  return (
    <SafeAreaView className="flex-1 pb-2">
      <ScrollView className="pb-2 bg-[#EEEEEE] gap-6">
        <View className="px-4 pt-6 mt-2">
          <Text className="text-lg  text-black text-center mb-2" style={{fontFamily: "Montserrat_700Bold"}}>
            Choose the right plan for you
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 8,
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
                  <View className="w-14 h-14 rounded-full bg-[#E0F9F6] items-center justify-center">
                    <View
                      className={`${
                        index === 0
                          ? "w-5 h-5 rounded-full"
                          : "w-4 h-4 rounded-full"
                      } bg-[#1E3A37]`}
                    />
                  </View>
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
                    style={{fontFamily: "Montserrat_700Bold"}}
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

              <View className="flex flex-row items-end mb-4 gap-2">
                <Text
                style={{fontFamily: "Montserrat_700Bold"}}
                  className={`text-3xl  ${
                    index === 0 ? "text-[#111827]" : "text-white"
                  }`}
                >
                  {plan.price}
                </Text>
                <View>
                  <Text
                    style={{fontFamily: "Montserrat_500Medium"}}
                    className={`text-lg  ${
                      index === 0 ? "text-[#6B7280]" : "text-[#CCCBCB]"
                    }`}
                  >
                    {plan.period}
                  </Text>
                  {plan.monthlyPrice && (
                    <Text
                      style={{fontFamily: "Montserrat_500Medium"}}
                      className={`text-[16px]  ${
                        index === 0 ? "text-[#6B7280]" : "text-[#CCCBCB]"
                      }`}
                    >
                      {plan.monthlyPrice}
                    </Text>
                  )}
                </View>
              </View>

              {/* <View className="h-px bg-gray-200 my-4" /> */}

              <Text
                style={{fontFamily: "Montserrat_700Bold"}}
                className={`text-base mb-4 ${
                  index === 0 ? "text-[#000000]" : "text-white"
                }`}
              >
                What's included :
              </Text>

              <View className="mb-4">
                {plan.features.map((feature, fidx) => (
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
              </View>

              <View className="gap-2 mt-auto">
                {index === 1 && (
                  <>
                    <TouchableOpacity
                      className="py-2 h-[40px] rounded-md items-center bg-white"
                      onPress={plan.secondaryButton.action}
                    >
                      <Text className="text-sm font-medium text-[#153E3B]">
                        {plan.secondaryButton.text}
                      </Text>
                    </TouchableOpacity>

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
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default React.memo(ComparePlans);

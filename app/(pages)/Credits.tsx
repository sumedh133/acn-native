import React from "react";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import ARPrimaryButton from "../components/Button/ARPrimaryButton";
import CoinIcon from "@/assets/icons/svg/Sidebar/CoinIcon";
import GetPremiumCard from "../components/ProfilePage/GetPremiumCard";

const Credits = () => {
  const router = useRouter();
  const monthlyCredits = useSelector(
    (state: RootState) => state?.agent?.docData?.monthlyCredits
  );
  const userType: string | null =
    useSelector((state: RootState) => state?.agent?.docData?.userType) || "";

  const handleBackPress = () => {
    router.back();
  };

  const handleAddCredits = () => {
    router.push("/billings");
  };

  const handleStartTrial = () => {
    // Handle trial subscription logic
    console.log("Starting 1 month free trial");
  };

  const handleComparePlans = () => {
    // Navigate to plans comparison
    router.push("/ComparePlans");
  };

  const handleViewMore = () => {
    // Handle view more enquiries
    console.log("View more enquiries");
  };

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 flex flex-col space-y-4 ">
          {/* Credits Card */}
          <View className="bg-yellow-50 rounded-xl p-5 border border-yellow-200 relative overflow-hidden">
            <Text className="font-lato text-sm text-gray-600">
              Available Credits
            </Text>
            <Text className="font-montserrat-bold text-4xl font-bold mt-1 mb-1">
              230
            </Text>
            <Text className="font-lato text-xs text-gray-600 max-w-[80%]">
              Did you know? On Avg. agents spend 15 credits/week
            </Text>
            <View className="absolute right-5 top-5">
              <CoinIcon width={40} height={40} />
            </View>
          </View>

          {/* Buy More Credits Card */}
          <View className="bg-white rounded-xl p-5 border border-gray-200">
            <Text className="font-montserrat-bold text-lg font-bold mb-2">
              Need more enquiries?
            </Text>
            <Text className="font-lato text-sm text-[#433F3E] mb-4">
              Credits are needed to get agent's contact details on ACN Platform.
            </Text>

            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="font-heading text-4xl font-bold text-[#153E3B]">
                  ₹249
                </Text>
                <Text className="font-lato text-xs text-[#153E3B]">
                  Price is all-inclusive**
                </Text>
              </View>

              <TouchableOpacity
                className="bg-[#153E3B] rounded-lg py-3.5 px-5"
                onPress={handleAddCredits}
              >
                <Text className="text-white font-montserrat-semibold font-semibold text-sm">
                  Add 5 Credits
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-[#1B665D1A] rounded-lg p-3 flex-row items-center">
              <View className="w-5 h-5 rounded-full bg-white border border-gray-300 justify-center items-center mr-2">
                <Text className="text-xs text-gray-600">i</Text>
              </View>
              <Text className=" text-sm">5 credits = 5 fresh leads</Text>
            </View>
          </View>

          {userType !== "premium" && (
            <View>
              <GetPremiumCard
                handleClick={handleComparePlans}
                slug={"get_premium"}
              />
            </View>
          )}

          {/* Recent Enquiries Section */}
          <View className="bg-white rounded-xl p-5 border border-gray-200">
            <Text className="font-montserrat-bold text-lg font-bold mb-4 text-center">
              Recent Enquiries
            </Text>

            {/* Enquiry Items */}
            {[1, 2, 3].map((item, index) => (
              <View key={index} className="mb-3">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="font-lato text-sm font-medium text-gray-900">
                      Tangled Up In The Green - Total Environment
                    </Text>
                    <Text className="font-lato text-xs text-gray-500 mt-1">
                      1 Sep 2024, 06:16PM
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Text className="font-montserrat-bold text-base font-bold text-red-600 mr-2">
                      - 1
                    </Text>
                    <View className="w-3 h-3 rounded-full bg-yellow-400" />
                  </View>
                </View>

                {index < 2 && <View className="h-px bg-gray-200 my-3" />}
              </View>
            ))}

            <TouchableOpacity
              className="items-center mt-2"
              onPress={handleViewMore}
            >
              <Text className="font-montserrat-semibold text-sm font-semibold text-green-900">
                View More
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Credits;

import React from "react";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import ARPrimaryButton from "../components/Button/ARPrimaryButton";
import CoinIcon from "@/assets/icons/svg/Sidebar/CoinIcon";
import GetPremiumCard from "../components/ProfilePage/GetPremiumCard";
import LinearGradient from "react-native-linear-gradient";
import CheckoutScreen from "./CheckoutScreen";

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
    router.push({
      pathname: '/CheckoutScreen',
      params: { planId: 'booster' }
    });
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
    <View className="flex-1 bg-[#EEEEEE]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 flex flex-col space-y-4 ">
          {/* Credits Card */}
          <LinearGradient
            
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 0 }} 
            colors={["#FFFFFF", "#FFF8D4"]} 
            locations={[0.4904, 1.0]} 
            style={{
              borderRadius: 12,
              padding: 20,
              borderWidth: 1,
              borderColor: "#FFF8D0",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Text className="font-lato font-medium text-sm text-[#595959]">
              Available Credits
            </Text>
            <Text
              className=" text-4xl  mt-1 mb-1"
              style={{ fontFamily: "Montserrat_700Bold" }}
            >
              230
            </Text>
            <Text className="font-lato font-normal text-xs text-gray-600 max-w-[80%]">
              Did you know? On Avg. agents spend 15 credits/week
            </Text>
            <View className="absolute right-5 top-5">
              <CoinIcon width={40} height={40} />
            </View>
          </LinearGradient>

          {/* Buy More Credits Card */}
          <View className="bg-white rounded-xl p-5 border border-gray-200">
            <Text
              className=" text-lg text-[#433F3E] mb-2"
              style={{ fontFamily: "Montserrat_700Bold" }}
            >
              Need more enquiries?
            </Text>
            <Text className="font-medium text-sm text-[#433F3E] mb-4">
              Credits are needed to get agent's contact details on ACN Platform.
            </Text>

            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text
                  className="font-heading text-[22px]  text-[#153E3B]"
                  style={{ fontFamily: "Montserrat_700Bold" }}
                >
                  ₹249
                </Text>
                <Text className="font-medium text-xs text-[#153E3B]">
                  Price is all-inclusive**
                </Text>
              </View>

              <TouchableOpacity
                className="bg-[#153E3B] rounded-lg py-3.5 px-5"
                onPress={handleAddCredits}
              >
                <Text
                  className="text-white text-sm"
                  style={{ fontFamily: "Montserrat_600SemiBold" }}
                >
                  Add 5 Credits
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-[#1B665D1A] rounded-lg p-3 flex-row justify-center items-center">
              <View className="w-5 h-5 rounded-full bg-white border border-gray-300 justify-center items-center mr-2">
                <Text className="text-xs text-[#757575]">i</Text>
              </View>
              <Text className=" text-sm font-bold" style={{fontFamily:"Lato"}}>
                5 credits = 5 fresh leads
              </Text>
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
          {/* <View className="bg-white rounded-xl p-5 border border-gray-200">
          <RecentEnquiries 
            enquiries={sampleEnquiries} 
            maxDisplay={3} 
            onViewMore={handleViewMoreEnquiries} 
          />
          </View> */}
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

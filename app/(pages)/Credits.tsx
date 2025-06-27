import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import ARPrimaryButton from "../components/Button/ARPrimaryButton";
import CoinIcon from "@/assets/icons/svg/Sidebar/CoinIcon";
import GetPremiumCard from "../components/ProfilePage/GetPremiumCard";
import LinearGradient from "react-native-linear-gradient";
import { logEvent } from "@react-native-firebase/analytics";
import { analytics } from "../config/firebase";

import CreditCoin from "../../assets/icons/CreditCoin.svg";

import { Property, Enquiry, EnquiryWithProperty } from "../types";
import {
  collection,
  DocumentData,
  documentId,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { formatUnixDate } from "../helpers/getUnixDateTime";
import { setPropertyDataThunk } from "@/store/slices/propertySlice";
import { useDispatch } from "react-redux";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";

interface UseEnquiriesResult {
  myEnquiries: EnquiryWithProperty[];
}

const useCpId = (): string | undefined => {
  const reduxCpId: string | undefined = useSelector(
    (state: RootState) => state.agent?.docData?.cpId
  );
  return reduxCpId;
};

const useEnquiries = (): UseEnquiriesResult => {
  const [myEnquiries, setMyEnquiries] = useState<EnquiryWithProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cpId = useCpId();

  useEffect(() => {
    if (!cpId) {
      setError("No channel partner ID found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      // Create the query the same way as before
      const enquiriesQuery = query(
        collection(db, "enquiries"),
        where("cpId", "==", cpId)
      );

      // Set up real-time listener for enquiries
      const unsubscribe = onSnapshot(
        enquiriesQuery,
        async (snapshot) => {
          const enquiriesData: Enquiry[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));

          // Now fetch property details for each of myEnquiries - keeping your original logic
          const propertyIds = [
            ...new Set(enquiriesData.map((enquiry) => enquiry.propertyId)),
          ];
          let propertyDocs: Map<string, DocumentData> = new Map();

          for (let i = 0; i < propertyIds.length; i += 30) {
            const batch = propertyIds.slice(i, i + 30);
            const properties = await getDocs(
              query(
                collection(db, "acnProperties"),
                where(documentId(), "in", batch)
              )
            );
            properties.docs.map((item) => {
              propertyDocs.set(item.id, item.data());
            });
          }

          const enquiriesWithProperty = enquiriesData.map((enquiry) => {
            if (enquiry.propertyId && propertyDocs.has(enquiry.propertyId)) {
              return {
                ...enquiry,
                property: {
                  ...propertyDocs.get(enquiry.propertyId),
                } as Property,
              };
            }
            // Return the enquiry without property if propertyId doesn't exist or fetch fails
            return {
              ...enquiry,
              property: null,
            };
          });

          setMyEnquiries(enquiriesWithProperty);
          setLoading(false);
        },
        (err) => {
          setError(err.message || "Error fetching enquiries");
          console.error("Fetch error:", err);
          setLoading(false);
        }
      );

      // Clean up the listener when the component unmounts
      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message || "Error fetching enquiries");
      console.error("Fetch error:", err);
      setLoading(false);
    }
  }, [cpId]);

  return { myEnquiries };
};

const Credits = () => {
  const router = useRouter();
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const monthlyCredits = useSelector(
    (state: RootState) => state?.agent?.docData?.monthlyCredits
  );
  const boosterCredits =
    useSelector((state: RootState) => state?.agent?.docData?.boosterCredits) ||
    0;
  const userType: string | null =
    useSelector((state: RootState) => state?.agent?.docData?.userType) || "";

  const { myEnquiries } = useEnquiries();

  // Add page view tracking
  useEffect(() => {
    try {
      logEvent(analytics, "credits_page_view", {
        event_category: "profile",
        event_label: "page_view",
        monthly_credits: monthlyCredits,
        user_type: userType || "free",
      });
    } catch (error) {
      console.error("Error logging page view:", error);
    }
  }, [monthlyCredits, userType]);

  const handleBackPress = () => {
    router.back();
  };

  const handleAddCredits = () => {
    try {
      logEvent(analytics, "add_credits_click", {
        credit_amount: 5,
        event_category: "profile",
        event_label: "add_credits",
        user_type: userType || "free",
      });
    } catch (error) {
      console.error("Error logging analytics:", error);
    }
    router.push({
      pathname: "/CheckoutScreen",
      params: { planId: "booster" },
    });
  };

  const handleComparePlans = () => {
    try {
      logEvent(analytics, "compare_plans_click", {
        event_category: "profile",
        event_label: "compare_plans",
        source: "credits_page",
        user_type: userType || "free",
      });
    } catch (error) {
      console.error("Error logging analytics:", error);
    }
    router.push("/ComparePlans");
  };

  const handleViewMore = () => {
    try {
      logEvent(analytics, "view_more_enquiries_click", {
        event_category: "profile",
        event_label: "view_more",
        source: "credits_page",
        enquiries_count: myEnquiries?.length || 0,
        user_type: userType || "free",
      });
    } catch (error) {
      console.error("Error logging analytics:", error);
    }
    router.push({
      pathname: "/dashboardTab",
      params: { tab: "enquiries" },
    });
  };

  const handleSupportClick = () => {
    try {
      logEvent(analytics, "support_click", {
        event_category: "profile",
        event_label: "support",
        platform: Platform.OS,
        source: "credits_page",
        user_type: userType || "free",
      });
    } catch (error) {
      console.error("Error logging analytics:", error);
    }
    const whatsappUrl = `https://wa.me/+919415006092`;
    Linking.openURL(whatsappUrl);
  };

  const handleOpenPropertyDetails = (enquiry: EnquiryWithProperty) => {
    try {
      logEvent(analytics, "enquiry_item_click", {
        event_category: "profile",
        event_label: "enquiry_details",
        source: "credits_page",
        property_name: enquiry.property?.propertyName || "N/A",
        enquiry_date: enquiry.added ? formatUnixDate(enquiry.added) : "N/A",
        user_type: userType || "free",
      });
    } catch (error) {
      console.error("Error logging analytics:", error);
    }

    if (enquiry?.property) {
      dispatch(setPropertyDataThunk(enquiry.property));
      router.push({
        pathname: "/components/property/PropertyDetailsScreen",
        params: {
          parent: "dashboardEnquiry",
          enqId: enquiry.enquiryId,
        },
      });
    }
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
            <Text
              className="text-sm text-[#595959]"
              style={{ fontFamily: "Lato_700Bold" }}
            >
              Available Credits
            </Text>
            <Text
              className=" text-4xl  mt-1 mb-1"
              style={{ fontFamily: "Montserrat_700Bold" }}
            >
              {monthlyCredits + boosterCredits}
            </Text>
            <Text
              className=" text-xs text-gray-600 max-w-[80%]"
              style={{ fontFamily: "Lato_400Regular" }}
            >
              Did you know? On Avg. agents spend 15 credits/week
            </Text>
            <View className="absolute right-5 top-5">
              <CreditCoin width={70} height={70} />
            </View>
          </LinearGradient>

          {/* Buy More Credits Card */}
          {Platform.OS !== "ios" && (
            <View className="bg-white rounded-xl p-5 border border-gray-200">
              <Text
                className=" text-lg text-[#433F3E] mb-2"
                style={{ fontFamily: "Montserrat_700Bold" }}
              >
                {Platform.OS !== "android"
                  ? "Enquiry Booster Pack"
                  : "Need more enquiries?"}
              </Text>
              <Text className="font-medium text-sm text-[#433F3E] mb-4">
                {Platform.OS !== "android"
                  ? "Unlock agent contacts with 5 non-expiring credits"
                  : "Credits are needed to get agent's contact details on ACN Platform."}
              </Text>

              {Platform.OS !== "android" ? null : (
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
              )}

              <View className="bg-[#1B665D1A] rounded-lg p-3 flex-row justify-center items-center">
                <View className="w-5 h-5 rounded-full bg-white border border-gray-300 justify-center items-center mr-2">
                  <Text className="text-xs text-[#757575]">i</Text>
                </View>
                <Text
                  className="text-sm"
                  style={{ fontFamily: "Lato_700Bold" }}
                >
                  5 credits = 5 fresh leads
                </Text>
              </View>

              {Platform.OS !== "android" ? (
                <View className="mt-4">
                  <Text className="text-sm">
                    <Text className="font-bold">Note:</Text>{" "}
                    <Text className="pl-2">
                      Credit top-ups aren't available through the app. For
                      assistance, please contact{" "}
                      <Text
                        className="ml-2 text-[#007AFF] underline"
                        onPress={handleSupportClick}
                      >
                        ACN Support.
                      </Text>
                    </Text>
                  </Text>
                </View>
              ) : null}
            </View>
          )}

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
            {myEnquiries &&
              myEnquiries.slice(0, 3).map((enquiry, index) => (
                <View key={index} className="mb-3">
                  <TouchableOpacity
                    onPress={() => handleOpenPropertyDetails(enquiry)}
                    className="flex-row justify-between items-start"
                  >
                    <View className="flex-1">
                      <Text className="font-lato text-sm font-medium text-gray-900">
                        {enquiry.property?.propertyName ||
                          "Property Name Not Available"}
                      </Text>
                      <Text className="font-lato text-xs text-gray-500 mt-1">
                        {enquiry.added
                          ? formatUnixDate(enquiry.added)
                          : "Date not available"}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Text className="font-montserrat-bold text-base font-bold text-red-600 mr-2">
                        - 1
                      </Text>
                      <CoinIcon width={16} height={16} />
                    </View>
                  </TouchableOpacity>

                  {index < 2 && myEnquiries.length > 1 && (
                    <View className="h-px bg-gray-200 my-3" />
                  )}
                </View>
              ))}

            {/* Show message if no enquiries available */}
            {(!myEnquiries || myEnquiries.length === 0) && (
              <Text className="font-lato text-sm text-gray-500 text-center py-2">
                No recent enquiries available
              </Text>
            )}

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

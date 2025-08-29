import React, { useState, useEffect } from "react";
import { View, Keyboard, Text } from "react-native";
import { useDoubleBackPressExit } from "@/hooks/useDoubleBackPressExit";
import Offline from "../components/Offline";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { analytics } from "../config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import PropertyCard from "../components/property/PropertyCard";
import { searchProperties } from "../services/property_services/propertyService";
import { Property } from "../types";

const UnderReviewProperties = () => {
  const [isMoreFiltersModalOpen, setIsMoreFiltersModalOpen] = useState(false);
  const agentData = useSelector((state: RootState) => state?.agent?.docData);
  const userType = agentData?.userType || "free";
  const [property, setProperty] = useState<any>(null);

  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const property: Property[] = await searchProperties(
          "agentPhoneNumber",
          "+918118823650"
        );
        console.log(property, "sdfga");
        if (!property || property.length === 0) return;
        setProperty(property[0]);
      } catch (error) {
        console.error("Error fetching property:", error);
      }
    };

    fetchProperty();
  }, []);

  // Track page view
  useEffect(() => {
    try {
      logEvent(analytics, "under_review_properties_page_view", {
        event_category: "page_view",
        event_label: "properties",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging page view:", error);
    }
  }, [userType]);

  useDoubleBackPressExit();

  if (!isConnectedToInternet) {
    try {
      logEvent(analytics, "properties_offline_view", {
        event_category: "error",
        event_label: "offline",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging offline state:", error);
    }
    return <Offline />;
  }

  if (!property) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F6F7] py-4">
      <PropertyCard property={property} />
    </View>
  );
};

export default UnderReviewProperties;

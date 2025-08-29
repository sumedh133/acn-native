import React, { useState, useEffect } from "react";
import { View, Keyboard } from "react-native";
import { useDoubleBackPressExit } from "@/hooks/useDoubleBackPressExit";
import Offline from "../components/Offline";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { analytics } from "../config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { MobileHits } from "../components/property/MobileHits";
import { useAlgoliaSearch } from "@/hooks/propertyHooks/useAlgoliaSearchProperties";

const UnderReviewProperties = () => {
  const [isMoreFiltersModalOpen, setIsMoreFiltersModalOpen] = useState(false);
  const agentData = useSelector((state: RootState) => state?.agent?.docData);
  const userType = agentData?.userType || "free";

  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  // Use custom Algolia search hook
  const {
    searchState,
    query,
    filters,
    facets,
    selectedLandmark,
    sortBy,
    updateQuery,
    updateFilters,
    updateLandmark,
    updateSort,
    refresh,
    loadMore,
  } = useAlgoliaSearch({ stage: ["-live"] });

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

  return (
    <View className="flex-1 bg-[#F5F6F7] py-4">
      <MobileHits
        results={searchState.allResults}
        loading={searchState.loading}
        loadingMore={searchState.loadingMore}
        hasMore={searchState.hasMore}
        error={searchState.error}
        totalHits={searchState.totalHits}
        onLoadMore={loadMore}
        onRefresh={refresh}
      />
    </View>
  );
};

export default UnderReviewProperties;

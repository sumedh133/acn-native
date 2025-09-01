import React, { useState, useEffect, useCallback } from "react";
import { View, Keyboard } from "react-native";
import PropertyFilters from "../components/property/PropertyFilters";
// import MoreFilters from "../components/MoreFilters";
import { useDoubleBackPressExit } from "@/hooks/useDoubleBackPressExit";
import Offline from "../components/Offline";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { analytics } from "../config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { MobileHits } from "../components/property/MobileHits";
import { useAlgoliaSearch } from "@/hooks/propertyHooks/useAlgoliaSearchProperties";
import MoreFilters from "../components/property/propertyMoreFilters/MoreFilters";

// At the top of RequirementsPage, create simple context

export default function PropertiesScreen() {
  const [isMoreFiltersModalOpen, setIsMoreFiltersModalOpen] = useState(false);
  const agentData = useSelector((state: RootState) => state?.agent?.docData);
  const userType = agentData?.userType || "free";
  const [isScrolling, setIsScrolling] = useState(false);
  const ScrollContext = React.createContext({
    isScrolling: false,
    setIsScrolling: (scrolling: boolean) => {},
  });
  const [activeTab, setActiveTab] = useState<"resale" | "rental">("resale");

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
  } = useAlgoliaSearch({
    listingType: [`${activeTab}`],
    // status: ["available"],
  });

  useEffect(() => {
    if (!filters) return;

    // Copy current filters and force listingType to match activeTab
    const newFilters = { ...filters, listingType: [activeTab] };

    if (activeTab === "rental") {
      // Remove resale-only filters
      delete newFilters.possession;
      delete newFilters.carpetArea;
      delete newFilters.totalAskPrice; // remove resale budget
    } else if (activeTab === "resale") {
      // Remove rental-only filters
      delete newFilters.rent; // remove rental budget
      delete newFilters.preferredTenants;
      delete newFilters.nonVegAllowed;
      delete newFilters.petsAllowed;
      delete newFilters.availableFrom;
    }

    updateFilters(newFilters);
  }, [activeTab]);

  // Track page view
  useEffect(() => {
    try {
      logEvent(analytics, "properties_page_view", {
        event_category: "page_view",
        event_label: "properties",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging page view:", error);
    }
  }, [userType]);

  const handleToggleMoreFilters = () => {
    try {
      logEvent(analytics, "property_filters_toggle", {
        event_category: "interaction",
        event_label: "filters",
        filter_state: !isMoreFiltersModalOpen ? "open" : "close",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging filter toggle:", error);
    }
    setIsMoreFiltersModalOpen((prev) => !prev);
    Keyboard.dismiss();
  };

  // Track landmark selection
  useEffect(() => {
    if (selectedLandmark) {
      try {
        logEvent(analytics, "property_landmark_selected", {
          event_category: "search",
          event_label: "landmark",
          landmark_name: selectedLandmark.name,
          landmark_radius: selectedLandmark.radius,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging landmark selection:", error);
      }
    }
  }, [selectedLandmark, userType]);

  // Track search queries
  useEffect(() => {
    if (query) {
      try {
        logEvent(analytics, "property_search_query", {
          event_category: "search",
          event_label: "query",
          search_term: query,
          results_count: searchState.totalHits,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging search query:", error);
      }
    }
  }, [query, searchState.totalHits, userType]);

  // Track filter changes
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      try {
        logEvent(analytics, "property_filters_applied", {
          event_category: "search",
          event_label: "filters",
          filter_count: Object.keys(filters).length,
          results_count: searchState.totalHits,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging filter application:", error);
      }
    }
  }, [filters, searchState.totalHits, userType]);

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
    <View className="flex-1 bg-[#F5F6F7]">
      <View className="flex-1 relative">
        <View>
          <PropertyFilters
            handleToggleMoreFilters={handleToggleMoreFilters}
            selectedLandmark={selectedLandmark}
            setSelectedLandmark={updateLandmark}
            query={query}
            onQueryChange={updateQuery}
            filters={filters}
            onFiltersChange={updateFilters}
            sortBy={sortBy}
            onSortChange={updateSort}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            showTabs={true}
          />
        </View>
        <View className="w-full flex-1">
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
      </View>
      <MoreFilters
        isOpen={isMoreFiltersModalOpen}
        setIsOpen={setIsMoreFiltersModalOpen}
        handleToggle={handleToggleMoreFilters}
        isMobile={true}
        selectedLandmark={selectedLandmark}
        setSelectedLandmark={updateLandmark}
        filters={filters}
        onFiltersChange={updateFilters}
        facets={facets}
      />
    </View>
  );
}

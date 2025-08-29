// React Components Import
import { View, Text } from "react-native";
import { useState } from "react";

// Page Components Import
import Header from "../components/MyBusinessPage/Header";
import Listings from "../components/MyBusinessPage/Listings";
import { useAlgoliaSearch } from "@/hooks/propertyHooks/useAlgoliaSearchProperties";
import { useSelector } from "react-redux";
import UnderReviewProperties from "../(pages)/UnderReviewProperties";
import PropertiesUnderReviewCard from "../components/MyBusinessPage/UnderReviewPropertiesButton";
import PropertyFilters from "../components/property/PropertyFilters";
import { logEvent } from "@react-native-firebase/analytics";
import MoreFilters from "../components/property/propertyMoreFilters/MoreFilters";

// Icons Import

const MyBusinessPage = () => {
  // State Management

  /**
   * State for active tabs
   */
  const [activeTab, setActiveTab] = useState<"property" | "requirement">(
    "property"
  );
  const [isMoreFiltersModalOpen, setIsMoreFiltersModalOpen] = useState(false);
  const cpId = useSelector((state: any) => state?.agent?.docData?.cpId);

  // Services Call

  /**
   * Fetch data from algolia
   */

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
  } = useAlgoliaSearch({ cpId: ["CPA469"] });

  const handleToggleMoreFilters = () => {
    // try {
    //   logEvent(analytics, "property_filters_toggle", {
    //     event_category: "interaction",
    //     event_label: "filters",
    //     filter_state: !isMoreFiltersModalOpen ? "open" : "close",
    //     user_type: userType,
    //   });
    // } catch (error) {
    //   console.error("Error logging filter toggle:", error);
    // }
    setIsMoreFiltersModalOpen((prev) => !prev);
    // Keyboard.dismiss();
  };

  return (
    <View className="flex-1 flex-col bg-white">
      <Header activeCard={activeTab} setActiveCard={setActiveTab} />
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
        showTabs={false}
      />
      <PropertiesUnderReviewCard />
      <Listings data={searchState} loadMore={loadMore} refresh={refresh} />
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
};

export default MyBusinessPage;

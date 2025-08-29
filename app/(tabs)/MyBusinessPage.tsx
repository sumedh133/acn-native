// React Components Import
import { View, Text } from "react-native";
import { useState } from "react";

// Page Components Import
import Header from "../components/MyBusinessPage/Header";
import Search from "../components/MyBusinessPage/Search";
import Filters from "../components/MyBusinessPage/Filters";
import UnderReview from "../components/MyBusinessPage/UnderReview";
import Listings from "../components/MyBusinessPage/Listings";
import { useAlgoliaSearch } from "@/hooks/propertyHooks/useAlgoliaSearchProperties";

// Icons Import

const MyBusinessPage = () => {
  // State Management

  /**
   * State for active tabs
   */
  const [activeTab, setActiveTab] = useState<"property" | "requirement">(
    "property"
  );

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
  } = useAlgoliaSearch();

  return (
    <View className="bg-white w-full h-full">
      <Header activeCard={activeTab} setActiveCard={setActiveTab} />
      <Search />
      <Filters />
      <UnderReview />
      <Listings data={searchState} />
    </View>
  );
};

export default MyBusinessPage;

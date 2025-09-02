// React Components Import
import { View, Text } from "react-native";
import { useCallback, useContext, useEffect, useState } from "react";

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
import { Property } from "../types";
import { searchProperties } from "../services/property_services/propertyService";
import { ScrollContext } from "../ScrollContext";

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
  const selectedProperties = new Set<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [properties, setProperties] = useState<Property[]>();

  // Use Selector to fetch from Local States
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
  } = useAlgoliaSearch({ cpId: [cpId] });

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

  // Scroll context
  const { resetFooterPosition } = useContext(ScrollContext);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const propertyResults: Property[] = await searchProperties("cpId", cpId);
      console.log(propertyResults, "fetched properties");
      setProperties(propertyResults || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    resetFooterPosition();
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

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
        isMyBusinessPage={true}
      />
      {properties && properties.length > 0 && (
        <PropertiesUnderReviewCard count={properties.length} />
      )}
      <Listings
        data={searchState}
        loadMore={loadMore}
        refresh={refresh}
        selectedProperties={selectedProperties}
        loading={loading}
      />
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

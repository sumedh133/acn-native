// React Components Import
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useCallback, useContext, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

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
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(
    new Set()
  );
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [properties, setProperties] = useState<Property[]>([]);

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

  // Multiselect handlers
  const handleToggleSelection = (propertyId: string) => {
    setSelectedProperties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }

      // Exit selection mode if no items are selected
      if (newSet.size === 0) {
        setIsSelectionMode(false);
      }

      return newSet;
    });
  };

  const handleLongPress = (propertyId: string) => {
    // Enter selection mode and select the item
    setIsSelectionMode(true);
    setSelectedProperties((prev) => {
      const newSet = new Set(prev);
      newSet.add(propertyId);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (searchState.allResults) {
      // Add haptic feedback for bulk selection
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Haptics.selectionAsync();
      }

      const allPropertyIds = searchState.allResults.map(
        (property) => property.propertyId
      );
      setSelectedProperties(new Set(allPropertyIds));
    }
  };

  const handleDeselectAll = () => {
    // Add haptic feedback for clearing selection
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.selectionAsync();
    }

    setSelectedProperties(new Set());
    setIsSelectionMode(false);
  };

  const handleExitSelectionMode = () => {
    setSelectedProperties(new Set());
    setIsSelectionMode(false);
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
    try {
      fetchProperties();
    } catch (error) {
      console.error(error);
    }
  }, [fetchProperties]);

  return (
    <View className="flex-1 flex-col">
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

      {/* Selection Mode Header */}
      {isSelectionMode && (
        <View className="flex-row items-center justify-between bg-[#153E3B] px-4 py-3 mx-4 mb-3 rounded-lg">
          <View className="flex-row items-center">
            <Text className="text-white font-medium mr-2">
              {selectedProperties.size} selected
            </Text>
            {selectedProperties.size > 0 && (
              <TouchableOpacity
                onPress={handleDeselectAll}
                className="bg-white/20 px-3 py-1 rounded-full mr-2"
              >
                <Text className="text-white text-sm">Clear All</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleSelectAll}
              className="bg-white/20 px-3 py-1 rounded-full"
            >
              <Text className="text-white text-sm">Select All</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleExitSelectionMode}
            className="bg-white/20 p-2 rounded-full"
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
      <Listings
        data={searchState}
        loadMore={loadMore}
        refresh={refresh}
        selectedProperties={selectedProperties}
        isSelectionMode={isSelectionMode}
        onToggleSelection={handleToggleSelection}
        onLongPress={handleLongPress}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onExitSelectionMode={handleExitSelectionMode}
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

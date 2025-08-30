import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Animated,
} from "react-native";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import FilterIcon from "@/assets/icons/svg/PropertiesPage/FilterIcon";
import NewSearchIcon from "@/assets/icons/svg/PropertiesPage/NewSearchIcon";
import { SearchFilters } from "../../services/property_services/propertyAlgoliaService";
import CustomCurrentRefinements from "./propertyMoreFilters/newCustomCurrentRefinements";
import ToggleTabs from "../ToggleTabs";
import { ScrollContext } from "@/app/ScrollContext";

// Common props for both cases
interface BasePropertyFiltersProps {
  handleToggleMoreFilters: () => void;
  selectedLandmark?: any;
  setSelectedLandmark: (landmark: any) => void;
  query: string;
  onQueryChange: (query: string) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  sortBy?: string;
  onSortChange: (sortBy: string) => void;
  loading?: boolean;
  showTabs?: boolean; // 👈 discriminator
  isMyBusinessPage?: boolean; // 👈 new prop
}

// Case when tabs are shown
interface WithTabsProps extends BasePropertyFiltersProps {
  showTabs: true;
  activeTab: "resale" | "rental";
  setActiveTab: (tab: "resale" | "rental") => void;
}

// Case when tabs are hidden
interface WithoutTabsProps extends BasePropertyFiltersProps {
  showTabs?: false; // default false if not given
  activeTab?: never;
  setActiveTab?: never;
}

export type PropertyFiltersProps = WithTabsProps | WithoutTabsProps;

export default function PropertyFilters({
  handleToggleMoreFilters,
  selectedLandmark,
  setSelectedLandmark,
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  activeTab,
  setActiveTab,
  showTabs = true,
  isMyBusinessPage = false,
}: PropertyFiltersProps) {
  const [searchText, setSearchText] = useState(query);
  const slideAnim = useRef(
    new Animated.Value(activeTab === "rental" ? 1 : 0)
  ).current;

  const { 
    selectedSort, 
    openSortPopup, 
    setSelectedSort,
    // Status filter methods
    selectedStatus,
    openStatusPopup,
    setSelectedStatus,
    // Category filter methods
    selectedCategory,
    openCategoryPopup,
    setSelectedCategory,
  } = useContext(ScrollContext);
  
  const prevSortByRef = useRef(sortBy);
  const prevSelectedSortRef = useRef(selectedSort);

  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";

  // Sort options - updated to match your service's sort mapping
  const sortOptions = [
    { label: "Most Relevant", value: "relevance" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Newest First", value: "date_desc" },
    { label: "Oldest First", value: "date_asc" },
  ];

  // Sync local search text with external query
  useEffect(() => {
    setSearchText(query);
  }, [query]);

  // Debounced search - now calls the hook's onQueryChange
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchText.trim() !== query) {
        try {
          logEvent(analytics, "property_search", {
            event_category: "search",
            event_label: "property",
            search_query: searchText.trim(),
            previous_query: query,
            user_type: userType,
          });
        } catch (error) {
          console.error("Error logging property search:", error);
        }
        onQueryChange(searchText.trim());
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText, query, onQueryChange, userType]);

  useEffect(() => {
    // Sync selectedSort with sortBy prop (when sortBy changes from parent)
    if (sortBy && sortBy !== prevSortByRef.current && sortBy !== selectedSort) {
      setSelectedSort(sortBy);
      prevSortByRef.current = sortBy;
      return;
    }

    // Handle sort changes from context (when selectedSort changes from modal)
    if (
      selectedSort &&
      selectedSort !== prevSelectedSortRef.current &&
      selectedSort !== sortBy
    ) {
      try {
        logEvent(analytics, "property_sort_change", {
          event_category: "sort",
          event_label: "property",
          sort_value: selectedSort,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging sort change:", error);
      }
      onSortChange(selectedSort);
      prevSelectedSortRef.current = selectedSort;
    }

    // Update refs
    prevSortByRef.current = sortBy;
    prevSelectedSortRef.current = selectedSort;
  }, [sortBy, selectedSort]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: activeTab === "rental" ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  const handleMoreFilters = () => {
    try {
      logEvent(analytics, "open_property_filters", {
        event_category: "filters",
        event_label: "open",
        current_query: query,
        has_landmark: !!selectedLandmark,
        active_filters: Object.keys(filters).length,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging filter open:", error);
    }
    handleToggleMoreFilters();
  };

  // Render the business page version
  if (isMyBusinessPage) {
    return (
      <View className="px-4 pt-3">
        {/* Search Input - Full width */}
        <View className="flex-row items-center bg-white border border-[#B5B3B3] rounded-lg px-3 h-12 mb-3">
          <NewSearchIcon style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 text-sm text-gray-700"
            placeholder="Search by project, micro market"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Filter Buttons Row */}
        <View className="flex-row items-center space-x-2 mb-2">
          {/* Status Dropdown */}
          <TouchableOpacity
            onPress={openStatusPopup}
            className="flex-row items-center justify-center rounded-lg border border-[#B5B3B3] bg-white px-4 h-10"
          >
            <Text className="text-sm text-gray-700 mr-2">Status</Text>
            <View className="rotate-90">
              <Text className="text-gray-500">⌄</Text>
            </View>
          </TouchableOpacity>

          {/* Category Dropdown */}
          <TouchableOpacity
            onPress={openCategoryPopup}
            className="flex-row items-center justify-center rounded-lg border border-[#B5B3B3] bg-white px-4 h-10"
          >
            <Text className="text-sm text-gray-700 mr-2">Category</Text>
            <View className="rotate-90">
              <Text className="text-gray-500">⌄</Text>
            </View>
          </TouchableOpacity>

          {/* Sort Dropdown */}
          <TouchableOpacity
            onPress={openSortPopup}
            className="flex-row items-center justify-center rounded-lg border border-[#B5B3B3] bg-white px-4 h-10"
          >
            <Text className="text-sm text-gray-700 mr-2">Sort</Text>
            <View className="rotate-90">
              <Text className="text-gray-500">⌄</Text>
            </View>
          </TouchableOpacity>

          {/* Filter Icon */}
          <TouchableOpacity
            onPress={handleMoreFilters}
            className="h-10 w-10 items-center justify-center rounded-lg border border-[#B5B3B3] bg-white"
          >
            <FilterIcon />
          </TouchableOpacity>
        </View>

        {/* Current Refinements */}
        <View className="flex-row -ml-3">
          <CustomCurrentRefinements
            selectedLandmark={selectedLandmark}
            setSelectedLandmark={setSelectedLandmark}
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </View>
      </View>
    );
  }

  // Render the original version (default)
  return (
    <View className="px-4 pt-3">
      {/* 👇 Conditionally render ToggleTabs based on prop */}
      {showTabs && (
        <View className="mb-3">
          <ToggleTabs
            tabs={[
              { label: "Resale", value: "resale" },
              { label: "Rental", value: "rental" },
            ]}
            activeTab={activeTab!}
            onChange={(val) =>
              setActiveTab?.(
                val === "resale" ? ("resale" as const) : ("rental" as const)
              )
            }
          />
        </View>
      )}

      {/* Search + Sort + Filters */}
      <View className="flex-row items-center space-x-2">
        {/* Search Input */}
        <View className="flex-1 flex-row items-center bg-white border border-[#B5B3B3] rounded-lg px-3 h-10 ">
          <NewSearchIcon style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 text-xs text-gray-700 "
            placeholder="Search by project, micro market"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <TouchableOpacity
          onPress={openSortPopup}
          className="h-10 w-fit items-center justify-center rounded-lg border border-[#B5B3B3] bg-white"
        >
          <Text className="px-4">Sort</Text>
        </TouchableOpacity>

        {/* Filter Button */}
        <TouchableOpacity
          onPress={handleToggleMoreFilters}
          className="h-10 w-10 items-center justify-center rounded-lg border border-[#B5B3B3] bg-white"
        >
          <FilterIcon />
        </TouchableOpacity>
      </View>

      <View className="mt-2 flex-row -ml-3">
        <CustomCurrentRefinements
          selectedLandmark={selectedLandmark}
          setSelectedLandmark={setSelectedLandmark}
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      </View>
    </View>
  );
}
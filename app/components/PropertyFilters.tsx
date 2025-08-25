import React, { useState, useEffect, useRef } from "react";
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
import { SearchFilters } from "../services/property_services/propertyAlgoliaService";
import CustomCurrentRefinements from "./newCustomCurrentRefinements";
import DropdownTailwind from "./DropdownTailwind";
import ToggleTabs from "./ToggleTabs";

interface PropertyFiltersProps {
  handleToggleMoreFilters: () => void;
  selectedLandmark?: any;
  setSelectedLandmark: (landmark: any) => void;
  // New props from the hook
  query: string;
  onQueryChange: (query: string) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  sortBy?: string;
  onSortChange: (sortBy: string) => void;
  loading?: boolean;
}

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
  loading = false,
}: PropertyFiltersProps) {
  const [searchText, setSearchText] = useState(query);
  const [activeTab, setActiveTab] = useState<"resale" | "rental">("resale");
  const slideAnim = useRef(
    new Animated.Value(activeTab === "rental" ? 1 : 0)
  ).current;

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

  // Handle sort changes
  const handleSortChange = (value: string | null) => {
    if (value) {
      try {
        logEvent(analytics, "property_sort_change", {
          event_category: "sort",
          event_label: "property",
          sort_value: value,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging sort change:", error);
      }
      onSortChange(value); // <-- this comes from the hook
    }
  };

  // Handle property type tab change
  const handleTabChange = (tab: "resale" | "rental") => {
    setActiveTab(tab);
    onFiltersChange({ ...filters, type: [tab] });

    try {
      logEvent(analytics, "property_type_change", {
        event_category: "navigation",
        event_label: "property_type",
        property_type: tab,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging property type change:", error);
    }

    // You might want to trigger a new search or update filters based on property type
    // For now, this just changes the UI. You can extend this to affect the actual search.
  };

  const handleClear = () => {
    try {
      logEvent(analytics, "clear_property_search", {
        event_category: "search",
        event_label: "clear",
        cleared_query: query,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging search clear:", error);
    }

    Keyboard.dismiss();
    setSearchText("");
    if (query !== "") {
      onQueryChange("");
    }
  };

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

  return (
    <View className="px-4 pt-3">
      <View className="mb-3" >
      <ToggleTabs
        tabs={[
          { label: "Resale", value: "resale" },
          { label: "Rental", value: "rental" },
        ]}
        activeTab={activeTab}
        onChange={(val) =>
          handleTabChange(
            val == "resale" ? ("resale" as const) : ("rental" as const)
          )
        }
      />
      </View>

      {/* Search + Sort + Filters */}
      <View className="flex-row items-center space-x-3">
        {/* Search Input */}
        <View className="flex-1 flex-row items-center bg-white border border-[#B5B3B3] rounded-lg px-3 h-10">
          <NewSearchIcon style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 text-xs text-gray-700"
            placeholder="Search by project, micro market"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Sort Dropdown */}
        <DropdownTailwind
          value={sortBy ?? null}
          setValue={handleSortChange}
          options={sortOptions}
          placeholder="Sort"
          forcePlaceholder={true}
          searchable={false}
          loading={loading}
          containerClassName="w-20 ml-1.5"
          buttonClassName="h-10 px-4 border border-[#B5B3B3] rounded-lg bg-white flex-row items-center justify-between"
          placeholderClassName="text-sm text-black font-medium "
          dropdownClassName="absolute bg-white w-36 rounded-lg border border-gray-200 shadow-md z-50 p-1 mt-0.5"
        />

        {/* Filter Button */}
        <TouchableOpacity
          onPress={handleMoreFilters}
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

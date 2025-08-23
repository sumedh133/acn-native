import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useInstantSearch, useSearchBox, useSortBy } from "react-instantsearch";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import CustomCurrentRefinements from "./CustomCurrentRefinements";
import DropdownSelect from "./Listing/Dropdown";
import CloseIcon from "@/assets/icons/svg/CloseIcon";
import FilterIcon from "@/assets/icons/svg/PropertiesPage/FilterIcon";
import NewSearchIcon from "@/assets/icons/svg/PropertiesPage/NewSearchIcon";
import DropdownTailwind from "./DropdownTailwind";

interface PropertyFiltersProps {
  handleToggleMoreFilters: () => void;
  selectedLandmark?: any;
  setSelectedLandmark?: (landmark: any) => void;
}

export default function PropertyFilters({
  handleToggleMoreFilters,
  selectedLandmark,
  setSelectedLandmark,
}: PropertyFiltersProps) {
  const { query, refine } = useSearchBox();
  const { refine: sortRefine, currentRefinement } = useSortBy({
    items: [
      { label: "Most Relevant", value: "properties" },
      { label: "Price: Low to High", value: "properties_price_asc" },
      { label: "Price: High to Low", value: "properties_price_desc" },
      { label: "Newest First", value: "properties_date_desc" },
      { label: "Oldest First", value: "properties_date_asc" },
    ],
  });
  const { status } = useInstantSearch();
  const [searchText, setSearchText] = useState(query);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"resale" | "rental">("resale");
  const [sortValue, setSortValue] = useState<string | null>(currentRefinement);
  const slideAnim = useRef(
    new Animated.Value(activeTab === "rental" ? 1 : 0)
  ).current;

  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";

  // Sort options
  const sortOptions = [
    { label: "Most Relevant", value: "properties" },
    { label: "Price: Low to High", value: "properties_price_asc" },
    { label: "Price: High to Low", value: "properties_price_desc" },
    { label: "Newest First", value: "properties_date_desc" },
    { label: "Oldest First", value: "properties_date_asc" },
  ];

  // Debounced refine
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
        refine(searchText.trim());
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

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
      sortRefine(value);
      setSortValue(value);
    }
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
      refine("");
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
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging filter open:", error);
    }
    handleToggleMoreFilters();
  };

  // Track status changes
  useEffect(() => {
    setLoading(status === "loading");
  }, [status]);

  return (
    <View className="px-4 pt-3">
      {/* Top Row: Tabs + Sort */}
      <View className="flex-row w-full rounded-full border border-[#153E3B] overflow-hidden p-1 relative mb-3">
        <Animated.View
          className="absolute top-1 bottom-1 w-1/2 bg-[#153E3B] rounded-full z-0"
          style={{
            left: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["1.5%", "50.5%"],
            }),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 4,
          }}
        />

        <TouchableOpacity
          className="flex-1 py-3 items-center justify-center rounded-full z-10"
          onPress={() => setActiveTab("resale")}
        >
          <Text
            className={`text-sm font-medium ${
              activeTab === "resale" ? "text-white" : "text-gray-700"
            }`}
          >
            Resale
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 py-2 items-center justify-center rounded-full z-10"
          onPress={() => setActiveTab("rental")}
        >
          <Text
            className={`text-sm font-medium ${
              activeTab === "rental" ? "text-white" : "text-gray-700"
            }`}
          >
            Rental
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search + Sort + Filters */}
      <View className="flex-row justify-center items-center space-x-2">
        {/* Search Input */}
        <View className="flex-1 flex-row items-center bg-white border border-[#B5B3B3] rounded-lg px-3 h-10">
          <NewSearchIcon style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 text-sm text-gray-700"
            placeholder="Search by project, micro market"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Sort Dropdown */}
        {/* <View className="w-10 flex justify-center items-center">
          <DropdownTailwind
            value={sortValue}
            setValue={handleSortChange}
            options={sortOptions}
            placeholder="Sort"
            searchable={false}
            containerClassName="w-full border border-[#B5B3B3] "
          />
        </View> */}

        {/* Loading Indicator */}
        {loading && (
          <View className="flex-row items-center">
            <ActivityIndicator color="#153E3B" />
          </View>
        )}

        {/* Clear Button */}
        {searchText.trim() && (
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleClear}
              className="h-10 w-10 justify-center items-center border border-red-500 rounded-md bg-red-500"
              disabled={loading}
            >
              <CloseIcon strokeColor="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Filter Button */}
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleMoreFilters}>
            <FilterIcon />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-2 flex-row -ml-3">
        <CustomCurrentRefinements
          selectedLandmark={selectedLandmark}
          setSelectedLandmark={setSelectedLandmark}
        />
      </View>
    </View>
  );
}

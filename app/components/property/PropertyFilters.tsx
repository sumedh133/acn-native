import React, { useState, useEffect, useRef, useContext } from "react";
import { usePathname } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // or 'react-native-vector-icons/Ionicons'
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
import { trackEvent } from "@/app/services/logAnalyticsService";

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
  const path = usePathname();
  const slideAnim = useRef(
    new Animated.Value(activeTab === "rental" ? 1 : 0)
  ).current;

  // Animation values for rotating arrows
  const statusRotateAnim = useRef(new Animated.Value(0)).current;
  const categoryRotateAnim = useRef(new Animated.Value(0)).current;
  const sortRotateAnim = useRef(new Animated.Value(0)).current;

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

  // Create rotation interpolations
  const statusRotateInterpolate = statusRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const categoryRotateInterpolate = categoryRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const sortRotateInterpolate = sortRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Track popup states (you'll need to get these from your context or manage them locally)
  const [isStatusPopupOpen, setIsStatusPopupOpen] = useState(false);
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);

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
    { label: "Price per sqft: Low to High", value: "price_per_sqft_asc" },
    { label: "Price per sqft: High to Low", value: "price_per_sqft_desc" },
  ];

  // Animation effects for popup states
  useEffect(() => {
    Animated.timing(statusRotateAnim, {
      toValue: isStatusPopupOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isStatusPopupOpen]);

  useEffect(() => {
    Animated.timing(categoryRotateAnim, {
      toValue: isCategoryPopupOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isCategoryPopupOpen]);

  useEffect(() => {
    Animated.timing(sortRotateAnim, {
      toValue: isSortPopupOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isSortPopupOpen]);

  // Modified popup handlers to track state
  const handleOpenStatusPopup = () => {
    setIsStatusPopupOpen(true);
    openStatusPopup();
    // You might need to set a timeout to close this or listen to popup close events
    setTimeout(() => setIsStatusPopupOpen(false), 3000); // Adjust based on your popup behavior
  };

  const handleOpenCategoryPopup = () => {
    setIsCategoryPopupOpen(true);
    openCategoryPopup();
    setTimeout(() => setIsCategoryPopupOpen(false), 3000);
  };

  const handleOpenSortPopup = () => {
    setIsSortPopupOpen(true);
    openSortPopup();
    setTimeout(() => setIsSortPopupOpen(false), 3000);
  };

  // Sync local search text with external query
  useEffect(() => {
    setSearchText(query);
  }, [query]);

  // Debounced search - now calls the hook's onQueryChange
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchText.trim() !== query) {
        try {

          if (path === "/properties") {
            trackEvent("property_search", undefined, undefined, { page_type: activeTab, search_query: searchText.trim() }).catch((error) => {
              console.error(`Error logging event: ${error}`);
            });
          }
          else {
            trackEvent("mb_search_applied").catch((error) => {
              console.error(`Error logging event: ${error}`);
            });
          }
        } catch (error) {
          console.error(`Unexpected error: ${error}`);
        }
        onQueryChange(searchText.trim());
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText, query, onQueryChange, userType]);

  // Add after the existing sort useEffect
  useEffect(() => {
    // Handle status changes from context
    if (
      selectedStatus &&
      selectedStatus !== "all" &&
      selectedStatus !== filters.status?.join(",")
    ) {
      const newFilters = { ...filters, status: [selectedStatus] };
      onFiltersChange(newFilters);
    }
    // Remove filter if "all" is selected
    else if (
      selectedStatus === "all" &&
      filters.status &&
      filters.status.length > 0
    ) {
      const newFilters = { ...filters, status: [] };
      onFiltersChange(newFilters);
    }
  }, [selectedStatus, filters.status, onFiltersChange]);

  useEffect(() => {
    // Handle category changes from context
    if (
      selectedCategory &&
      selectedCategory !== "all" &&
      selectedCategory !== filters.listingType?.join(",")
    ) {
      const newFilters = { ...filters, listingType: [selectedCategory] };
      onFiltersChange(newFilters);
    }
    // Remove filter if "all" is selected
    else if (
      selectedCategory === "all" &&
      filters.listingType &&
      filters.listingType.length > 0
    ) {
      const newFilters = { ...filters, listingType: [] };
      onFiltersChange(newFilters);
    }


  }, [selectedCategory]);

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
        const eventName = path === "/properties" ? "" : "mb_sort_applied"
        trackEvent(eventName).catch((error) => {
          console.error(`Error logging event: ${error}`);
        });
      } catch (error) {
        console.error(`Unexpected error: ${error}`);
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
    try {
      const eventName = activeTab == "rental" ? "property_page_rental_view" : "property_page_resale_view"
      trackEvent(eventName, undefined, undefined, { page_type: activeTab }).catch((error) => {
        console.error(`Error logging event: ${error}`);
      });
    } catch (error) {
      console.error(`Unexpected error: ${error}`);
    }
  }, [activeTab]);

  const handleMoreFilters = () => {
    try {
      
      trackEvent("property_filter_open", undefined, undefined, { page_type: activeTab }).catch((error) => {
        console.error(`Error logging event: ${error}`);
      });
    } catch (error) {
      console.error(`Unexpected error: ${error}`);
    }
    handleToggleMoreFilters();
  };

  useEffect(() => {
  }, [filters])

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
          {/* Status Button */}
          <TouchableOpacity
            onPress={handleOpenStatusPopup}
            className="flex-row items-center justify-center rounded-lg border border-[#B5B3B3] bg-white h-10 relative pr-8 pl-4 "
          >
            <Text
              className="text-sm text-black"
              style={{ fontFamily: "Lato_400Regular" }}
            >
              Status
            </Text>
            <Animated.View
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: [
                  { translateY: -10 },
                  { rotate: statusRotateInterpolate },
                ],
              }}
            >
              <Ionicons name="chevron-down" size={20} color="#555" />
            </Animated.View>
          </TouchableOpacity>

          {/* Category Button */}
          <TouchableOpacity
            onPress={handleOpenCategoryPopup}
            className="flex-1 flex-row items-center justify-center rounded-lg border border-[#B5B3B3] bg-white h-10 relative pr-8 pl-4"
          >
            <Text
              className="text-sm text-black"
              style={{ fontFamily: "Lato_400Regular" }}
            >
              Category
            </Text>
            <Animated.View
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: [
                  { translateY: -10 },
                  { rotate: categoryRotateInterpolate },
                ],
              }}
            >
              <Ionicons name="chevron-down" size={20} color="#555" />
            </Animated.View>
          </TouchableOpacity>

          {/* Sort Button */}
          <TouchableOpacity
            onPress={handleOpenSortPopup}
            className="flex-row items-center justify-center rounded-lg border border-[#B5B3B3] bg-white h-10 relative pr-8 pl-4"
          >
            <Text
              className="text-sm text-black"
              style={{ fontFamily: "Lato_400Regular" }}
            >
              Sort
            </Text>
            <Animated.View
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: [
                  { translateY: -10 },
                  { rotate: sortRotateInterpolate },
                ],
              }}
            >
              <Ionicons name="chevron-down" size={20} color="#555" />
            </Animated.View>
          </TouchableOpacity>

          {/* Filter Icon Button */}
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
            sortBy={sortBy}
            onSortChange={onSortChange}
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
          onPress={handleOpenSortPopup}
          className="h-10 w-fit items-center justify-center rounded-lg border border-[#B5B3B3] bg-white relative pl-4 pr-8"
        >
          <Text
            className="text-sm text-black"
            style={{ fontFamily: "Lato_400Regular" }}
          >
            Sort
          </Text>
          <Animated.View
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: [
                { translateY: -10 },
                { rotate: sortRotateInterpolate },
              ],
            }}
          >
            <Ionicons name="chevron-down" size={20} color="#555" />
          </Animated.View>
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
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
      </View>
    </View>
  );
}

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Platform,
  StyleSheet,
} from "react-native";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import DropdownMoreFilters from "./DropdownMoreFilters";
import RangeMoreFilters from "./RangeMoreFilters";
import LandmarkDropdownFilters from "./LandmarkDropdownFilters";
import CloseIcon from "@/assets/icons/svg/CloseIcon";
import { Landmark } from "../types";
import NewSearchIcon from "@/assets/icons/svg/PropertiesPage/NewSearchIcon";
import { SearchFilters } from "../services/property_services/propertyAlgoliaService";


export interface RangeState {
  start: (number | undefined)[];
  range: {
    min?: number;
    max?: number;
  };
  refine: (range: [number, number]) => void;
  currentRefinement?: [number | undefined, number | undefined];
}

interface MoreFiltersProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleToggle: () => void;
  isMobile: boolean;
  selectedLandmark: Landmark | null;
  setSelectedLandmark: (landmark: Landmark | null) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  facets: Record<string, Record<string, number>>;
}

const MoreFilters = ({
  isOpen,
  setIsOpen,
  handleToggle,
  isMobile,
  selectedLandmark,
  setSelectedLandmark,
  filters,
  facets,
  onFiltersChange
}: MoreFiltersProps) => {
  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";
  const [selectedLocationFilter, setSelectedLocationFilter] =
    useState("micromarket");
  const [landmarkSearch, setLandmarkSearch] = useState("");

  // Local filter state - manage filters locally until applied
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [localSelectedLandmark, setLocalSelectedLandmark] = useState<Landmark | null>(selectedLandmark);

  // Mock data for refinement options (you might want to fetch this from your service)
  // These would typically come from your search service's facet data
  const [facetData, setFacetData] = useState({
    micromarket: facets.micromarket || [],
    currentStatus: [],
    area: [],
    assetType: [],
    unitType: [],
    facing: [],
    floorNo: [],
    sbua: [],
  });

  // Update local state when props change
  useEffect(() => {
    setLocalFilters(filters);
    setLocalSelectedLandmark(selectedLandmark);
  }, [filters, selectedLandmark]);

  // Track modal view
  useEffect(() => {
    if (isOpen) {
      try {
        logEvent(analytics, "more_filters_view", {
          event_category: "filters",
          event_label: "modal_view",
          current_refinements: Object.keys(localFilters).length,
          location_filter: selectedLocationFilter,
          has_landmark: !!localSelectedLandmark,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging more filters view:", error);
      }
    }
  }, [isOpen]);

  // Helper function to update local filters
  const updateLocalFilter = (attribute: string, values: string[]) => {
    setLocalFilters(prev => ({
      ...prev,
      [attribute]: values
    }));
  };

  // Helper function to toggle a filter value
  const toggleFilterValue = (attribute: string, value: string) => {
    const currentValues = localFilters[attribute as keyof SearchFilters] || [];
    const isSelected = currentValues.includes(value);
    
    const newValues = isSelected 
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateLocalFilter(attribute, newValues);
  };

  // Helper function to set range filter
  const updateRangeFilter = (attribute: string, range: [number, number]) => {
    setLocalFilters(prev => ({
      ...prev,
      [`${attribute}_min`]: range[0],
      [`${attribute}_max`]: range[1]
    }));
  };

  // Clear specific attribute filter
  const clearAttributeFilter = (attribute: string) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[attribute as keyof SearchFilters];
      // Also clear range filters if applicable
      delete newFilters[`${attribute}_min` as keyof SearchFilters];
      delete newFilters[`${attribute}_max` as keyof SearchFilters];
      return newFilters;
    });
  };

  useEffect(() => {
    const hasMicromarketFilter = localFilters.micromarket && localFilters.micromarket.length > 0;
    setSelectedLocationFilter(
      hasMicromarketFilter && !localSelectedLandmark ? "micromarket" : "landmark"
    );
  }, [localFilters, localSelectedLandmark]);

  const outsideFilters = [
    { title: "Asset Type", attribute: "assetType", type: "dropdown" },
    { title: "Configuration", attribute: "unitType", type: "dropdown" },
    { title: "SBUA (sqft)", attribute: "sbua", type: "range" },
    {
      title: "Total Ask Price",
      attribute: "totalAskPrice",
      type: "range",
    },
  ];

  const insideFilters = [
    { title: "Plot Size (sqft)", attribute: "plotSize", type: "range" },
    { title: "Carpet Area (sqft)", attribute: "carpet", type: "range" },
    {
      title: "Ask Price/Sqft",
      attribute: "askPricePerSqft",
      type: "range",
    },
    { title: "Facing", attribute: "facing", type: "dropdown" },
    { title: "Floor", attribute: "floorNo", type: "dropdown" },
    { title: "Status", attribute: "currentStatus", type: "tab" },
    { title: "Area", attribute: "area", type: "tab" },
  ];

  const renderRefinementList = (
    items: any[],
    attribute: string
  ) => {
    const selectedValues = localFilters[attribute as keyof SearchFilters] || [];

    return (
      <View className="flex-row flex-wrap gap-2">
        {items.map((item) => {
          const isRefined = selectedValues.includes(item.value);
          return (
            <TouchableOpacity
              key={item.value}
              className={`py-2 px-3 border border-gray-300 rounded-md bg-white ${
                isRefined ? "bg-[#DFF4F3] border-[#153E3B]" : ""
              }`}
              onPress={() => toggleFilterValue(attribute, item.value)}
            >
              <View className="flex-row justify-between items-center">
                <Text
                  className={`text-sm ${
                    isRefined ? "text-[#153E3B]" : "text-gray-700"
                  }`}
                >
                  {item.label}
                </Text>
                <Text className="text-xs ml-2 px-1 py-0.5 bg-gray-200 rounded text-gray-600 font-bold">
                  {item.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const SearchableRefinementList = ({
    items,
    attribute,
  }: {
    items: any[];
    attribute: string;
  }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const filteredItems = items.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearch = (query: string) => {
      try {
        logEvent(analytics, "filter_search", {
          event_category: "filters",
          event_label: "search",
          filter_type: attribute,
          search_query: query,
          results_count: items.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase())
          ).length,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging filter search:", error);
      }
      setSearchQuery(query);
    };

    const handleRefine = (value: string) => {
      try {
        const item = items.find((i) => i.value === value);
        const isRefined = (localFilters[attribute as keyof SearchFilters] || []).includes(value);
        logEvent(analytics, "filter_refinement", {
          event_category: "filters",
          event_label: "refinement",
          filter_type: attribute,
          value: value,
          label: item?.label,
          action: isRefined ? "remove" : "add",
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging refinement:", error);
      }
      toggleFilterValue(attribute, value);
    };

    return (
      <View className="w-full mb-2">
        {attribute === "micromarket" && (
          <View className="flex-row items-center  w-full border px-2 border-gray-300 rounded-md h-10 pl-3 bg-white ">
            <NewSearchIcon strokeColor="#726C6C" />
            <TextInput
              className="text-[12px] ml-2"
              placeholder="Search micromarket..."
              value={searchQuery}
              onChangeText={handleSearch}
              style={{ fontFamily: "Lato_400Regular" }}
            />
          </View>
        )}

        <View className="flex-row flex-wrap gap-2">
          {filteredItems
            ?.slice(0, searchQuery === "" ? 10 : filteredItems.length)
            ?.map((item) => {
              const isRefined = (localFilters[attribute as keyof SearchFilters] || []).includes(item.value);
              return (
                <TouchableOpacity
                  key={item.value}
                  className={`py-2 px-3 border border-gray-300 rounded-md bg-white ${
                    isRefined ? "bg-[#DFF4F3] border-[#153E3B]" : ""
                  }`}
                  onPress={() => handleRefine(item.value)}
                >
                  <View className="flex-row justify-between items-center">
                    <Text
                      className={`text-sm ${
                        isRefined
                          ? "text-[#153E3B] font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {item.label}
                    </Text>
                    <Text className="text-xs ml-2 px-1 py-0.5 bg-gray-200 rounded text-gray-600 font-bold">
                      {item.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
        </View>
      </View>
    );
  };

  const [forceRender, setForceRender] = useState(false);

  const handleLocationFilterChange = (filterType: string) => {
    try {
      logEvent(analytics, "location_filter_change", {
        event_category: "filters",
        event_label: "location",
        previous_filter: selectedLocationFilter,
        new_filter: filterType,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging location filter change:", error);
    }

    if (filterType === "landmark") {
      setSelectedLocationFilter("landmark");
      clearAttributeFilter("micromarket");
    } else {
      setSelectedLocationFilter("micromarket");
      setLocalSelectedLandmark(null);
    }
  };

  const handleShowResults = () => {
    try {
      logEvent(analytics, "apply_more_filters", {
        event_category: "filters",
        event_label: "apply",
        total_filters: Object.keys(localFilters).length,
        filter_types: Object.keys(localFilters),
        location_filter: selectedLocationFilter,
        has_landmark: !!localSelectedLandmark,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging filter application:", error);
    }
    
    // Apply the local filters to the parent component
    onFiltersChange(localFilters);
    setSelectedLandmark(localSelectedLandmark);
    handleToggle();
  };

  // Create mock range states for compatibility with existing RangeMoreFilters component
  const createRangeState = (attribute: string): RangeState => ({
    start: [localFilters[`${attribute}_min`], localFilters[`${attribute}_max`]],
    range: { min: 0, max: 10000000 }, // You might want to fetch actual min/max from your service
    refine: (range: [number, number]) => updateRangeFilter(attribute, range),
    currentRefinement: [localFilters[`${attribute}_min`], localFilters[`${attribute}_max`]]
  });

  const sbuaRangeState = createRangeState("sbua");
  const totalAskPriceState = createRangeState("totalAskPrice");
  const plotSizeState = createRangeState("plotSize");
  const carpetState = createRangeState("carpet");
  const askPricePerSqftState = createRangeState("askPricePerSqft");

  // Mock dropdown items - you should replace these with actual data from your service
  const createDropdownItems = (attribute: string) => {
    const normalizeFacetData = (
      facets: Record<string, Record<string, number>>,
      attribute: string
    ) => {
      const facet = facets[attribute];
      if (!facet) return [];
      return Object.entries(facet).map(([value, count]) => ({
        value,
        label: value, // if you need human-readable labels, map here
        count,
      }));
    };

    return normalizeFacetData(facets, attribute);
  };

  return (
    <Modal
      visible={isOpen}
      onShow={() => setForceRender((prev) => !prev)}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        try {
          logEvent(analytics, "more_filters_close", {
            event_category: "filters",
            event_label: "modal_close",
            close_method: "back_button",
            applied_filters: Object.keys(localFilters).length,
            user_type: userType,
          });
        } catch (error) {
          console.error("Error logging modal close:", error);
        }
        handleToggle();
      }}
    >
      <View
        className="flex-1 bg-white"
        style={{
          zIndex: 1,
          paddingTop: Platform.OS === "ios" ? 40 : 0,
        }}
      >
        {/* Header */}
        {forceRender && <View style={{ height: 0 }} />}
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200 mb-2">
          <Text className="font-semibold text-lg text-gray-800">Filters</Text>
          <TouchableOpacity onPress={handleToggle}>
            <CloseIcon />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 py-2 mb-2">
          {/* Location Filter - Lower z-index */}
          <View className="" style={{ zIndex: 40 }}>
            {/* Location Tabs */}
            <View className="bg-[#EFF0F1] p-2 rounded-[8px]">
              <View className="flex-row">
                <TouchableOpacity
                  className={`flex-1 py-3 px-4 rounded-[5px] ${
                    selectedLocationFilter === "landmark" ? "bg-[#205E59]" : ""
                  }`}
                  onPress={() => handleLocationFilterChange("landmark")}
                >
                  <Text
                    className={`text-center font-medium ${
                      selectedLocationFilter === "landmark"
                        ? "text-white"
                        : "text-black"
                    }`}
                    style={{ fontFamily: "Montserrat_600SemiBold" }}
                  >
                    Landmark
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 py-3 px-4 rounded-md ${
                    selectedLocationFilter === "micromarket"
                      ? "bg-[#205E59]"
                      : ""
                  }`}
                  onPress={() => handleLocationFilterChange("micromarket")}
                >
                  <Text
                    className={`text-center font-medium ${
                      selectedLocationFilter === "micromarket"
                        ? "text-white"
                        : "text-black"
                    }`}
                    style={{ fontFamily: "Montserrat_600SemiBold" }}
                  >
                    Micromarket
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Search Input with proper z-index */}
          <View className="py-2.5">
            {selectedLocationFilter === "landmark" && (
              <View style={{ zIndex: 1500 }}>
                <LandmarkDropdownFilters
                  selectedLandmark={localSelectedLandmark}
                  setSelectedLandmark={setLocalSelectedLandmark}
                />
              </View>
            )}

            {selectedLocationFilter === "micromarket" && (
              <SearchableRefinementList
                items={createDropdownItems("micromarket")}
                attribute="micromarket"
              />
            )}
          </View>

          {/* Asset Type & Configuration - First Row */}
          <View className="flex-row flex-wrap justify-between mb-4">
            {/* Asset Type Dropdown - Now with higher z-index */}
            <View
              className="p-4 border border-gray-200 rounded-xl w-[48%]"
              style={{ zIndex: 30 }}
            >
              <Text
                className="text-base text-[14px] text-black mb-2"
                style={{ fontFamily: "Montserrat_600SemiBold" }}
              >
                {outsideFilters[0].title}
              </Text>
              <DropdownMoreFilters
                title="Please Select"
                items={createDropdownItems("assetType")}
                refine={(value: string) => toggleFilterValue("assetType", value)}
                isAssetType={true}
              />
            </View>

            {/* Configuration Dropdown - Now with lower z-index than Asset Type */}
            <View
              className="p-4 border border-gray-200 rounded-xl w-[48%] "
              style={{ zIndex: 30 }}
            >
              <Text
                className="text-base text-[14px] text-black mb-2 "
                style={{ fontFamily: "Montserrat_600SemiBold" }}
              >
                {outsideFilters[1].title}
              </Text>
              <DropdownMoreFilters
                title="Please Select"
                items={createDropdownItems("unitType")}
                refine={(value: string) => toggleFilterValue("unitType", value)}
                isRight={true}
              />
            </View>
          </View>

          {/* SBUA Range - Lower z-index */}
          <View style={{ zIndex: 10 }}>
            <RangeMoreFilters
              title={outsideFilters[2].title}
              refine={sbuaRangeState.refine}
              range={sbuaRangeState.range}
              start={sbuaRangeState.start}
            />
          </View>

          {/* Total Ask Price Range - Lower z-index */}
          <View style={{ zIndex: 10 }}>
            <RangeMoreFilters
              title={outsideFilters[3].title}
              refine={totalAskPriceState.refine}
              range={totalAskPriceState.range}
              start={totalAskPriceState.start}
            />
          </View>

          {/* Plot Size Range - Lower z-index */}
          <View style={{ zIndex: 5 }}>
            <RangeMoreFilters
              title={insideFilters[0].title}
              refine={plotSizeState.refine}
              start={plotSizeState.start}
              range={plotSizeState.range}
            />
          </View>

          {/* Carpet Area Range - Lower z-index */}
          <View style={{ zIndex: 5 }}>
            <RangeMoreFilters
              title={insideFilters[1].title}
              refine={carpetState.refine}
              start={carpetState.start}
              range={carpetState.range}
            />
          </View>

          {/* Ask Price/Sqft Range - Lower z-index */}
          <View style={{ zIndex: 5 }}>
            <RangeMoreFilters
              title={insideFilters[2].title}
              refine={askPricePerSqftState.refine}
              start={askPricePerSqftState.start}
              range={askPricePerSqftState.range}
            />
          </View>

          <View className="flex-row flex-wrap justify-between">
            {/* Facing Dropdown with proper z-index */}
            <View
              className="p-4 border border-gray-200 rounded-xl w-[48%] mb-4"
              style={{ zIndex: 15 }}
            >
              <Text className="font-semibold text-sm text-gray-700 mb-3">
                {insideFilters[3].title}
              </Text>
              <DropdownMoreFilters
                title="Please Select"
                items={createDropdownItems("facing")}
                refine={(value: string) => toggleFilterValue("facing", value)}
              />
            </View>

            {/* Floor Dropdown with slightly lower z-index */}
            <View
              className="p-4 border border-gray-200 rounded-xl w-[48%] mb-4"
              style={{ zIndex: 10 }}
            >
              <Text className="font-semibold text-sm text-gray-700 mb-3">
                {insideFilters[4].title}
              </Text>
              <DropdownMoreFilters
                title="Please Select"
                items={createDropdownItems("floorNo")}
                refine={(value: string) => toggleFilterValue("floorNo", value)}
                isRight={true}
              />
            </View>
          </View>

          {/* Status Refinement List - Lower z-index */}
          <View
            className="p-4 border border-gray-200 rounded-xl w-full mb-4"
            style={{ zIndex: 5 }}
          >
            <Text className="font-semibold text-sm text-gray-700 mb-3">
              {insideFilters[5].title}
            </Text>
            {renderRefinementList(createDropdownItems("currentStatus"), "currentStatus")}
          </View>

          {/* Area Refinement List - Lowest z-index */}
          <View
            className="p-4 border border-gray-200 rounded-xl w-full mb-4"
            style={{ zIndex: 1 }}
          >
            <Text className="font-semibold text-sm text-gray-700 mb-3">
              {insideFilters[6].title}
            </Text>
            {renderRefinementList(createDropdownItems("area"), "area")}
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="p-4 border-t border-gray-200">
          <TouchableOpacity
            className="bg-[#153E3B] py-3 mx-4 rounded-md items-center"
            onPress={handleShowResults}
          >
            <Text className="text-white font-medium text-md ml-1">
              Show Results
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  refinements: {
    flexDirection: "row",
  },
});

export default MoreFilters;
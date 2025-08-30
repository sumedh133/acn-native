import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import LandmarkDropdownFilters from "./LandmarkDropdownFilters";
import SearchableRefinementList from "./SearchableRefinementList";
import { Landmark } from "../../../types";
import { SearchFilters } from "../../../services/property_services/propertyAlgoliaService";
import ToggleTabs from "../../ToggleTabs";
import BackButtonIcon from "@/assets/icons/svg/PropertiesPage/BackButtonIcon";
import FilterChipList from "./FilterChipList";
import {
  apartmentTypes,
  availabilityOptions,
  bedroomOptions,
  commercialPropertyTypes,
  commercialSubTypes,
  facingOptions,
  floorOptions,
  possessionOptions,
  preferredTenantsOptions,
  residentialPropertyTypes,
  zoneOptions,
} from "./moreFilterOptions";
import DropdownTailwind from "../../DropdownTailwind";
import NumberRangeFilter from "./NumberRangeFilter";
import BudgetRangeFilter from "./BudgetFilter";

const defaultRanges: Record<string, [string, string]> = {
  rent: ["5000", "100000"],
  totalAskPrice: ["100000", "1000000000"],
  sbua: ["", ""], // if empty strings represent default
  carpetArea: ["", ""],
};

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
  handleToggle,
  selectedLandmark,
  setSelectedLandmark,
  filters,
  facets,
  onFiltersChange,
}: MoreFiltersProps) => {
  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";
  const [selectedLocationFilter, setSelectedLocationFilter] =
    useState("landmark");
  const [viewMode, setViewMode] = useState<"residential" | "commercial">(
    "residential"
  );

  // Local filter state - manage filters locally until applied
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [localSelectedLandmark, setLocalSelectedLandmark] =
    useState<Landmark | null>(selectedLandmark);

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
    setLocalFilters((prev) => ({
      ...prev,
      [attribute]: values,
    }));
  };
  // Helper function to toggle a filter value
  const toggleFilterValue = (
    attribute: string,
    value: string | string[] | null,
    singleSelect: boolean = false
  ) => {
    // Handle null values (clear filter)
    if (value === null) {
      updateLocalFilter(attribute, []);
      return;
    }

    // Handle array values (from multi-select)
    if (Array.isArray(value)) {
      updateLocalFilter(attribute, value);
      return;
    }

    // Handle single string values (original logic)
    const currentValues = localFilters[attribute as keyof SearchFilters] || [];
    const isSelected = currentValues.includes(value);

    let newValues: string[];

    if (singleSelect) {
      if (isSelected) {
        newValues = [];
      } else {
        newValues = [value];
      }
    } else {
      newValues = isSelected
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
    }

    updateLocalFilter(attribute, newValues);
  };

  const handleReset = () => {
    setLocalFilters({ listingType: filters.listingType || [] });
    // setViewMode("residential");
    setLocalSelectedLandmark(null);
  };

  // Clear specific attribute filter
  const clearAttributeFilter = (attribute: string) => {
    setLocalFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[attribute as keyof SearchFilters];
      // Also clear range filters if applicable
      delete newFilters[`${attribute}_min` as keyof SearchFilters];
      delete newFilters[`${attribute}_max` as keyof SearchFilters];
      return newFilters;
    });
  };

  // Only set default tab once when modal opens, not every filter change
  useEffect(() => {
    if (isOpen) {
      if (localFilters.micromarket && localFilters.micromarket.length > 0) {
        setSelectedLocationFilter("micromarket");
      } else if (localSelectedLandmark) {
        setSelectedLocationFilter("landmark");
      }
    }
  }, [isOpen]);

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

    const appliedFilters: SearchFilters = { ...localFilters };

    // Remove range filters that are at default
    Object.entries(defaultRanges).forEach(([attr, defaultRange]) => {
      const val = appliedFilters[attr as keyof SearchFilters];
      if (!val || val.length !== 2) return;

      const [currentMin, currentMax] = val;

      if (currentMin === defaultRange[0] && currentMax === defaultRange[1]) {
        delete appliedFilters[attr as keyof SearchFilters];
      }
    });

    onFiltersChange(appliedFilters);
    setSelectedLandmark(localSelectedLandmark);
    handleToggle();
  };

  // Create dropdown items from facets
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
        <View className="flex-row justify-between items-center p-4 pb-3 border-b border-gray-200 mb-1">
          {/* Left: Back button + title */}
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleToggle}
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-2"
            >
              <BackButtonIcon />
            </TouchableOpacity>
            <Text
              className="font-semibold text-lg text-gray-800 mt-1"
              style={{ fontFamily: "Montserrat_700Bold" }}
            >
              Filters
            </Text>
          </View>

          {/* Right: Reset */}
          <TouchableOpacity onPress={handleReset}>
            <Text className="text-red-600 text-sm mt-1 underline">Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 py-2 mb-2">
          <ToggleTabs
            tabs={[
              { label: "Landmark", value: "landmark" },
              { label: "Micromarket", value: "micromarket" },
            ]}
            activeTab={selectedLocationFilter}
            onChange={(val) => handleLocationFilterChange(val)}
            sliderClassName="rounded-lg top-[6.5px] bg-[#205E59]"
            containerClassName="rounded-lg border-0 bg-gray-200 h-14"
            sliderHeight="88%"
          />

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
                localFilters={localFilters}
                onToggleFilterValue={toggleFilterValue}
              />
            )}
          </View>

          {/* Rest of the filters */}
          <View className="flex-col mt-1">
            <FilterChipList
              title="Select Category Type"
              items={[
                { label: "Residential", value: "residential" },
                { label: "Commercial", value: "commercial" },
              ]}
              attribute="viewMode" // Changed from "propertyType"
              localFilters={{ viewMode: [viewMode] }} // Use the UI state instead of actual filters
              onToggleFilterValue={(_, val) => {
                // Update the view mode, not the filters
                if (val && typeof val === "string") {
                  setViewMode(val as "residential" | "commercial");
                }
              }}
              singleSelect={true}
              containerClassName="gap-[10px] "
              chipClassName="px-3 py-1.5 rounded-full"
              titleClassName="text-sm"
            />
            <FilterChipList
              title={
                viewMode === "residential" ? "Property Type" : "Asset Type"
              }
              items={
                viewMode === "commercial"
                  ? commercialPropertyTypes
                  : residentialPropertyTypes
              }
              attribute="assetType"
              localFilters={localFilters}
              onToggleFilterValue={toggleFilterValue}
              singleSelect={false} // Changed to false for multi-select
              horizontal
              containerClassName="gap-4"
              labelClassName="text-[11px] leading-[12px]"
              chipClassName="w-[84px] h-[80px] px-0.5"
              titleClassName="text-sm"
            />
            {/* Render commercial sub-types if in commercial view and any commercial asset type is selected */}
            {viewMode === "commercial" &&
              localFilters?.assetType?.some((type) =>
                ["Office Space", "Retail Space", "Commercial Space"].includes(
                  type
                )
              ) && (
                <View>
                  {/* Create a merged list of all sub-types from selected commercial asset types */}
                  <FilterChipList
                    title="Property Sub-Type"
                    items={
                      // Flatten and merge all sub-types from selected asset types
                      localFilters.assetType
                        ?.filter((type) =>
                          [
                            "Office Space",
                            "Retail Space",
                            "Commercial Space",
                          ].includes(type)
                        )
                        .flatMap(
                          (assetType) => commercialSubTypes[assetType] || []
                        )
                        // Remove duplicates if any
                        .filter(
                          (item, index, self) =>
                            index ===
                            self.findIndex((t) => t.value === item.value)
                        )
                    }
                    attribute="commercialSubType" // Single attribute for all sub-types
                    localFilters={localFilters}
                    onToggleFilterValue={toggleFilterValue}
                    singleSelect={false}
                    containerClassName="gap-2 flex-wrap"
                    chipClassName="px-3 py-1.5 rounded-lg"
                    titleClassName="text-sm"
                  />
                </View>
              )}

            {localFilters?.propertyType?.includes("commercial") &&
              ["Office Space", "Retail Space", "Commercial Space"].some(
                (type) => localFilters?.assetType?.includes(type)
              ) && (
                <FilterChipList
                  title={`${localFilters.assetType?.[0]} Type`}
                  items={
                    localFilters.assetType?.[0]
                      ? commercialSubTypes[localFilters.assetType[0]] || []
                      : []
                  }
                  attribute="commercialSubType"
                  localFilters={localFilters}
                  onToggleFilterValue={(attr, val) =>
                    toggleFilterValue(attr, val)
                  }
                  singleSelect={true}
                  containerClassName="gap-2 flex-wrap"
                  chipClassName="px-3 py-1.5 rounded-lg"
                  titleClassName="text-sm"
                />
              )}
            {viewMode == "residential" &&
              localFilters?.assetType?.includes("apartment") && (
                <FilterChipList
                  title={`Apartment Type`}
                  items={apartmentTypes}
                  attribute="apartmentType"
                  localFilters={localFilters}
                  onToggleFilterValue={(attr, val) =>
                    toggleFilterValue(attr, val)
                  }
                  singleSelect={true}
                  containerClassName="gap-2 flex-wrap"
                  chipClassName="px-3 py-1.5 rounded-lg"
                  titleClassName="text-sm"
                />
              )}
            {viewMode == "residential" &&
              !localFilters?.assetType?.includes("plot") && (
                <FilterChipList
                  title={`Bedroom`}
                  items={bedroomOptions}
                  attribute="noOfBedrooms"
                  localFilters={localFilters}
                  onToggleFilterValue={(attr, val) =>
                    toggleFilterValue(attr, val)
                  }
                  singleSelect={true}
                  containerClassName="gap-2 flex-wrap"
                  chipClassName="px-3 py-1.5 rounded-lg"
                  titleClassName="text-sm"
                />
              )}

            {/* Budget Filter */}
            <BudgetRangeFilter
              title="Budget"
              attribute={
                filters.listingType?.includes("rental")
                  ? "rent"
                  : "totalAskPrice"
              }
              localFilters={localFilters}
              onChangeRange={(attr, range) => {
                toggleFilterValue(attr, range);
              }}
              type={
                filters.listingType?.includes("rental") ? "rental" : "resale"
              }
            />

            <NumberRangeFilter
              attribute="sbua"
              title="SBUA (sqft)"
              localFilters={localFilters}
              onChangeRange={(attr, range) => {
                toggleFilterValue(attr, range);
              }}
            />

            <View className="flex-row mb-9">
              <DropdownTailwind
                multiSelect={true}
                value={localFilters.facing ?? null}
                setValue={(val) => toggleFilterValue("facing", val)}
                options={facingOptions}
                placeholder="Select"
                title="Facing"
                containerClassName="flex-1 mr-2"
              />
              <DropdownTailwind
                multiSelect={true}
                value={localFilters.floor ?? null}
                setValue={(val) => toggleFilterValue("floor", val)}
                options={floorOptions}
                placeholder="Select"
                title="Floor"
                containerClassName="flex-1 "
              />
            </View>
            <View className="flex-row mb-6">
              <DropdownTailwind
                multiSelect={true}
                value={localFilters.furnishing ?? null}
                setValue={(val) => toggleFilterValue("furnishing", val)}
                options={floorOptions}
                placeholder="Select"
                title="Furnishing"
                containerClassName="flex-1"
              />
              {filters.listingType?.includes("rental") && (
                <DropdownTailwind
                  multiSelect={true}
                  value={localFilters.preferredTenants ?? null}
                  setValue={(val) => toggleFilterValue("preferredTenants", val)}
                  options={preferredTenantsOptions}
                  placeholder="Select"
                  title="Preferred Tenant"
                  containerClassName="flex-1 ml-2"
                />
              )}
            </View>

            {filters.listingType?.includes("rental") && (
              <View className="mb-4 mt-2">
                <TouchableOpacity
                  className="flex-row items-center pb-2"
                  onPress={() =>
                    toggleFilterValue("nonVegAllowed", "true", true)
                  }
                >
                  <View
                    className={`w-4 h-4 rounded border mr-3 ${
                      localFilters.nonVegAllowed?.includes("true")
                        ? "bg-[#153E3B] border-[#153E3B]"
                        : "bg-white border-gray-400"
                    }`}
                  >
                    {localFilters.nonVegAllowed?.includes("true") && (
                      <Text className="text-white text-xs text-center leading-4">
                        ✓
                      </Text>
                    )}
                  </View>
                  <Text
                    className="text-[#2B2928] text-base"
                    style={{ fontFamily: "Lato_400Regular" }}
                  >
                    Non Veg Allowed
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center py-2"
                  onPress={() => toggleFilterValue("petsAllowed", "true", true)}
                >
                  <View
                    className={`w-4 h-4 rounded border mr-3 ${
                      localFilters.petsAllowed?.includes("true")
                        ? "bg-[#153E3B] border-[#153E3B]"
                        : "bg-white border-gray-400"
                    }`}
                  >
                    {localFilters.petsAllowed?.includes("true") && (
                      <Text className="text-white text-xs text-center leading-4">
                        ✓
                      </Text>
                    )}
                  </View>
                  <Text
                    className="text-[#2B2928] text-base"
                    style={{ fontFamily: "Lato_400Regular" }}
                  >
                    Pets Allowed
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {filters.listingType?.includes("resale") && (
              <FilterChipList
                title={`possession`}
                items={possessionOptions}
                attribute="possession"
                localFilters={localFilters}
                onToggleFilterValue={(attr, val) =>
                  toggleFilterValue(attr, val)
                }
                containerClassName="gap-2 flex-wrap"
                chipClassName="px-3 py-1.5 rounded-lg"
                titleClassName="text-sm"
              />
            )}
            {localFilters.listingType?.includes("rental") && (
              <FilterChipList
                title={`Availability`}
                items={availabilityOptions}
                attribute="availableFrom"
                localFilters={localFilters}
                onToggleFilterValue={(attr, val) =>
                  toggleFilterValue(attr, val)
                }
                containerClassName="gap-2 flex-wrap"
                chipClassName="px-3 py-1.5 rounded-lg"
                titleClassName="text-sm"
              />
            )}
            <FilterChipList
              title={`Area`}
              items={zoneOptions}
              attribute="zone"
              localFilters={localFilters}
              onToggleFilterValue={(attr, val) => toggleFilterValue(attr, val)}
              containerClassName="gap-2 flex-wrap"
              chipClassName="px-3 py-1.5 rounded-lg"
              titleClassName="text-sm"
            />
          </View>

          {localFilters.listingType?.includes("resale") && (
            <NumberRangeFilter
              attribute="carpetArea"
              title="Carpet Area (sqft)"
              localFilters={localFilters}
              onChangeRange={(attr, range) => {
                toggleFilterValue(attr, range);
              }}
            />
          )}
        </ScrollView>

        {/* Footer */}
        <View className="p-4 py-3 border-t border-gray-200">
          <TouchableOpacity
            className="bg-[#153E3B] py-3 mx-4 rounded-md items-center"
            onPress={handleShowResults}
          >
            <Text
              className="text-white font-medium text-base ml-1"
              style={{ fontFamily: "Lato_400Regular" }}
            >
              Show Results
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default MoreFilters;

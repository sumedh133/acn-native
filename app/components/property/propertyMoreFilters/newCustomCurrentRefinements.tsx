import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { SearchFilters } from "../../../services/property_services/propertyAlgoliaService";
import { formatCostSuffix } from "@/app/helpers/common";
import { toCapitalize } from "@/app/helpers/format/format";
import { trackEvent } from "@/app/services/logAnalyticsService";


interface CustomCurrentRefinementsProps {
  selectedLandmark?: any;
  sortBy?: any;
  setSelectedLandmark?: (landmark: any) => void;
  onSortChange?: (sortBy: any) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const sortDisplayMap: Record<string, string> = {
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  date_desc: "Newest First",
  date_asc: "Oldest First",
  price_per_sqft_asc: "Price/Sqft: Low to High",
  price_per_sqft_desc: "Price/Sqft: High to Low",
  relevanceLow: "Most Relevant",
};


export default function CustomCurrentRefinements({
  selectedLandmark,
  setSelectedLandmark,
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
}: CustomCurrentRefinementsProps) {
  const userType =
    useSelector((state: RootState) => state.agent?.docData?.userType) || "free";

  // Convert filters object into an array of {key, value}
  // Convert filters object into an array of {key, value, isRange?}
  const allRefinements = Object.entries(filters)
    .filter(
      ([key]) =>
        key !== "listingType" && key !== "stage" && key !== "builderCategory"
    )
    .filter(([key]) => key !== "cpId")
    .filter(([key]) => key !== "status")
    .flatMap(([key, values]) => {
      if (!values) return [];

      // Range filters without formatting
      if (key === "sbua" || key === "carpetArea") {
        const [min, max] = values;
        let label = "";
        if (min && max) {
          label = `${min} - ${max}`;
        } else if (min) {
          label = `> ${min}`;
        } else if (max) {
          label = `< ${max}`;
        }

        if (label) {
          return [
            {
              attribute: key,
              value: label,
              isRange: true,
              raw: values, // keep original [min,max] for removal
            },
          ];
        }
        return [];
      }

      // Range filters with formatting
      if (key === "rent" || key === "totalAskPrice") {
        const [min, max] = values;
        let label = "";
        if (min && max) {
          label = `${formatCostSuffix(Number(min))} - ${formatCostSuffix(
            Number(max)
          )}`;
        } else if (min) {
          label = `> ${formatCostSuffix(Number(min))}`;
        } else if (max) {
          label = `< ${formatCostSuffix(Number(max))}`;
        }

        if (label) {
          return [
            {
              attribute: key,
              value: label,
              isRange: true,
              raw: values,
            },
          ];
        }
        return [];
      }

      // Default multi-select filters
      return values
        .filter((val: any) => val && val.trim() !== "")
        .map((val: any) => ({
          attribute: key,
          value: val,
          isRange: false,
        }));
    });

  const handleRefinementRemove = (
    attribute: string,
    value: string,
    raw?: string[]
  ) => {
    try {
      trackEvent("property_filter_remove", undefined, undefined, { page_type: filters?.listingType?.[0] });
    } catch (error) {
      console.error("Error logging refinement removal:", error);
    }

    let newFilters: SearchFilters;

    if (
      attribute === "sbua" ||
      attribute === "carpetArea" ||
      attribute === "rent" ||
      attribute === "totalAskPrice"
    ) {
      newFilters = {
        ...filters,
        [attribute]: [],
      };
    } else {
      newFilters = {
        ...filters,
        [attribute]: (filters[attribute as keyof SearchFilters] || []).filter(
          (v) => v !== value
        ),
      };
    }

    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    try {
      trackEvent("property_filter_clear", undefined, undefined, { page_type: filters?.listingType?.[0] || 'resale' }).catch((error) => {
        console.error(`Error logging event: ${error}`);
      });
    } catch (error) {
      console.error(`Unexpected error: ${error}`);
    }

    // Keep type, reset everything else, including sortBy
    onFiltersChange({
      listingType: filters.listingType,
      status: ["available", "Available"],
    });
    if(onSortChange)  onSortChange("relevance")

    if (setSelectedLandmark) {
      setSelectedLandmark(null);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-row"
    >
      <View className="flex-row items-center px-4 space-x-2 mb-2">
        {(allRefinements.length > 0 || selectedLandmark || sortBy ) && sortBy.toLowerCase() !== "relevance" && (
          <TouchableOpacity onPress={handleClearAll} className="ml-1">
            <View className="flex-row items-center border border-[#DE1135] bg-[#FFE8EC]/10 px-2 py-1.5 rounded-3xl">
              <Text className="font-lato-semibold text-sm leading-[154%] text-[#313534] overflow-hidden">
                Clear All 
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {selectedLandmark && (
          <TouchableOpacity
            onPress={() => {
              try {
                logEvent(analytics, "remove_landmark_filter", {
                  event_category: "filters",
                  event_label: "remove",
                  landmark_name: selectedLandmark.name,
                  radius: selectedLandmark.radius,
                  user_type: userType,
                });
              } catch (error) {
                console.error("Error logging landmark removal:", error);
              }
              setSelectedLandmark && setSelectedLandmark(null);
            }}
            className="flex-row items-center bg-[#FCE9BA] px-3 py-1.5 rounded-full"
          >
            <Text className="font-lato-semibold text-sm text-[#313534] mr-2">
              {selectedLandmark.name} ({selectedLandmark.radius / 1000}km)
            </Text>
            <Text className="text-base text-[#313534]">×</Text>
          </TouchableOpacity>
        )}

        {sortBy && sortBy.toLowerCase() !== "relevance" && (
          <TouchableOpacity
            onPress={() => {
              try {
                logEvent(analytics, "remove_sort_filter", {
                  event_category: "filters",
                  event_label: "remove",
                  sort_type: sortBy,
                  user_type: userType,
                });
              } catch (error) {
                console.error("Error logging sort removal:", error);
              }

              // Reset sortBy to "most relevant"
              onFiltersChange({ ...filters});
              if(onSortChange){console.log("happening");  onSortChange("relevance")}
            }}
            className="flex-row items-center bg-[#D0E8FF] px-3 py-1.5 rounded-full"
          >
            <Text className="font-lato-semibold text-sm text-[#313534] mr-2">
              {sortDisplayMap[sortBy] || toCapitalize(sortBy)}
            </Text>
            <Text className="text-base text-[#313534]">×</Text>
          </TouchableOpacity>
        )}

        {allRefinements.map((item, index) => (
          <TouchableOpacity
            key={`${item.attribute}-${item.value}-${index}`}
            onPress={() => handleRefinementRemove(item.attribute, item.value)}
            className="flex-row items-center bg-[#FCE9BA] px-3 py-1.5 rounded-full"
          >
            <Text className="font-lato-semibold text-sm text-[#313534] mr-2">
              {item.attribute === "agentCpid"
                ? "My Requirements"
                : toCapitalize(item.value)}
            </Text>
            <Text className="text-base text-[#313534]">×</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

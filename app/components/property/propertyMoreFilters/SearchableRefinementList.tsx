import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import NewSearchIcon from "@/assets/icons/svg/PropertiesPage/NewSearchIcon";
import { SearchFilters } from "../../../services/property_services/propertyAlgoliaService";

const MAX_VISIBLE = 7;

interface RefinementItem {
  value: string;
  label: string;
  count: number;
}

interface SearchableRefinementListProps {
  items: RefinementItem[];
  attribute: string;
  localFilters: SearchFilters;
  onToggleFilterValue: (attribute: string, value: string) => void;
}

const SearchableRefinementList: React.FC<SearchableRefinementListProps> = ({
  items,
  attribute,
  localFilters,
  onToggleFilterValue,
}) => {
  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";
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
      const isRefined = (
        localFilters[attribute as keyof SearchFilters] || []
      ).includes(value);
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
    onToggleFilterValue(attribute, value);
  };

  return (
    <View className="w-full mb-2">
      {attribute === "micromarket" && (
        <View className="flex-row items-center w-full border px-2 border-gray-300 rounded-md h-11 pl-3 bg-[#FAFAFA] mb-2">
          <NewSearchIcon strokeColor="#726C6C" />
          <TextInput
            className="text-xs ml-2"
            placeholder="Search micromarket..."
            value={searchQuery}
            onChangeText={handleSearch}
            style={{ fontFamily: "Lato_400Regular" }}
          />
        </View>
      )}

      <View className="flex-row flex-wrap gap-2 ">
        {filteredItems
          ?.slice(0, Math.min(MAX_VISIBLE, filteredItems.length))
          ?.map((item) => {
            const isRefined = (
              localFilters[attribute as keyof SearchFilters] || []
            ).includes(item.value);

            return (
              <TouchableOpacity
                key={item.value}
                className={`py-2 px-3 border border-[#B5B3B3] rounded-lg bg-[#FAFAFA] ${
                  isRefined ? "bg-[#DFF4F3] border-[#153E3B]" : ""
                }`}
                onPress={() => handleRefine(item.value)}
              >
                <View className="flex-row justify-between items-center">
                  <Text
                    style={{ fontFamily: "Lato_400Regular" }}
                    className={`text-xs leading-[150%] ${
                      isRefined ? "text-[#10302D] font-semibold" : "text-black"
                    }`}
                  >
                    {item.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

        {/* Show "+X" chip if there are more items */}
        {filteredItems.length > MAX_VISIBLE && (
          <View className="py-2 px-2 bg-[#9E9E9E] rounded-lg">
            <Text
              className="text-xs text-[#FAFAFA]"
              style={{ fontFamily: "Lato_400Regular" }}
            >
              +{filteredItems.length - MAX_VISIBLE}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default SearchableRefinementList;

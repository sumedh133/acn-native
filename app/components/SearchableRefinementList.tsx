import { logEvent } from "@react-native-firebase/analytics";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput
} from "react-native";
import { analytics } from "../config/firebase";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

export const SearchableRefinementList = ({
  items,
  refine,
  attribute,
}: {
  items: any[];
  refine: (value: string) => void;
  attribute: string;
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
      logEvent(analytics, "filter_refinement", {
        event_category: "filters",
        event_label: "refinement",
        filter_type: attribute,
        value: value,
        label: item?.label,
        action: item?.isRefined ? "remove" : "add",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging refinement:", error);
    }
    refine(value);
  };

  return (
    <View className="w-full">
      {attribute === "micromarket" && (
        <View className="mb-3">
          <TextInput
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"
            placeholder="Search categories..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      )}

      <View className="flex-row flex-wrap gap-2">
        {filteredItems
          ?.slice(0, searchQuery === "" ? 10 : filteredItems.length)
          ?.map((item) => (
            <TouchableOpacity
              key={item.value}
              className={`py-2 px-3 border border-gray-300 rounded-md bg-white ${
                item.isRefined ? "bg-[#DFF4F3] border-[#153E3B]" : ""
              }`}
              onPress={() => handleRefine(item.value)}
            >
              <View className="flex-row justify-between items-center">
                <Text
                  className={`text-sm ${
                    item.isRefined
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
          ))}
      </View>
    </View>
  );
};

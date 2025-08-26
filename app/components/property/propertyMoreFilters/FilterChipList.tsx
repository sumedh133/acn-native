import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import type { SearchFilters } from "@/app/services/property_services/propertyAlgoliaService";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export interface FilterChipItem {
  value: string;
  label: string;
  icon?: React.ReactNode; // Optional icon
}

interface FilterChipListProps {
  items: FilterChipItem[];
  attribute: string;
  localFilters: SearchFilters;
  onToggleFilterValue: (attribute: string, value: string) => void;
  horizontal?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  chipClassName?: string;
  title?: string; // optional title
  titleClassName?: string;
  singleSelect?: boolean;
}

const FilterChipList: React.FC<FilterChipListProps> = ({
  items,
  attribute,
  localFilters,
  onToggleFilterValue,
  horizontal = false,
  containerClassName = "",
  labelClassName = "",
  chipClassName = "",
  title,
  titleClassName = "",
  singleSelect = false,
}) => {
  const userType =
    useSelector((state: RootState) => state?.agent?.docData?.userType) ||
    "free";

  const handleRefine = (value: string) => {
    try {
      const item = items.find((i) => i.value === value);
      const current = (localFilters[attribute as keyof SearchFilters] ||
        []) as string[];
      const isRefined = current.includes(value);

      logEvent(analytics, "filter_refinement", {
        event_category: "filters",
        event_label: "refinement",
        filter_type: attribute,
        value,
        label: item?.label,
        action: isRefined ? "remove" : "add",
        user_type: userType,
      });

      if (singleSelect) {
        const newValues = isRefined ? [] : [value];
        if (!isRefined) {
          current.forEach((v) => {
            if (v !== value) onToggleFilterValue(attribute, v);
          });
        }
        onToggleFilterValue(attribute, value);
      } else {
        onToggleFilterValue(attribute, value);
      }
    } catch (error) {
      console.error("Error logging refinement:", error);
    }
  };

  const content = (
    <View
      className={`flex-row gap-2  ${
        !horizontal ? "flex-wrap" : ""
      } ${containerClassName}`}
    >
      {items.map((item) => {
        const isRefined = (
          localFilters[attribute as keyof SearchFilters] || []
        ).includes(item.value);

        // Shared base chip styling
        const chipState = isRefined
          ? "bg-[#DFF4F3] border-[#153E3B]"
          : "bg-[#FAFAFA] border-[#B5B3B3]";

        // Fixed square if icon present, else flexible
        const chipBase = item.icon
          ? "flex-col items-center justify-center border rounded-lg w-24 h-24"
          : "flex-row items-center py-2 px-3 border rounded-lg";

        return (
          <TouchableOpacity
            key={item.value}
            className={`${chipBase} ${chipState} ${chipClassName}`}
            onPress={() => handleRefine(item.value)}
          >
            {item.icon ? (
              <View className="flex-col items-center justify-center">
                <View className="mb-3 w-[35px] h-[35px]">{item.icon}</View>
                <Text
                  style={{ fontFamily: "Montserrat_600SemiBold" }}
                  numberOfLines={2}
                  className={`text-sm text-center  ${
                    isRefined ? "text-[#10302D] font-semibold" : "text-black"
                  } ${labelClassName}`}
                >
                  {item.label}
                </Text>
              </View>
            ) : (
              <Text
                style={{ fontFamily: "Lato_400Regular" }}
                className={`text-sm text-center ${
                  isRefined ? "text-[#10302D] font-semibold" : "text-black"
                } ${labelClassName}`}
              >
                {item.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const wrappedContent = (
    <View className="w-full mb-5">
      {title ? (
        <Text
          style={{ fontFamily: "Montserrat_600SemiBold" }}
          className={`text-base text-gray-800 mb-2 ${titleClassName}`}
        >
          {title}
        </Text>
      ) : null}
      {content}
    </View>
  );

  if (horizontal) {
    return (
      <View className="w-full mb-5">
        {title ? (
          <Text
            style={{ fontFamily: "Montserrat_600SemiBold" }}
            className={`text-base text-gray-800 mb-2 ${titleClassName}`}
          >
            {title}
          </Text>
        ) : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {content}
        </ScrollView>
      </View>
    );
  }

  return wrappedContent;
};

export default FilterChipList;

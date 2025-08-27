import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  FlatList,
  Platform,
} from "react-native";
import { useRange, useRefinementList } from "react-instantsearch";
import CheckboxFilter from "./CheckboxFilter";
import DropdownMoreFilters, { RefinementItem } from "../DropdownMoreFilters";
import RangeMoreFilters from "../RangeMoreFilters";
import { RangeState } from "../property/propertyMoreFilters/MoreFilters";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface BudgetMarketValueFiltersProps {
  isMarketValueActive: Boolean;
  isBudgetActive: Boolean;
  handleRangeFilterChange: (attribute: string) => void;
  marketValueItem: RefinementItem[];
  refineMarketValue: any;
}
const BudgetMarketValueFilters = ({
  isMarketValueActive,
  isBudgetActive,
  handleRangeFilterChange,
  marketValueItem,
  refineMarketValue,
}: BudgetMarketValueFiltersProps) => {
  const userType = useSelector((state: RootState) => state.agent?.docData?.userType) || "free";
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const { items, refine } = useRefinementList({ attribute: "marketValue" });

  const handleBudgetChange = (val: string, type: 'min' | 'max') => {
    if (type === 'min') {
      setMinBudget(val);
    } else {
      setMaxBudget(val);
    }
    handleRangeFilterChange("budget.to");

    try {
      logEvent(analytics, 'requirement_budget_filter', {
        event_category: 'filters',
        event_label: 'budget',
        filter_type: type,
        filter_value: val,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging budget filter:', error);
    }
  };

  const handleMarketValueSelect = (value: string) => {
    refineMarketValue(value);
    handleRangeFilterChange("marketValue");

    try {
      logEvent(analytics, 'requirement_market_value_filter', {
        event_category: 'filters',
        event_label: 'market_value',
        filter_value: value,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging market value filter:', error);
    }
  };

  return (
    <View className="border border-[#ECECEC] rounded-xl p-4 bg-white mb-5">
      <Text className="text-sm font-semibold text-neutral-700 mb-2">
        Budget
      </Text>

      {!isMarketValueActive && (
        <View className="mb-4 flex-row space-x-3">
          <TextInput
            className="flex-1 h-12 px-3 rounded-md border border-neutral-300 bg-white text-base text-neutral-800"
            placeholder="Min"
            value={minBudget}
            keyboardType="numeric"
            onChangeText={(val) => {
              handleBudgetChange(val, 'min');
            }}
          />
          <TextInput
            className="flex-1 h-12 px-3 rounded-md border border-neutral-300 bg-white text-base text-neutral-800"
            placeholder="Max"
            value={maxBudget}
            keyboardType="numeric"
            onChangeText={(val) => {
              handleBudgetChange(val, 'max');
            }}
          />
        </View>
      )}

      {!isBudgetActive && (
        <>
          <View className="h-px bg-neutral-300 my-2" />
          <Text className="text-sm font-semibold text-neutral-700 mt-2 mb-2">
            Market Value
          </Text>
          <View className="max-h-[240px]">
            <FlatList
              data={marketValueItem}
              numColumns={2}
              columnWrapperStyle={{
                justifyContent: "space-between",
              }}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isRefined = item.isRefined;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      handleMarketValueSelect(item.value);
                    }}
                    className={`flex-1 m-1 p-3 rounded-lg border ${
                      isRefined
                        ? "bg-[#DFF4F3] border-primary"
                        : "bg-gray-50 border-neutral-300"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isRefined ? "text-primary" : "text-neutral-800"
                      }`}
                    >
                      {item.label}
                    </Text>
                    <Text
                      className={`text-xs ${
                        isRefined ? "text-primary" : "text-neutral-500"
                      }`}
                    >
                      {item.count}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </>
      )}
    </View>
  );
};

interface MoreFiltersRequirementProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleToggle: () => void;
}
const MoreFiltersRequirement = ({
  isOpen,
  setIsOpen,
  handleToggle,
}: MoreFiltersRequirementProps) => {
  if (!isOpen) return null;

  const [showFilters, setShowFilters] = useState(true);
  const [isMarketValueActive, setIsMarketValueActive] = useState(false);
  const [isBudgetActive, setIsBudgetActive] = useState(false);
  const userType = useSelector((state: RootState) => state.agent?.docData?.userType) || "free";

  const handleRangeFilterChange = (attribute: string) => {
    if (attribute === "marketValue") {
      setIsMarketValueActive(true);
      setIsBudgetActive(false);
    } else if (attribute === "budget.to") {
      setIsBudgetActive(true);
      setIsMarketValueActive(false);
    }
  };

  const toggleFiltersVisibility = () => {
    setShowFilters(!showFilters);
  };

  const { items: assetTypeItems, refine: refineAssetType } = useRefinementList({
    attribute: "assetType",
    limit: 50,
  });

  const { items: unitTypeItems, refine: refineUnitType } = useRefinementList({
    attribute: "configuration",
    limit: 50,
  });

  const sbuaRangeState: RangeState = useRange({
    attribute: "area",
  });

  const budgetToRangeState: RangeState = useRange({
    attribute: "budget.to",
  });

  const { items, refine } = useRefinementList({ attribute: "agentCpid" });
  const { items: marketValueItem, refine: refineMarketValue } =
    useRefinementList({ attribute: "marketValue" });

  const [forceRender, setForceRender] = useState(false);

  const handleShowResults = () => {
    try {
      logEvent(analytics, 'apply_requirement_filters', {
        event_category: 'filters',
        event_label: 'apply',
        filters_active: {
          asset_type: assetTypeItems.some(item => item.isRefined),
          configuration: unitTypeItems.some(item => item.isRefined),
          sbua: sbuaRangeState.start !== undefined,
          budget: budgetToRangeState.start !== undefined
        },
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging filter application:', error);
    }
    toggleFiltersVisibility();
  };

  return (
    <Modal
      visible={showFilters}
      animationType="slide"
      onShow={() => setForceRender((prev) => !prev)}
      transparent={true}
      onRequestClose={() => {
        toggleFiltersVisibility();
      }}
    >
      <SafeAreaView
        className="flex-1 bg-white"
        style={{
          zIndex: 1,
          //Check for IOS
          // paddingTop: Platform.OS === "ios" ? 40 : 0,
        }}
      >
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
          <Text className="font-semibold text-lg text-gray-800">Filters</Text>
          <TouchableOpacity onPress={handleToggle}>
            <Text className="text-lg text-black">✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="px-4">
          <View className="flex-row flex-wrap justify-between mb-4 mt-4">
            <View
              className="p-4 border border-gray-200 rounded-xl w-[48%] mb-4"
              style={{ zIndex: 30 }}
            >
              <Text className="text-base font-semibold text-black mb-2 font-['Montserrat']">
                Asset Type
              </Text>
              <DropdownMoreFilters
                title="Please Select"
                items={assetTypeItems}
                refine={refineAssetType}
                isAssetType={true}
              />
            </View>
            <View
              className="p-4 border border-gray-200 rounded-xl w-[48%] mb-4"
              style={{ zIndex: 30 }}
            >
              <Text className="text-base font-semibold text-black mb-2 font-['Montserrat']">
                Configuration
              </Text>
              <DropdownMoreFilters
                title="Please Select"
                items={unitTypeItems}
                refine={refineUnitType}
                isRight={true}
              />
            </View>
          </View>

          <RangeMoreFilters
            title={"SBUA"}
            refine={sbuaRangeState.refine}
            range={sbuaRangeState.range}
            start={sbuaRangeState.start}
          />
          <CheckboxFilter attribute="agentCpid" items={items} refine={refine} />
          {/* <BudgetMarketValueFilters
            isBudgetActive={isBudgetActive}
            isMarketValueActive={isMarketValueActive}
            handleRangeFilterChange={handleRangeFilterChange}
            marketValueItem={marketValueItem}
            refineMarketValue={refineMarketValue}

          /> */}
          <RangeMoreFilters
            title={"Budget"}
            refine={budgetToRangeState.refine}
            range={budgetToRangeState.range}
            start={budgetToRangeState.start}
          />
        </ScrollView>

        <TouchableOpacity
          className="bg-[#103D35] p-3 mx-4 mb-8 rounded-lg items-center"
          onPress={handleShowResults}
        >
          <Text className="text-white text-lg font-semibold">Show Results</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

export default MoreFiltersRequirement;

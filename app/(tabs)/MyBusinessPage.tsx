// React Components Import
import { View, Text, TouchableOpacity, Platform } from "react-native";
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

// Page Components Import
import Header from "../components/MyBusinessPage/Header";
import Listings from "../components/MyBusinessPage/Listings";
import { useAlgoliaSearch } from "@/hooks/propertyHooks/useAlgoliaSearchProperties";
import { useSelector } from "react-redux";
import UnderReviewProperties from "../(pages)/UnderReviewProperties";
import PropertiesUnderReviewCard from "../components/MyBusinessPage/UnderReviewPropertiesButton";
import PropertyFilters from "../components/property/PropertyFilters";
import { logEvent } from "@react-native-firebase/analytics";
import MoreFilters from "../components/property/propertyMoreFilters/MoreFilters";
import { Property } from "../types";
import {
  searchProperties,
  updateProperty,
} from "../services/property_services/propertyService";
import { ScrollContext } from "../ScrollContext";
import MultiStatusUpdateModal, {
  SelectedStatuses,
} from "../components/MyBusinessPage/MultiStatusUpdateModal";
import { getUnixDateTime } from "../helpers/getUnixDateTime";

// Icons Import

const MyBusinessPage = () => {
  // State Management

  /**
   * State for active tabs
   */
  const [activeTab, setActiveTab] = useState<"property" | "requirement">(
    "property"
  );
  const [isMoreFiltersModalOpen, setIsMoreFiltersModalOpen] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMap, setStatusMap] = useState<SelectedStatuses>({
    available: {
      selected: false,
      propertyIds: [],
    },
    hold: {
      selected: false,
      propertyIds: [],
    },
    sold: {
      selected: false,
      propertyIds: [],
    },
    tenanted: {
      selected: false,
      propertyIds: [],
    },
    "de-listed": {
      selected: false,
      propertyIds: [],
    },
  });
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(
    new Set()
  );
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const navigation = useNavigation();

  // Use Selector to fetch from Local States
  const cpId = useSelector((state: any) => state?.agent?.docData?.cpId);

  // Services Call

  /**
   * Fetch data from algolia
   */

  const {
    searchState,
    query,
    filters,
    facets,
    selectedLandmark,
    sortBy,
    updateQuery,
    updateFilters,
    updateLandmark,
    updateSort,
    refresh,
    loadMore,
  } = useAlgoliaSearch({ cpId: [cpId] });

  const handleToggleMoreFilters = () => {
    // try {
    //   logEvent(analytics, "property_filters_toggle", {
    //     event_category: "interaction",
    //     event_label: "filters",
    //     filter_state: !isMoreFiltersModalOpen ? "open" : "close",
    //     user_type: userType,
    //   });
    // } catch (error) {
    //   console.error("Error logging filter toggle:", error);
    // }
    setIsMoreFiltersModalOpen((prev) => !prev);
    // Keyboard.dismiss();
  };

  // Multiselect handlers
  const handleToggleSelection = (
    propertyId: string,
    propertyStatus: string
  ) => {
    setSelectedProperties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }

      // Exit selection mode if no items are selected
      if (newSet.size === 0) {
        setIsSelectionMode(false);
      }

      return newSet;
    });

    switch (propertyStatus) {
      case "available":
        statusMap.available.propertyIds.push(propertyId);
        break;
      case "hold":
        statusMap.hold.propertyIds.push(propertyId);
        break;
      case "sold":
        statusMap.sold.propertyIds.push(propertyId);
        break;
      case "tenanted":
        statusMap.tenanted.propertyIds.push(propertyId);
        break;
      case "de-listed":
        statusMap["de-listed"].propertyIds.push(propertyId);
        break;
    }
  };

  const handleLongPress = (propertyId: string, propertyStatus: string) => {
    // Enter selection mode and select the item
    setIsSelectionMode(true);
    setSelectedProperties((prev) => {
      const newSet = new Set(prev);
      newSet.add(propertyId);
      return newSet;
    });

    switch (propertyStatus) {
      case "available":
        statusMap.available.propertyIds.push(propertyId);
        break;
      case "hold":
        statusMap.hold.propertyIds.push(propertyId);
        break;
      case "sold":
        statusMap.sold.propertyIds.push(propertyId);
        break;
      case "tenanted":
        statusMap.tenanted.propertyIds.push(propertyId);
        break;
      case "de-listed":
        statusMap["de-listed"].propertyIds.push(propertyId);
        break;
    }
  };

  const handleStatusUpdate = () => {
    const finalPropertyIdsToUpdate = [];
    if (statusMap.available.selected)
      finalPropertyIdsToUpdate.push(statusMap.available.propertyIds);

    if (statusMap.sold.selected)
      finalPropertyIdsToUpdate.push(statusMap.sold.propertyIds);

    if (statusMap.hold.selected)
      finalPropertyIdsToUpdate.push(statusMap.hold.propertyIds);
    if (statusMap.tenanted.selected)
      finalPropertyIdsToUpdate.push(statusMap.tenanted.propertyIds);
    if (statusMap["de-listed"].selected)
      finalPropertyIdsToUpdate.push(statusMap["de-listed"].propertyIds);
    for (const i in finalPropertyIdsToUpdate) {
      updateProperty(i, {
        status: "available",
        dateOfLastChecked: getUnixDateTime(),
      });
    }
  };

  const handleSelectAll = () => {
    if (searchState.allResults) {
      // Add haptic feedback for bulk selection
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Haptics.selectionAsync();
      }

      const allPropertyIds = searchState.allResults.map(
        (property) => property.propertyId
      );
      setSelectedProperties(new Set(allPropertyIds));
    }
  };

  const handleDeselectAll = () => {
    // Add haptic feedback for clearing selection
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.selectionAsync();
    }

    setSelectedProperties(new Set());
    setIsSelectionMode(false);
  };

  const handleExitSelectionMode = () => {
    setSelectedProperties(new Set());
    setIsSelectionMode(false);
  };

  // update function for multi selected properties

  // Hide footer when selection bar (multi-select) is visible
  useLayoutEffect(() => {
    try {
      // Footer should be hidden if any items are selected
      (navigation as any)?.setParams?.({
        showFooter: selectedProperties.size === 0,
      });
    } catch {}
  }, [selectedProperties.size, navigation]);

  const handleMarkAsAvailable = () => {
    // Add haptic feedback
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // TODO: Implement mark as available functionality
    setShowStatusModal(true);
    // For now, just clear selection
    handleExitSelectionMode();
  };

  // Scroll context
  const { resetFooterPosition } = useContext(ScrollContext);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const propertyResults: Property[] = await searchProperties("cpId", cpId);
      setProperties(propertyResults || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    resetFooterPosition();
  }, []);

  useEffect(() => {
    try {
      fetchProperties();
    } catch (error) {
      console.error(error);
    }
  }, [fetchProperties]);

  return (
    <View className="flex-1 flex-col">
      <Header
        activeCard={activeTab}
        setActiveCard={setActiveTab}
        count={{ property: searchState.allResults.length, requirement: 0 }}
      />
      <PropertyFilters
        handleToggleMoreFilters={handleToggleMoreFilters}
        selectedLandmark={selectedLandmark}
        setSelectedLandmark={updateLandmark}
        query={query}
        onQueryChange={updateQuery}
        filters={filters}
        onFiltersChange={updateFilters}
        sortBy={sortBy}
        onSortChange={updateSort}
        showTabs={false}
        isMyBusinessPage={true}
      />
      {properties && properties.length > 0 && (
        <PropertiesUnderReviewCard count={properties.length} />
      )}
      <View className={`flex-1 ${selectedProperties.size > 0 ? "pb-20" : ""}`}>
        <Listings
          data={searchState}
          loadMore={loadMore}
          refresh={refresh}
          selectedProperties={selectedProperties}
          isSelectionMode={isSelectionMode}
          onToggleSelection={handleToggleSelection}
          onLongPress={handleLongPress}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onExitSelectionMode={handleExitSelectionMode}
          loading={loading}
        />
      </View>
      <MoreFilters
        isOpen={isMoreFiltersModalOpen}
        setIsOpen={setIsMoreFiltersModalOpen}
        handleToggle={handleToggleMoreFilters}
        isMobile={true}
        selectedLandmark={selectedLandmark}
        setSelectedLandmark={updateLandmark}
        filters={filters}
        onFiltersChange={updateFilters}
        facets={facets}
      />

      {/* Bottom Selection Bar */}
      {selectedProperties.size > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200  shadow-lg">
          <View className="flex-row items-center justify-between p-3">
            <TouchableOpacity
              onPress={handleSelectAll}
              className="mr-4 border border-[#10302D] rounded py-2 px-4"
            >
              <Text className="text-[#10302D] text-sm font-lato-semibold leading-[150%]">
                Select All
              </Text>
            </TouchableOpacity>
            <View className="flex-row items-center gap-2">
              <Text className="text-black text-sm font-montserrat-bold leading-[150%]">
                {selectedProperties.size} Selected
              </Text>
              <TouchableOpacity onPress={handleExitSelectionMode}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleMarkAsAvailable}
              className="bg-[#153E3B] rounded py-2 px-4"
            >
              <Text className="text-white font-lato-bold leading-[150%] text-sm">
                Mark as Available
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {showStatusModal && (
        <MultiStatusUpdateModal
          visible={showStatusModal}
          statusMap={statusMap}
          onClose={() => {
            setStatusMap({
              available: {
                selected: false,
                propertyIds: [],
              },
              hold: {
                selected: false,
                propertyIds: [],
              },
              sold: {
                selected: false,
                propertyIds: [],
              },
              tenanted: {
                selected: false,
                propertyIds: [],
              },
              "de-listed": {
                selected: false,
                propertyIds: [],
              },
            });
            setShowStatusModal(false);
          }}
          onConfirm={handleStatusUpdate}
          isUpdating={isUpdatingStatus}
        />
      )}
    </View>
  );
};

export default MyBusinessPage;

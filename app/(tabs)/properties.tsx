import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Keyboard,
  RefreshControl,
  FlatList,
  ViewabilityConfig,
} from "react-native";
import algoliasearch from "algoliasearch";
import {
  InstantSearch,
  Configure,
  useInstantSearch,
  useInfiniteHits,
} from "react-instantsearch";
import { useHits, useSearchBox } from "react-instantsearch";
import PropertyFilters from "../components/PropertyFilters";
import CustomPagination from "../components/CustomPagination";
import { Landmark, Property } from "../types";
import { useRouter } from "expo-router";
import PropertyCard from "../components/property/PropertyCard";
import MoreFilters from "../components/MoreFilters";
import { useDoubleBackPressExit } from "@/hooks/useDoubleBackPressExit";
import Animated from "react-native-reanimated";
import Offline from "../components/Offline";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { analytics } from "../config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

// Initialize Algolia search client
const searchClient = algoliasearch(
  "1F93ZRBESW",
  "b9023694178852d83995620a6c9ba933"
);

const indexName = "properties";

// SearchRefresher component that accesses the refresh method
function SearchRefresher({
  onRefreshAvailable,
}: {
  onRefreshAvailable: (refresh: Function) => void;
}) {
  const { refresh } = useInstantSearch();

  useEffect(() => {
    if (refresh && onRefreshAvailable) {
      onRefreshAvailable(refresh);
    }
  }, [refresh, onRefreshAvailable]);

  // This component doesn't render anything visible
  return null;
}

// MobileHits Component
const MobileHits = () => {
  const { items, isLastPage, showMore } = useInfiniteHits<Property>();
  const { status } = useInstantSearch();
  const { query } = useSearchBox();
  const agentData = useSelector((state: RootState) => state?.agent?.docData);
  const userType = agentData?.userType || "free";
  const [maxScrollDepth, setMaxScrollDepth] = useState(0);
  const viewedProperties = useRef(new Set<string>());
  const [totalPropertiesViewed, setTotalPropertiesViewed] = useState(0);

  const viewabilityConfig = useRef<ViewabilityConfig>({
    itemVisiblePercentThreshold: 50, // Item is considered viewed when 50% visible
    minimumViewTime: 500 // Must be visible for at least 500ms
  });

  const { refresh } = useInstantSearch();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  // Track search results
  useEffect(() => {
    if (items && status === 'idle') {
      try {
        logEvent(analytics, 'property_search_results', {
          event_category: 'search',
          event_label: 'results',
          results_count: items.length,
          search_query: query || 'empty',
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging search results:', error);
      }
    }
  }, [items, status, query, userType]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      logEvent(analytics, 'property_list_refresh', {
        event_category: 'interaction',
        event_label: 'refresh',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging refresh:', error);
    }
    refresh();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [refresh, userType]);

  const handleEndReached = useCallback(() => {
    if (!isLastPage && !isLoadingMore) {
      try {
        logEvent(analytics, 'property_list_pagination', {
          event_category: 'interaction',
          event_label: 'load_more',
          current_items: items.length,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging pagination:', error);
      }
      setIsLoadingMore(true);
      requestAnimationFrame(() => {
        showMore();
        setIsLoadingMore(false);
      });
    }
  }, [isLastPage, isLoadingMore, showMore, items.length, userType]);

  const keyExtractor = useCallback((item: Property) => item.propertyId || String(item.propertyId), []);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    const newPropertiesViewed = viewableItems.filter((item: any) => {
      const propertyId = item.item.propertyId;
      return !viewedProperties.current.has(propertyId);
    });

    if (newPropertiesViewed.length > 0) {
      newPropertiesViewed.forEach((item: any) => {
        const propertyId = item.item.propertyId;
        viewedProperties.current.add(propertyId);
      });

      setTotalPropertiesViewed(viewedProperties.current.size);

      try {
        logEvent(analytics, 'property_cards_viewed', {
          event_category: 'engagement',
          event_label: 'impression',
          total_viewed: viewedProperties.current.size,
          new_properties_count: newPropertiesViewed.length,
          total_available: items.length,
          view_percentage: Math.round((viewedProperties.current.size / items.length) * 100),
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging property views:', error);
      }
    }
  }, [items.length, userType]);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollDepthPercentage = Math.floor(
      ((contentOffset.y + layoutMeasurement.height) / contentSize.height) * 100
    );
    
    if (scrollDepthPercentage > maxScrollDepth) {
      setMaxScrollDepth(scrollDepthPercentage);
      try {
        logEvent(analytics, 'property_scroll_depth', {
          event_category: 'engagement',
          event_label: 'scroll',
          depth_percentage: scrollDepthPercentage,
          total_items: items.length,
          properties_viewed: viewedProperties.current.size,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging scroll depth:', error);
      }
    }
  }, [maxScrollDepth, items.length, userType]);

  const renderItem = useCallback(({ item, index }: { item: Property; index: number }) => {
    const transformedProperty: Property = item;
    const handlePropertyView = () => {
      try {
        logEvent(analytics, 'property_card_view', {
          event_category: 'interaction',
          event_label: 'property_view',
          property_id: item.propertyId,
          list_position: index + 1,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging property view:', error);
      }
    };

    return (
      <View onStartShouldSetResponder={() => {
        handlePropertyView();
        return false;
      }}>
        <PropertyCard key={item.propertyId} property={transformedProperty} />
      </View>
    );
  }, [userType]);

  const renderFooter = useCallback(() => {
    if (loading) {
      return (
        <View className="flex items-center justify-center h-32">
          <ActivityIndicator size={"large"} color={"#153E3B"} />
        </View>
      );
    }
    return null;
  }, [loading]);

  useEffect(() => {
    setLoading(
      status === "loading" || status === "stalled" || status === "error"
    );
  }, [status]);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsRendered(true);
    });

    return () => cancelAnimationFrame(timer);
  }, []);

  if (!isRendered || (items?.length === 0 && loading))
    return (
      <View className="flex items-center justify-center h-64 gap-10 mt-20">
        <ActivityIndicator size={"large"} color={"#153E3B"} />
        <View className="flex flex-col items-center">
          <Text
            style={{
              ...styles.text,
              fontWeight: "bold",
              fontFamily: "Montserrat_400Regular",
              color: "black",
              fontSize: 17,
            }}
          >
            "The best investment on Earth is earth."
          </Text>
          <Text
            style={{ ...styles.text, fontStyle: "italic", fontFamily: "Lato" }}
          >
            - Louis Glickman
          </Text>
        </View>
      </View>
    );

  if (items?.length === 0 && query?.length !== 0) {
    try {
      logEvent(analytics, 'property_search_no_results', {
        event_category: 'search',
        event_label: 'no_results',
        search_query: query,
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging no results:', error);
    }
    return (
      <View className="flex items-center justify-center h-64">
        <Text style={{ ...styles.text, fontFamily: "Montserrat_400Regular" }}>
          No results found for "{query}"
        </Text>
      </View>
    );
  }

  // When we have hits, render the property cards
  return (
    <>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#153E3B"]}
            tintColor="#153E3B"
            title="Refreshing..."
            titleColor="#153E3B"
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          width: "100%",
          flexGrow: 1,
        }}
        style={{ flexGrow: 1, flexShrink: 1 }}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={10}
        removeClippedSubviews={true}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </>
  );
};

export default function PropertiesScreen() {
  const [isMoreFiltersModalOpen, setIsMoreFiltersModalOpen] = useState(false);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(
    null
  );
  const agentData = useSelector((state: RootState) => state?.agent?.docData);
  const userType = agentData?.userType || "free";

  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  // Track page view
  useEffect(() => {
    try {
      logEvent(analytics, 'properties_page_view', {
        event_category: 'page_view',
        event_label: 'properties',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging page view:', error);
    }
  }, [userType]);

  const handleToggleMoreFilters = () => {
    try {
      logEvent(analytics, 'property_filters_toggle', {
        event_category: 'interaction',
        event_label: 'filters',
        filter_state: !isMoreFiltersModalOpen ? 'open' : 'close',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging filter toggle:', error);
    }
    setIsMoreFiltersModalOpen((prev) => !prev);
    Keyboard.dismiss();
  };

  // Track landmark selection
  useEffect(() => {
    if (selectedLandmark) {
      try {
        logEvent(analytics, 'property_landmark_selected', {
          event_category: 'search',
          event_label: 'landmark',
          landmark_name: selectedLandmark.name,
          landmark_radius: selectedLandmark.radius,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging landmark selection:', error);
      }
    }
  }, [selectedLandmark, userType]);

  useDoubleBackPressExit();

  if (!isConnectedToInternet) {
    try {
      logEvent(analytics, 'properties_offline_view', {
        event_category: 'error',
        event_label: 'offline',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging offline state:', error);
    }
    return <Offline />;
  }

  return (
    <View className="flex-1 bg-[#F5F6F7]">
      <InstantSearch searchClient={searchClient} indexName={indexName}>
        <Configure
          analytics={true}
          hitsPerPage={20}
          filters={`status:'Available'`}
          aroundLatLng={
            selectedLandmark?.lat && selectedLandmark?.lng
              ? `${selectedLandmark.lat},${selectedLandmark.lng}`
              : undefined
          }
          aroundRadius={selectedLandmark?.radius || undefined}
        />
        <View className="flex-1 relative">
          <View>
            <PropertyFilters
              handleToggleMoreFilters={handleToggleMoreFilters}
              selectedLandmark={selectedLandmark}
              setSelectedLandmark={setSelectedLandmark}
            />
          </View>
          <View className="w-full flex-1">
            <MobileHits />
          </View>
        </View>
        <MoreFilters
          isOpen={isMoreFiltersModalOpen}
          setIsOpen={setIsMoreFiltersModalOpen}
          handleToggle={handleToggleMoreFilters}
          isMobile={true}
          selectedLandmark={selectedLandmark}
          setSelectedLandmark={setSelectedLandmark}
        />
      </InstantSearch>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    // fontFamily: 'Montserrat_400Regular',
    color: "#6B7280",
    fontSize: 16,
  },
  title: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 18,
    marginBottom: 4,
  },
  description: {
    fontFamily: "Montserrat_400Regular",
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    fontFamily: "Montserrat_500Medium",
    color: "#3B82F6",
    fontSize: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  detailText: {
    fontFamily: "Montserrat_400Regular",
    color: "#6B7280",
    fontSize: 14,
  },
});

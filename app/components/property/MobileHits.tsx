import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  ViewabilityConfig,
  TouchableOpacity,
  Animated
} from "react-native";
import PropertyCard from "../../components/property/PropertyCard";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { analytics } from "../../config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { ScrollContext } from "@/app/ScrollContext";

interface MobileHitsProps {
  results: any[]; // All accumulated results from infinite scroll
  loading: boolean; // Initial search loading
  loadingMore: boolean; // Loading next page
  hasMore: boolean; // Whether more results available
  error: string | null; // Error message if any
  totalHits: number; // Total number of results available
  query?: string; // Current search query for analytics
  onLoadMore: () => void; // Function to load next page
  onRefresh?: () => void; // Optional refresh function
}

export const MobileHits = ({
  results = [],
  loading = false,
  loadingMore = false,
  hasMore = false,
  error = null,
  totalHits = 0,
  query = "",
  onLoadMore,
  onRefresh,
}: MobileHitsProps) => {
  const agentData = useSelector((state: RootState) => state?.agent?.docData);
  const userType = agentData?.userType || "free";
  const [maxScrollDepth, setMaxScrollDepth] = useState(0);
  const viewedProperties = useRef(new Set<string>());
  const [totalPropertiesViewed, setTotalPropertiesViewed] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const { scrollY, onScrollEndDrag, onMomentumScrollEnd } = useContext(ScrollContext);

  const viewabilityConfig = useRef<ViewabilityConfig>({
    itemVisiblePercentThreshold: 50, // Item is considered viewed when 50% visible
    minimumViewTime: 500, // Must be visible for at least 500ms
  });



  // Track search results when they change
  useEffect(() => {
    if (results && results.length > 0 && !loading) {
      try {
        logEvent(analytics, "property_search_results", {
          event_category: "search",
          event_label: "results",
          results_count: results.length,
          total_available: totalHits,
          search_query: query || "empty",
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging search results:", error);
      }
    }
  }, [results.length, totalHits, loading, query, userType]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        logEvent(analytics, "property_list_refresh", {
          event_category: "interaction",
          event_label: "refresh",
          current_results: results.length,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging refresh:", error);
      }
      
      onRefresh();
      
      // Reset refresh state after a delay
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    }
  }, [onRefresh, results.length, userType]);

  // Handle infinite scroll
  const handleEndReached = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      try {
        logEvent(analytics, "property_list_pagination", {
          event_category: "interaction",
          event_label: "load_more",
          current_items: results.length,
          total_available: totalHits,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging pagination:", error);
      }
      
      onLoadMore();
    }
  }, [hasMore, loadingMore, loading, onLoadMore, results.length, totalHits, userType]);

  // Key extractor for FlatList
  const keyExtractor = useCallback(
    (item: any, index: number) => item.propertyId || item.objectID || String(index),
    []
  );

  // Track property card views
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      const newPropertiesViewed = viewableItems.filter((item: any) => {
        const propertyId = item.item.propertyId || item.item.objectID;
        return propertyId && !viewedProperties.current.has(propertyId);
      });

      if (newPropertiesViewed.length > 0) {
        newPropertiesViewed.forEach((item: any) => {
          const propertyId = item.item.propertyId || item.item.objectID;
          if (propertyId) {
            viewedProperties.current.add(propertyId);
          }
        });

        setTotalPropertiesViewed(viewedProperties.current.size);

        try {
          logEvent(analytics, "property_cards_viewed", {
            event_category: "engagement",
            event_label: "impression",
            total_viewed: viewedProperties.current.size,
            new_properties_count: newPropertiesViewed.length,
            total_available: results.length,
            view_percentage: Math.round(
              (viewedProperties.current.size / results.length) * 100
            ),
            user_type: userType,
          });
        } catch (error) {
          console.error("Error logging property views:", error);
        }
      }
    },
    [results.length, userType]
  );

  // Track scroll depth
  const handleScroll = useCallback(
    (event: any) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const scrollDepthPercentage = Math.floor(
        ((contentOffset.y + layoutMeasurement.height) / contentSize.height) *
          100
      );

      if (scrollDepthPercentage > maxScrollDepth) {
        setMaxScrollDepth(scrollDepthPercentage);
        try {
          logEvent(analytics, "property_scroll_depth", {
            event_category: "engagement",
            event_label: "scroll",
            depth_percentage: scrollDepthPercentage,
            total_items: results.length,
            properties_viewed: viewedProperties.current.size,
            user_type: userType,
          });
        } catch (error) {
          console.error("Error logging scroll depth:", error);
        }
      }
    },
    [maxScrollDepth, results.length, userType]
  );

  // Render individual property card
  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const handlePropertyView = () => {
        try {
          logEvent(analytics, "property_card_view", {
            event_category: "interaction",
            event_label: "property_view",
            property_id: item.propertyId || item.objectID,
            list_position: index + 1,
            total_results: results.length,
            user_type: userType,
          });
        } catch (error) {
          console.error("Error logging property view:", error);
        }
      };

      return (
        <View
          onStartShouldSetResponder={() => {
            handlePropertyView();
            return false;
          }}
        >
          <PropertyCard 
            key={item.propertyId || item.objectID || index} 
            property={item} 
          />
        </View>
      );
    },
    [results.length, userType]
  );

  // Render footer with loading indicator
  const renderFooter = useCallback(() => {
    if (loadingMore && hasMore) {
      return (
        <View className="flex items-center justify-center py-4">
          <ActivityIndicator size="large" color="#153E3B" />
          <Text 
            className="text-gray-500 mt-2 text-sm"
            style={{ fontFamily: "Montserrat_400Regular" }}
          >
            Loading more properties...
          </Text>
        </View>
      );
    }
    
    if (!hasMore && results.length > 0) {
      return (
        <View className="flex items-center justify-center py-8">
          <Text 
            className="text-gray-500 text-sm"
            style={{ fontFamily: "Montserrat_400Regular" }}
          >
            You've seen all {totalHits} properties
          </Text>
        </View>
      );
    }
    
    return null;
  }, [loadingMore, hasMore, results.length, totalHits]);

  // Set rendered state
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsRendered(true);
    });

    return () => cancelAnimationFrame(timer);
  }, []);

  // Show initial loading state
  if (!isRendered || (loading && !refreshing)) {
    return (
      <View className="flex items-center justify-center h-64 gap-10 mt-20">
        <ActivityIndicator size="large" color="#153E3B" />
        <View className="flex flex-col items-center px-8">
          <Text
            className="font-bold text-black text-[17px] text-center"
            style={{ fontFamily: "Montserrat_400Regular" }}
          >
            "The best investment on Earth is earth."
          </Text>
          <Text
            className="italic text-gray-500 mt-2"
            style={{ fontFamily: "Lato_400Regular" }}
          >
            - Louis Glickman
          </Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View className="flex items-center justify-center h-64 px-8">
        <Text
          className="text-red-500 text-base text-center"
          style={{ fontFamily: "Montserrat_400Regular" }}
        >
          Error loading properties: {error}
        </Text>
        {onRefresh && (
          <TouchableOpacity 
            onPress={handleRefresh}
            className="mt-4 px-4 py-2 bg-[#153E3B] rounded-lg"
          >
            <Text 
              className="text-white text-sm"
              style={{ fontFamily: "Montserrat_400Regular" }}
            >
              Try Again
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Show no results state
  if (results.length === 0 && query.length > 0 && !loading) {
    try {
      logEvent(analytics, "property_search_no_results", {
        event_category: "search",
        event_label: "no_results",
        search_query: query,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging no results:", error);
    }
    
    return (
      <View className="flex items-center justify-center h-64 px-8">
        <Text
          className="text-gray-500 text-base text-center"
          style={{ fontFamily: "Montserrat_400Regular" }}
        >
          No results found for "{query}"
        </Text>
        <Text
          className="text-gray-400 text-sm text-center mt-2"
          style={{ fontFamily: "Lato_400Regular" }}
        >
          Try adjusting your search terms or filters
        </Text>
      </View>
    );
  }

  // Show empty state (no search query)
  if (results.length === 0 && !loading) {
    return (
      <View className="flex items-center justify-center h-64 px-8">
        <Text
          className="text-gray-500 text-base text-center"
          style={{ fontFamily: "Montserrat_400Regular" }}
        >
          No properties found
        </Text>
        <Text
          className="text-gray-400 text-sm text-center mt-2"
          style={{ fontFamily: "Lato_400Regular" }}
        >
          Try adjusting your filters or search criteria
        </Text>
      </View>
    );
  }

  // Render the property list
  return (
    <Animated.FlatList
      data={results}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false, listener: handleScroll }
      )}
      scrollEventThrottle={16}
      onScrollEndDrag={onScrollEndDrag}      // ← This fixes partial visibility
  onMomentumScrollEnd={onMomentumScrollEnd}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={viewabilityConfig.current}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#153E3B"]}
            tintColor="#153E3B"
            title="Refreshing..."
            titleColor="#153E3B"
          />
        ) : undefined
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
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
    />
  );
};
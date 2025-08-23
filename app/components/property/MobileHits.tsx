import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  ViewabilityConfig,
  StyleSheet,
} from "react-native";
import {
  useInstantSearch,
  useInfiniteHits,
} from "react-instantsearch";
import { useSearchBox } from "react-instantsearch";
import { Property } from "../../types";
import PropertyCard from "../../components/property/PropertyCard";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { analytics } from "../../config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

// MobileHits Component
export const MobileHits = () => {
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
    minimumViewTime: 500, // Must be visible for at least 500ms
  });

  const { refresh } = useInstantSearch();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  // Track search results
  useEffect(() => {
    if (items && status === "idle") {
      try {
        logEvent(analytics, "property_search_results", {
          event_category: "search",
          event_label: "results",
          results_count: items.length,
          search_query: query || "empty",
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging search results:", error);
      }
    }
  }, [items, status, query, userType]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      logEvent(analytics, "property_list_refresh", {
        event_category: "interaction",
        event_label: "refresh",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging refresh:", error);
    }
    refresh();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [refresh, userType]);

  const handleEndReached = useCallback(() => {
    if (!isLastPage && !isLoadingMore) {
      try {
        logEvent(analytics, "property_list_pagination", {
          event_category: "interaction",
          event_label: "load_more",
          current_items: items.length,
          user_type: userType,
        });
      } catch (error) {
        console.error("Error logging pagination:", error);
      }
      setIsLoadingMore(true);
      requestAnimationFrame(() => {
        showMore();
        setIsLoadingMore(false);
      });
    }
  }, [isLastPage, isLoadingMore, showMore, items.length, userType]);

  const keyExtractor = useCallback(
    (item: any) => item.propertyId || String(item.propertyId),
    []
  );

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
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
          logEvent(analytics, "property_cards_viewed", {
            event_category: "engagement",
            event_label: "impression",
            total_viewed: viewedProperties.current.size,
            new_properties_count: newPropertiesViewed.length,
            total_available: items.length,
            view_percentage: Math.round(
              (viewedProperties.current.size / items.length) * 100
            ),
            user_type: userType,
          });
        } catch (error) {
          console.error("Error logging property views:", error);
        }
      }
    },
    [items.length, userType]
  );

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
            total_items: items.length,
            properties_viewed: viewedProperties.current.size,
            user_type: userType,
          });
        } catch (error) {
          console.error("Error logging scroll depth:", error);
        }
      }
    },
    [maxScrollDepth, items.length, userType]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const transformedProperty: any = item;
      const handlePropertyView = () => {
        try {
          logEvent(analytics, "property_card_view", {
            event_category: "interaction",
            event_label: "property_view",
            property_id: item.propertyId,
            list_position: index + 1,
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
          <PropertyCard key={item.propertyId} property={transformedProperty} />
        </View>
      );
    },
    [userType]
  );

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

import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Keyboard, Text, RefreshControl, ActivityIndicator } from "react-native"; // Import RefreshControl from react-native
import Offline from "../components/Offline";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { analytics } from "../config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import PropertyCard from "../components/property/PropertyCard";
import { searchProperties } from "../services/property_services/propertyService";
import { Property } from "../types";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";

const UnderReviewProperties = () => {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional logic
  const [isMoreFiltersModalOpen, setIsMoreFiltersModalOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const agentData = useSelector((state: RootState) => state?.agent?.docData);
  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  const userType = agentData?.userType || "free";
  const scrollY = useSharedValue(0);
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  });

  const cpId = useSelector((state: RootState) => state?.agent?.docData.cpId);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const propertyResults: Property[] = await searchProperties("cpId", cpId);
      console.log(propertyResults, "fetched properties");
      setProperties(propertyResults || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Track page view
  useEffect(() => {
    try {
      logEvent(analytics, "under_review_properties_page_view", {
        event_category: "page_view",
        event_label: "properties",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging page view:", error);
    }
  }, [userType]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProperties();
    setRefreshing(false);
  }, [fetchProperties]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onScrollEndDrag = useCallback(() => {
    // Handle scroll end drag if needed
  }, []);

  const onMomentumScrollEnd = useCallback(() => {
    // Handle momentum scroll end if needed
  }, []);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    // Handle viewable items changed if needed
  }, []);

  const handleEndReached = useCallback(() => {
    // Handle pagination if needed
    console.log("End reached");
  }, []);

  const renderFooter = useCallback(() => {
    if (properties.length === 0) return null;
    return (
      <View style={{ height: 20 }}>
        <Text style={{ textAlign: "center", color: "#666" }}>
          End of results
        </Text>
      </View>
    );
  }, [properties.length]);

  const keyExtractor = useCallback((item: Property, index: number) => {
    return item.propertyId || item.propertyId || index.toString();
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Property; index: number }) => {
      const handlePropertyView = () => {
        try {
          logEvent(analytics, "property_card_view", {
            event_category: "interaction",
            event_label: "property_view",
            property_id: item.propertyId || item.propertyId,
            list_position: index + 1,
            total_results: properties.length,
            user_type: userType,
          });
        } catch (error) {
          console.error("Error logging property view:", error);
        }
      };

      return (
        <View
          className=""
          onStartShouldSetResponder={() => {
            handlePropertyView();
            return false;
          }}
        >
          <PropertyCard
            key={item.propertyId || item.propertyId || index}
            property={item}
          />
        </View>
      );
    },
    [properties.length, userType]
  );

  // NOW conditional renders can happen - all hooks have been called

  if (!isConnectedToInternet) {
    try {
      logEvent(analytics, "properties_offline_view", {
        event_category: "error",
        event_label: "offline",
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging offline state:", error);
    }
    return <Offline />;
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  if (properties.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>No properties found</Text>
      </View>
    );
  }

  return (
    <Animated.FlatList
      data={properties}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      onScrollEndDrag={onScrollEndDrag}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={viewabilityConfig.current}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
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
        backgroundColor: "#F5F6F7",
        padding: 12,
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

export default UnderReviewProperties;

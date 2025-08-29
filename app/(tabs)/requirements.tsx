import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  Text,
  RefreshControl,
  FlatList,
  ViewabilityConfig,
  Animated,
} from "react-native";
import RequirementFilters from "../components/requirement/RequirementFilters";
import RequirementCard from "../components/requirement/RequirementCard";
import CustomPagination from "../components/CustomPagination";
import MoreFiltersRequirement from "../components/requirement/MoreFiltersRequirement";
import {
  Configure,
  InstantSearch,
  useHits,
  useInfiniteHits,
  useInstantSearch,
  useSearchBox,
} from "react-instantsearch";
import algoliasearch from "algoliasearch";
import RequirementDetailsModal from "../components/requirement/RequirementDetailsModal";
import { Requirement } from "../types";
// import Animated from "react-native-reanimated";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Offline from "../components/Offline";
import { analytics } from "../config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { ScrollContext } from "../ScrollContext";

const searchClient = algoliasearch(
  "YXMDFDHYEO",
  "9394fe020e50445263e0171877e37a2a"
);

const MobileHits = React.memo(() => {
  const { items, isLastPage, showMore } = useInfiniteHits<Requirement>();
  const { status } = useInstantSearch();
  const { query } = useSearchBox();
  const agentData = useSelector((state: RootState) => state?.agent?.docData);
  const userType = agentData?.userType || "free";
  const { scrollY, onScrollEndDrag, onMomentumScrollEnd } = useContext(ScrollContext);

  // Add state for tracking loading states
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [maxScrollDepth, setMaxScrollDepth] = useState(0);
  const viewedRequirements = useRef(new Set<string>());
  const [totalRequirementsViewed, setTotalRequirementsViewed] = useState(0);

  // Track search results
  useEffect(() => {
    if (items && status === 'idle') {
      try {
        logEvent(analytics, 'requirement_search_results', {
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

  const viewabilityConfig = useRef<ViewabilityConfig>({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 500
  });

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    const newRequirementsViewed = viewableItems.filter((item: any) => {
      const requirementId = item.item.requirementId || item.item.id;
      return !viewedRequirements.current.has(requirementId);
    });

    if (newRequirementsViewed.length > 0) {
      newRequirementsViewed.forEach((item: any) => {
        const requirementId = item.item.requirementId || item.item.id;
        viewedRequirements.current.add(requirementId);
      });

      setTotalRequirementsViewed(viewedRequirements.current.size);

      try {
        logEvent(analytics, 'requirement_cards_viewed', {
          event_category: 'engagement',
          event_label: 'impression',
          total_viewed: viewedRequirements.current.size,
          new_requirements_count: newRequirementsViewed.length,
          total_available: items.length,
          view_percentage: Math.round((viewedRequirements.current.size / items.length) * 100),
          user_type: userType,
        });
      } catch (error) {
        console.error('Error logging requirement views:', error);
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
        logEvent(analytics, 'requirement_scroll_depth', {
          event_category: 'engagement',
          event_label: 'scroll',
          depth_percentage: scrollDepthPercentage,
          total_items: items.length,
          requirements_viewed: viewedRequirements.current.size,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging scroll depth:', error);
      }
    }
  }, [maxScrollDepth, items.length, userType]);

  // Add refresh functionality with tracking
  const { refresh } = useInstantSearch();
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      logEvent(analytics, 'requirement_list_refresh', {
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

  // Improved footer component
  const renderFooter = useCallback(() => {
    if (loading) {
      return (
        <View className="flex items-center justify-center h-32">
          <ActivityIndicator size="large" color="#153E3B" />
        </View>
      );
    }
    return null;
  }, [loading]);

  // Track pagination with analytics
  const handleEndReached = useCallback(() => {
    if (!isLastPage && !isLoadingMore) {
      try {
        logEvent(analytics, 'requirement_list_pagination', {
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

  const keyExtractor = useCallback((item: Requirement) => item.requirementId || '', []);

  const renderItem = useCallback(({ item, index }: { item: Requirement; index: number }) => {
    const handleRequirementView = () => {
      try {
        logEvent(analytics, 'requirement_card_interaction', {
          event_category: 'interaction',
          event_label: 'requirement_view',
          requirement_id: item.requirementId || item.requirementId,
          list_position: index + 1,
          user_type: userType
        });
      } catch (error) {
        console.error('Error logging requirement view:', error);
      }
    };

    return (
      <View onStartShouldSetResponder={() => {
        handleRequirementView();
        return false;
      }}>
        <RequirementCard requirement={item} />
      </View>
    );
  }, [userType]);

  // Update loading state based on search status
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
        <ActivityIndicator size="large" color="#153E3B" />
        <View className="flex flex-col items-center">
          <Text style={{ fontWeight: "bold", color: "black", fontSize: 17 }}>
            "The best investment on Earth is earth."
          </Text>
          <Text style={{ fontStyle: "italic" }}>- Louis Glickman</Text>
        </View>
      </View>
    );

  // Empty states handling
  if (items?.length === 0 && query?.length !== 0) {
    try {
      logEvent(analytics, 'requirement_search_no_results', {
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
        <Text>No results found for "{query}"</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      // onScroll={handleScroll}
      onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false, listener: handleScroll }
            )}
            onScrollEndDrag={onScrollEndDrag}      // ← This fixes partial visibility
      onMomentumScrollEnd={onMomentumScrollEnd}
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
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
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
    />
  );
});

const RequirementsList = React.memo(() => {
  return (
    <View style={[styles.mobileContent]}>
      <MobileHits />
    </View>
  );
});

const RequirementsPage = () => {
  const [isMoreFiltersModalOpen, setIsMoreFiltersModalOpen] = useState(false);
  const agentData = useSelector((state: RootState) => state?.agent?.docData);
  const userType = agentData?.userType || "free";

  const isConnectedToInternet = useSelector(
    (state: RootState) => state.app.isConnectedToInternet
  );

  // Track page view
  useEffect(() => {
    try {
      logEvent(analytics, 'requirements_page_view', {
        event_category: 'page_view',
        event_label: 'requirements',
        user_type: userType
      });
    } catch (error) {
      console.error('Error logging page view:', error);
    }
  }, [userType]);

  const handleToggleMoreFilters = () => {
    try {
      logEvent(analytics, 'requirement_filters_toggle', {
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

  if (!isConnectedToInternet) {
    try {
      logEvent(analytics, 'requirements_offline_view', {
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
    <View style={styles.container}>
      <InstantSearch
        searchClient={searchClient}
        indexName="requirements"
      >
        <Configure
          analytics={true}
          hitsPerPage={20}
          filters="NOT status:'Closed'"
        />
        <View style={styles.content}>
          {/* Filters */}
          <View style={styles.filtersContainer}>
            <RequirementFilters
              handleToggleMoreFilters={handleToggleMoreFilters}
            />
          </View>

          <RequirementsList />

          <MoreFiltersRequirement
            isOpen={isMoreFiltersModalOpen}
            setIsOpen={setIsMoreFiltersModalOpen}
            handleToggle={handleToggleMoreFilters}
          />
        </View>
      </InstantSearch>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F7",
  },
  content: {
    flex: 1,
    position: "relative",
    gap: 4,
  },
  filtersContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  mobileContent: {
    flex: 1,
    paddingTop: 14,
    marginTop: 60,
  },
});

export default RequirementsPage;

import React, { useState, useRef, useEffect, useCallback, forwardRef } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Keyboard, RefreshControl, FlatList } from "react-native";
import algoliasearch from "algoliasearch";
import { InstantSearch, Configure, useInstantSearch, useInfiniteHits } from "react-instantsearch";
import { useHits, useSearchBox } from "react-instantsearch";
import PropertyFilters from "../components/PropertyFilters";
import CustomPagination from "../components/CustomPagination";
import { Property } from "../types";
import { useRouter } from "expo-router";
import PropertyCard from "../components/property/PropertyCard";
import MoreFilters from "../components/MoreFilters";
import { useDoubleBackPressExit } from "@/hooks/useDoubleBackPressExit";
import Animated from "react-native-reanimated";
import Offline from "../components/Offline";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

// Initialize Algolia search client
const searchClient = algoliasearch(
  "IX7SWC1B42",
  "72106b08028d186542a82eafa570fc88"
);

const indexName = "propertyId";

export interface Landmark {
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

// SearchRefresher component that accesses the refresh method
function SearchRefresher({ onRefreshAvailable }: { onRefreshAvailable: (refresh: Function) => void }) {
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
const MobileHits = forwardRef<FlatList>((props, ref) => {
  // const { hits } = useHits<Property>();
  const { items, isLastPage, showMore } = useInfiniteHits();
  const { status } = useInstantSearch();
  const { query } = useSearchBox();
  console.log("status inf", status, items.length);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const handleCardClick = (property: any) => {
    setSelectedProperty(property);
  };

  const { refresh } = useInstantSearch();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Call the Algolia refresh method if available
    refresh();

    // Set a timeout to stop the refreshing indicator after some time
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  useEffect(() => {
    setLoading(status === "loading" || status === "stalled" || status === "error");
  }, [status]);

  if (items?.length === 0 && query?.length !== 0) {
    return (
      <View className="flex items-center justify-center h-64">
        <Text style={{ ...styles.text, fontFamily: 'Montserrat_400Regular' }}>No results found for "{query}"</Text>
      </View>
    );
  } else if (items.length === 0) {
    return (
      <View className="flex items-center justify-center h-64 gap-10 mt-20">
        <ActivityIndicator size={'large'} color={'#153E3B'} />
        <View className="flex flex-col items-center">
          <Text style={{ ...styles.text, fontWeight: 'bold', fontFamily: 'Montserrat_400Regular', color: 'black', fontSize: 17 }}>“The best investment on Earth is earth.”</Text>
          <Text style={{ ...styles.text, fontStyle: 'italic', fontFamily: 'Lato' }}>- Louis Glickman</Text>
        </View>
      </View>
    );
  }

  // When we have hits, render the property cards
  return (
    <>
      {/* <View className="w-full flex-1"> */}
      <FlatList
        data={items}
        ref={ref}
        renderItem={(item) => {
          const transformedProperty: Property = item.item;
          return <PropertyCard
            key={item.item.objectID}
            property={transformedProperty}
            onCardClick={handleCardClick}
          />
        }}
        refreshControl={<RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#153E3B"]}
          tintColor="#153E3B"
          title="Refreshing..."
          titleColor="#153E3B"
        />}
        contentContainerStyle={{ paddingHorizontal: 12, width: '100%', flexGrow: 1 }}
        style={{ flexGrow: 1, flexShrink: 1 }}
        // keyExtractor={(item, index: number) => { return item.propertyId }}
        onEndReached={() => {
          if (!isLastPage) {
            setLoading(true);
            setTimeout(() => {
              showMore();
            }, 0)
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => {
          if (loading)
            return (
              <View className="flex items-center justify-center h-32">
                <ActivityIndicator size={'large'} color={'#153E3B'} />
              </View>
            );
          return null;
        }}
      />
      {/* </View> */}
      {/* {hits.map((property) => {
          // Transform property data
          const transformedProperty: Property = property;

          return (
            
          );
        })} */}
    </>
  );
});

export default function PropertiesScreen() {
  const [isMoreFiltersModalOpen, setIsMoreFiltersModalOpen] = useState(false);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [filtersHeight, setFiltersHeight] = useState(0);
  const [paginationHeight, setPaginationHeight] = useState(0);
  const filtersRef = useRef<View>(null);
  const paginationRef = useRef<View>(null);
  const [refreshFunction, setRefreshFunction] = useState<Function | null>(null);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  const isConnectedToInternet = useSelector((state: RootState) => state.app.isConnectedToInternet);

  useEffect(() => {
    // Measure the height of the filters component
    if (filtersRef.current) {
      filtersRef.current.measure((_x: number, _y: number, _width: number, height: number) => {
        setFiltersHeight(height);
      });
    }

    // Measure the height of the pagination component
    if (paginationRef.current) {
      paginationRef.current.measure((_x: number, _y: number, _width: number, height: number) => {
        setPaginationHeight(height);
      });
    }
  }, []);

  const handleToggleMoreFilters = () => {
    setIsMoreFiltersModalOpen((prev) => !prev);
    Keyboard.dismiss(); // Dismiss the keyboard when toggling filters
  };

  // Calculate the content height dynamically
  const windowHeight = Dimensions.get('window').height;

  const [refreshing, setRefreshing] = useState(false);

  // Handle when refresh function becomes available
  // const handleRefreshAvailable = useCallback((refresh: Function) => {
  //   setRefreshFunction(() => refresh);
  // }, []);

  // const onRefresh = useCallback(() => {
  //   setRefreshing(true);

  //   // Call the Algolia refresh method if available
  //   if (refreshFunction) {
  //     refreshFunction();
  //   }

  //   // Set a timeout to stop the refreshing indicator after some time
  //   setTimeout(() => {
  //     setRefreshing(false);
  //   }, 1000);
  // }, [refreshFunction]);

  useDoubleBackPressExit();

  if (!isConnectedToInternet)
    return (<Offline />)

  return (
    <View className="flex-1 bg-[#F5F6F7]">
      <InstantSearch searchClient={searchClient} indexName={indexName}>
        {/* This component gets the refresh function and passes it up */}

        {/* <SearchRefresher onRefreshAvailable={handleRefreshAvailable} /> */}

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
          {/* Filters at the top */}
          <View
            ref={filtersRef}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setFiltersHeight(height);
            }}
          >
            <PropertyFilters
              handleToggleMoreFilters={handleToggleMoreFilters}
              selectedLandmark={selectedLandmark}
              setSelectedLandmark={setSelectedLandmark}
            />
          </View>

          {/* Main content area with dynamic height */}
          {/* <ScrollView ref={scrollViewRef}
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
          > */}
          <View className="w-full flex-1">
            <MobileHits ref={scrollViewRef} />
          </View>
          {/* </ScrollView> */}

          {/* Pagination at the bottom */}
          {/* <View
            ref={paginationRef}
            className="bg-white border-t border-gray-200"
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setPaginationHeight(height);
            }}
          >
            <CustomPagination flatListRef={scrollViewRef} />
          </View> */}
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
    color: '#6B7280',
    fontSize: 16,
  },
  title: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Montserrat_400Regular',
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    fontFamily: 'Montserrat_500Medium',
    color: '#3B82F6',
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  detailText: {
    fontFamily: 'Montserrat_400Regular',
    color: '#6B7280',
    fontSize: 14,
  },
});
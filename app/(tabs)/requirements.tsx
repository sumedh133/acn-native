import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Keyboard, ActivityIndicator, Text, RefreshControl } from 'react-native';
import RequirementFilters from '../components/requirement/RequirementFilters';
import RequirementCard from '../components/requirement/RequirementCard';
import CustomPagination from '../components/CustomPagination';
import MoreFiltersRequirement from '../components/requirement/MoreFiltersRequirement';
import { Configure, InstantSearch, useHits, useInstantSearch, useSearchBox } from 'react-instantsearch';
import algoliasearch from 'algoliasearch';
import RequirementDetailsModal from '../components/requirement/RequirementDetailsModal';
import { Requirement } from '../types';
import Animated from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Offline from '../components/Offline';

const searchClient = algoliasearch(
  "J150UQXDLH",
  "146a46f31a26226786751f663e88ae33"
);

const MobileHits = () => {
  const { hits } = useHits<Requirement>();
  const { query } = useSearchBox();
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const handleCardClick = (property: any) => {
    setSelectedProperty(property);
  };

  if (hits?.length === 0 && query?.length !== 0) {
    return (
      <View className="flex items-center justify-center h-64">
        {/* <Text style={styles.text}>No results found for "{query}"</Text> */}
      </View>
    );
  } else if (hits.length === 0) {
    return (
      <View className="flex items-center justify-center h-64">
        <ActivityIndicator size={'large'} color={'#153E3B'} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 0 }}>
      {hits.map((requirement) => {
        const transformedRequirement = requirement as Requirement;
        return (
          <RequirementCard
            key={requirement.objectID}
            requirement={transformedRequirement}
            onCardClick={handleCardClick}
          />
        );
      })}
    </ScrollView>
  );
}

const RequirementsList = forwardRef<Animated.ScrollView>((props, ref) => {
  // The generic type should be Requirement, not Requirement[]

  // const handleCardClick = (requirement: Requirement) => {
  //   setSelectedRequirement(requirement);
  // };
  // if (hits?.length === 0 && query?.length !== 0) {
  //   return (
  //     <View className="flex items-center justify-center h-64">
  //       <Text style={styles.text}>No results found for "{query}"</Text>
  //     </View>
  //   );
  // } else if (hits.length === 0) {
  //   return (
  //     <View className="flex items-center justify-center h-64">
  //       <ActivityIndicator size={'large'} />
  //     </View>
  //   );
  // }

  const { refresh } = useInstantSearch();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Call the Algolia refresh method if available
    refresh();

    // Set a timeout to stop the refreshing indicator after some time
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <>
      <ScrollView
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
        style={[styles.mobileContent]} contentContainerStyle={{ paddingBottom: 0, }}
        ref={ref}
      >
        <MobileHits />
      </ScrollView>

      {/* <RequirementDetailsModal
        isOpen={!!selectedRequirement}
        onClose={() => setSelectedRequirement(null)}
        requirement={selectedRequirement}
      /> */}
    </>
  );
});

const RequirementsPage = () => {
  const [isMoreFiltersModalOpen, setIsMoreFiltersModalOpen] = useState(false);

  const [filtersHeight, setFiltersHeight] = useState(0);
  const [paginationHeight, setPaginationHeight] = useState(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null)
  const filtersRef = useRef<View>(null);
  const paginationRef = useRef<View>(null);

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
    setIsMoreFiltersModalOpen(prev => !prev);
    Keyboard.dismiss();
  };

  if (!isConnectedToInternet)
    return (<Offline />)

  return (
    <View style={styles.container}>
      <InstantSearch
        searchClient={searchClient}
        indexName="acn-agent-requirement"
      >
        <Configure
          analytics={true}
          hitsPerPage={20}
          filters="NOT status:'Closed'"
        />
        <View style={styles.content}>
          {/* Filters */}
          <View style={styles.filtersContainer}>
            <RequirementFilters handleToggleMoreFilters={handleToggleMoreFilters} />
          </View>

          <RequirementsList ref={scrollViewRef} />

          <View
            ref={paginationRef}
            className="bg-white border-t border-gray-200 mt-4"
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setPaginationHeight(height);
            }}
          >
            <CustomPagination scrollRef={scrollViewRef} />
          </View>

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
    backgroundColor: '#F5F6F7',
  },
  content: {
    flex: 1,
    position: 'relative',
    gap: 4,
  },
  // text: {
  //   fontFamily: 'Montserrat_400Regular',
  //   color: '#6B7280',
  //   fontSize: 16,
  // },
  filtersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  mobileContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    marginTop: 60,
  },
});

export default RequirementsPage;
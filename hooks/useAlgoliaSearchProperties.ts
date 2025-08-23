import { useState, useEffect, useCallback } from "react";
import type { Landmark } from "@/app/types";
import { algoliaInfiniteSearch, type InfiniteScrollState, type SearchFilters } from "../app/services/property_services/propertyAlgoliaService";

// Custom hook for Algolia search state management
export const useAlgoliaSearch = () => {
  const [searchState, setSearchState] = useState<InfiniteScrollState>(
    algoliaInfiniteSearch.getInitialState()
  );
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [sortBy, setSortBy] = useState<string>("");

  // Debounced search function
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (
    searchQuery: string,
    searchFilters: SearchFilters,
    landmark?: Landmark | null,
    sort?: string
  ) => {
    setSearchState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Add geo parameters if landmark is selected
      const searchParams: any = {
        query: searchQuery,
        filters: searchFilters,
        sortBy: sort,
        hitsPerPage: 20,
      };

      // Handle geo search
      if (landmark?.lat && landmark?.lng) {
        searchParams.aroundLatLng = `${landmark.lat},${landmark.lng}`;
        searchParams.aroundRadius = landmark.radius || 10000; // 10km default
      }

      const newState = await algoliaInfiniteSearch.search(
        searchQuery,
        searchFilters,
        sort,
        20
      );
      
      setSearchState(newState);
    } catch (error) {
      console.error("Search error:", error);
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Search failed"
      }));
    }
  }, []);

  // Debounced search
  const debouncedSearch = useCallback((
    searchQuery: string,
    searchFilters: SearchFilters,
    landmark?: Landmark | null,
    sort?: string
  ) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      performSearch(searchQuery, searchFilters, landmark, sort);
    }, 500); // 300ms debounce

    setSearchTimeout(timeout);
  }, [performSearch, searchTimeout]);

  // Load more results for infinite scroll
  const loadMore = useCallback(async () => {
    if (!searchState.hasMore || searchState.loadingMore) {
      return;
    }

    setSearchState(prev => ({ ...prev, loadingMore: true }));

    try {
      const newState = await algoliaInfiniteSearch.loadMore(searchState, 20);
      setSearchState(newState);
    } catch (error) {
      console.error("Load more error:", error);
      setSearchState(prev => ({
        ...prev,
        loadingMore: false,
        error: error instanceof Error ? error.message : "Load more failed"
      }));
    }
  }, [searchState]);

  // Update search query
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    debouncedSearch(newQuery, filters, selectedLandmark, sortBy);
  }, [filters, selectedLandmark, sortBy, debouncedSearch]);

  // Update filters
  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    performSearch(query, newFilters, selectedLandmark, sortBy);
  }, [query, selectedLandmark, sortBy, performSearch]);

  // Update landmark
  const updateLandmark = useCallback((landmark: Landmark | null) => {
    setSelectedLandmark(landmark);
    performSearch(query, filters, landmark, sortBy);
  }, [query, filters, sortBy, performSearch]);

  // Update sort
  const updateSort = useCallback((sort: string) => {
    setSortBy(sort);
    performSearch(query, filters, selectedLandmark, sort);
  }, [query, filters, selectedLandmark, performSearch]);

  // Initial search
  useEffect(() => {
    performSearch("", {}, null, "");
    
    // Cleanup on unmount
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      algoliaInfiniteSearch.cleanup();
    };
  }, []);

  return {
    searchState,
    query,
    filters,
    selectedLandmark,
    sortBy,
    updateQuery,
    updateFilters,
    updateLandmark,
    updateSort,
    loadMore,
  };
};
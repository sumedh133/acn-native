import { useState, useEffect, useCallback } from "react";
import type { Landmark } from "@/app/types";
import {
  algoliaInfiniteSearch,
  type InfiniteScrollState,
  type SearchFilters,
} from "../../app/services/property_services/propertyAlgoliaService";

// Custom hook for Algolia search state management
export const useAlgoliaSearch = () => {
  const [searchState, setSearchState] = useState<InfiniteScrollState>(
    algoliaInfiniteSearch.getInitialState()
  );
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({ });
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(
    null
  );
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [facets, setFacets] = useState<Record<string, Record<string, number>>>(
    {}
  );

  // Debounced search function
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const performSearch = useCallback(
    async (
      searchQuery: string,
      searchFilters: SearchFilters,
      landmark?: Landmark | null,
      sort?: string
    ) => {
      setSearchState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const searchParams: any = {
          query: searchQuery,
          filters: searchFilters,
          sortBy: sort,
          hitsPerPage: 20,
        };

        // ✅ only add geo if landmark is valid
        if (landmark?.lat && landmark?.lng) {
          searchParams.aroundLatLng = `${landmark.lat},${landmark.lng}`;
          searchParams.aroundRadius = landmark.radius || 10000;
        }

        const geoOptions =
          landmark?.lat && landmark?.lng
            ? {
                aroundLatLng: `${landmark.lat},${landmark.lng}`,
                aroundRadius: landmark.radius || 10000,
              }
            : undefined; 

        const newState = await algoliaInfiniteSearch.search(
          searchQuery,
          searchFilters,
          sort,
          20,
          geoOptions
        );

        // ✅ merge state so `loading` always toggles properly
        setSearchState((prev) => ({
          ...prev,
          ...newState,
          loading: false,
        }));

        setFacets(newState.facets || {});
      } catch (error) {
        console.error("Search error:", error);
        setSearchState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Search failed",
        }));
      }
    },
    []
  );

  // 🔑 Trigger search automatically whenever query, filters, landmark, or sortBy changes
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      performSearch(query, filters, selectedLandmark, sortBy);
    }, 400); // debounce
    setSearchTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [query, filters, selectedLandmark, sortBy, performSearch]);

  // Update helpers (these only set state, not trigger search directly)
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  const updateLandmark = useCallback((landmark: Landmark | null) => {
    setSelectedLandmark(landmark);
  }, []);

  const updateSort = useCallback((sort: string) => {
    setSortBy(sort);
  }, []);

  const loadMore = useCallback(async () => {
    if (!searchState.hasMore || searchState.loadingMore) {
      return;
    }
    setSearchState((prev) => ({ ...prev, loadingMore: true }));

    try {
      const newState = await algoliaInfiniteSearch.loadMore(searchState, 20);
      setSearchState((prev) => ({
        ...prev,
        ...newState,
        loadingMore: false,
      }));
    } catch (error) {
      console.error("Load more error:", error);
      setSearchState((prev) => ({
        ...prev,
        loadingMore: false,
        error: error instanceof Error ? error.message : "Load more failed",
      }));
    }
  }, [searchState]);

  // Initial search
  useEffect(() => {
    performSearch(query, filters, selectedLandmark, sortBy);
    return () => algoliaInfiniteSearch.cleanup();
  }, []); // only on mount

  return {
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
    loadMore,
  };
};

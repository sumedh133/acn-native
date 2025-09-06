import { useState, useEffect, useCallback, useRef } from "react";
import type { Landmark } from "@/app/types";
import {
  algoliaInfiniteSearch,
  type InfiniteScrollState,
  type SearchFilters,
  type RealtimeSearchState,
} from "../../app/services/property_services/propertyAlgoliaService";
import { testSnapshotConnection } from "../../app/services/property_services/propertyService";

export const useAlgoliaSearch = (basicFilter: SearchFilters) => {
  const [searchState, setSearchState] = useState<InfiniteScrollState>(
    algoliaInfiniteSearch.getInitialState()
  );
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(basicFilter);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(
    null
  );
  const [sortBy, setSortBy] = useState<string>("relevance");

  // Track current real-time state for cleanup
  const currentRealtimeState = useRef<RealtimeSearchState | null>(null);

  // 🔑 facet states
  const [facets, setFacets] = useState<Record<string, Record<string, number>>>(
    {}
  );
  const [masterFacets, setMasterFacets] = useState<Record<string, Set<string>>>(
    {}
  );

  // --- bootstrap master facets once ---
  useEffect(() => {
    const fetchMasterFacets = async () => {
      try {
        // run a query with no filters, just to get all facet values
        const initialState = await algoliaInfiniteSearch.search(
          "",
          {}, // no filters
          undefined,
          0 // hitsPerPage = 0 → we only care about facets
        );

        const mf: Record<string, Set<string>> = {};
        for (const [facetKey, values] of Object.entries(
          initialState.facets ?? {}
        )) {
          mf[facetKey] = new Set(Object.keys(values));
        }

        setMasterFacets(mf);
      } catch (err) {
        console.error("Failed to fetch master facets:", err);
      }
    };

    fetchMasterFacets();
  }, []);

  // --- debounced search ---
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
      // Clean up previous real-time listeners
      if (currentRealtimeState.current) {
        algoliaInfiniteSearch.cleanupRealtime(currentRealtimeState.current);
        currentRealtimeState.current = null;
      }

      setSearchState((prev) => ({
        ...prev,
        loading: true,
        loadingFirebase: false,
        firebaseProgress: null,
        error: null,
      }));

      try {
        const geoOptions =
          landmark?.lat && landmark?.lng
            ? {
                aroundLatLng: `${landmark.lat},${landmark.lng}`,
                aroundRadius: landmark.radius || 10000,
              }
            : undefined;
        console.log(geoOptions)
        // Use a ref to track if component is still mounted to prevent state updates
        let isMounted = true;
        const updateStateIfMounted = (updates: any) => {
          if (isMounted) {
            setSearchState((prev) => ({ ...prev, ...updates }));
          }
        };

        const newState = await algoliaInfiniteSearch.searchWithRealtime(
          searchQuery,
          searchFilters,
          sort,
          20,
          geoOptions,
          (updatedState) => {
            if (!isMounted) return;

            // Batch state updates to reduce re-renders
            const stateUpdates: any = {
              allResults: updatedState.allResults,
              // Keep main loading true until Firebase fetching is completely done
              loading: updatedState.loadingFirebase !== false, // Stay true until explicitly false
              loadingFirebase: updatedState.loadingFirebase || false,
              firebaseProgress: updatedState.firebaseProgress,
              error: updatedState.error,
            };

            updateStateIfMounted(stateUpdates);

            // Update facets if available - use current masterFacets value
            if (updatedState.facets) {
              const currentMasterFacets = masterFacets;
              if (
                currentMasterFacets &&
                Object.keys(currentMasterFacets).length > 0
              ) {
                const merged: Record<string, Record<string, number>> = {};
                for (const [facetKey, valueSet] of Object.entries(
                  currentMasterFacets
                )) {
                  merged[facetKey] = {};
                  valueSet.forEach((val) => {
                    merged[facetKey][val] =
                      updatedState.facets?.[facetKey]?.[val] ?? 0;
                  });
                }
                if (isMounted) setFacets(merged);
              } else {
                if (isMounted) setFacets(updatedState.facets || {});
              }
            }
          }
        );

        if (!isMounted) return;

        // Store the real-time state for cleanup
        currentRealtimeState.current = newState;

        const finalStateUpdate = {
          ...newState,
          // Keep loading true until Firebase is explicitly complete (loadingFirebase === false)
          loading: newState.loadingFirebase !== false,
        };

        updateStateIfMounted(finalStateUpdate);

        // merge with master facet list - use current value
        const currentMasterFacets = masterFacets;
        if (
          currentMasterFacets &&
          Object.keys(currentMasterFacets).length > 0
        ) {
          const merged: Record<string, Record<string, number>> = {};

          for (const [facetKey, valueSet] of Object.entries(
            currentMasterFacets
          )) {
            merged[facetKey] = {};
            valueSet.forEach((val) => {
              merged[facetKey][val] = newState.facets?.[facetKey]?.[val] ?? 0;
            });
          }

          setFacets(merged);
        } else {
          // fallback if master not ready yet
          setFacets(newState.facets || {});
        }

        // Cleanup function to prevent state updates after unmount
        return () => {
          isMounted = false;
        };
      } catch (error) {
        console.error("Search error:", error);
        setSearchState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Search failed",
        }));
      }
    },
    [] // Remove masterFacets from dependencies to prevent constant re-renders
  );

  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      performSearch(query, filters, selectedLandmark, sortBy);
    }, 400);
    setSearchTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [query, filters, selectedLandmark, sortBy, performSearch]);

  // helpers
  const updateQuery = useCallback((q: string) => setQuery(q), []);
  const updateFilters = useCallback((f: SearchFilters) => setFilters(f), []);
  const updateLandmark = useCallback(
    (lm: Landmark | null) => setSelectedLandmark(lm),
    []
  );
  const updateSort = useCallback((s: string) => setSortBy(s), []);

  // --- add inside your hook
  const refresh = useCallback(async () => {
    await performSearch(query, filters, selectedLandmark, sortBy);
  }, [performSearch, query, filters, selectedLandmark, sortBy]);

  const loadMore = useCallback(async () => {
    if (!searchState.hasMore || searchState.loadingMore) return;
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

  // run an initial search when mounted
  useEffect(() => {
    performSearch(query, filters, selectedLandmark, sortBy);
    return () => {
      // Clean up real-time listeners
      if (currentRealtimeState.current) {
        algoliaInfiniteSearch.cleanupRealtime(currentRealtimeState.current);
        currentRealtimeState.current = null;
      }
      // Clean up regular search
      algoliaInfiniteSearch.cleanup();
    };
  }, []);

  // Test function to validate real-time functionality
  const testRealtime = useCallback(async () => {
    const result = await testSnapshotConnection();
    return result;
  }, []);

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
    refresh,
    loadMore,
    testRealtime, // Test function for debugging
    realtimeInfo: currentRealtimeState.current
      ? {
          isRealtime: currentRealtimeState.current.isRealtime,
          propertyCount: currentRealtimeState.current.propertyIds.length,
          hasListeners: !!currentRealtimeState.current.unsubscribe,
        }
      : null,
  };
};

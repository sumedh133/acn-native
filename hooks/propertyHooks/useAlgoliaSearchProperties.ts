import { useState, useEffect, useCallback } from "react";
import type { Landmark } from "@/app/types";
import {
  algoliaInfiniteSearch,
  type InfiniteScrollState,
  type SearchFilters,
} from "../../app/services/property_services/propertyAlgoliaService";

export const useAlgoliaSearch = () => {
  const [searchState, setSearchState] = useState<InfiniteScrollState>(
    algoliaInfiniteSearch.getInitialState()
  );
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({ type: ["resale"] });
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [sortBy, setSortBy] = useState<string>("relevance");

  // 🔑 facet states
  const [facets, setFacets] = useState<Record<string, Record<string, number>>>({});
  const [masterFacets, setMasterFacets] = useState<
    Record<string, Set<string>>
  >({});

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
        for (const [facetKey, values] of Object.entries(initialState.facets ?? {})) {
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
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(
    async (
      searchQuery: string,
      searchFilters: SearchFilters,
      landmark?: Landmark | null,
      sort?: string
    ) => {
      setSearchState((prev) => ({ ...prev, loading: true, error: null }));

      try {
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

        setSearchState((prev) => ({
          ...prev,
          ...newState,
          loading: false,
        }));

        // merge with master facet list
        if (masterFacets && Object.keys(masterFacets).length > 0) {
          const merged: Record<string, Record<string, number>> = {};

          for (const [facetKey, valueSet] of Object.entries(masterFacets)) {
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
      } catch (error) {
        console.error("Search error:", error);
        setSearchState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Search failed",
        }));
      }
    },
    [masterFacets]
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
  const updateLandmark = useCallback((lm: Landmark | null) => setSelectedLandmark(lm), []);
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
    return () => algoliaInfiniteSearch.cleanup();
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
  };
};

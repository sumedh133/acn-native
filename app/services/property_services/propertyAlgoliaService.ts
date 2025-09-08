import algoliasearch from "algoliasearch";
import type { SearchResponse } from "@algolia/client-search";
import { getPropertyById, subscribeToPropertiesByIds } from "./propertyService";
import type { Unsubscribe } from "firebase/firestore";

const searchClient = algoliasearch(
  "CGRV5YKD8Y",
  "6790dabe95e962dcb64be2a64106c5b2"
);

const INDEX_NAME = "acnTest";

export interface SearchFilters {
  listingType?: string[]; //listing type in real
  propertyType?: string[];
  assetType?: string[];
  commercialSubType?: string[];
  apartmentType?: string[];
  possession?: string[];
  facing?: string[];
  floor?: string[];
  furnishing?: string[];
  preferredTenants?: string[];
  availability?: string[];
  zone?: string[];
  petsAllowed?: string[];
  nonVegAllowed?: string[];
  sbua?: string[]; //number range
  carpetArea?: string[]; //number range
  availableFrom?: string[]; // string like winthin 1 month, within 2 months
  totalAskPrice?: string[];
  rent?: string[];
  cpId?: string[];
  stage?: string[];
  builderCategory?: string[];
  status?: string[];

  // Add more filters as needed
  micromarket?: string[];
}

export interface SearchParams {
  query?: string;
  filters?: SearchFilters;
  page?: number;
  hitsPerPage?: number;
  sortBy?: string;
  aroundLatLng?: string; // <-- NEW
  aroundRadius?: number;
}

export interface AlgoliaSearchResponse {
  hits: any[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  processingTimeMS: number;
  facets?: Record<string, Record<string, number>>;
}

export interface InfiniteScrollState {
  allResults: any[]; // Accumulated results from all pages
  currentPage: number; // Next page to fetch
  totalPages: number;
  totalHits: number;
  hasMore: boolean;
  loading: boolean; // Initial search loading
  loadingMore: boolean; // Loading next page
  loadingFirebase: boolean; // Loading property data from Firebase
  firebaseProgress: { loaded: number; total: number } | null; // Firebase loading progress
  error: string | null;
  query: string;
  filters: SearchFilters;
  sortBy?: string;
  facets: Record<string, Record<string, number>>;
  aroundLatLng?: string; // <-- NEW
  aroundRadius?: number;
}

export interface RealtimeSearchState extends InfiniteScrollState {
  isRealtime: boolean;
  unsubscribe: (() => void) | null; // Single cleanup function
  propertyIds: string[]; // Track property IDs for real-time updates
}

class AlgoliaInfiniteSearchService {
  private currentRequest: AbortController | null = null;
  private loadMoreRequest: AbortController | null = null;

  // Helper function to fetch full property data from Firestore using propertyId from Algolia hits
  private fetchPropertyData = async (
    algoliaHits: any[],
    onProgress?: (loaded: number, total: number) => void
  ): Promise<any[]> => {
    try {
      // Extract propertyIds from Algolia hits, trying multiple possible property fields
      const propertyIds = algoliaHits
        .map((hit) => hit.propertyId || hit.objectID || hit.id)
        .filter(Boolean)
        .filter((id, index, array) => array.indexOf(id) === index); // Remove duplicates

      if (propertyIds.length === 0) {
        console.warn("No valid propertyIds found in Algolia hits");
        return [];
      }

      // Report initial progress
      onProgress?.(0, propertyIds.length);

      // Fetch full property data from Firestore in parallel with concurrency limit
      const batchSize = 10; // Process in batches to avoid overwhelming Firestore
      const batches = [];

      for (let i = 0; i < propertyIds.length; i += batchSize) {
        const batch = propertyIds.slice(i, i + batchSize);
        batches.push(batch);
      }

      const allProperties = [];
      let processedCount = 0;

      for (const batch of batches) {
        const batchPromises = batch.map(async (propertyId: string) => {
          try {
            const propertyData = await getPropertyById(propertyId);
            if (!propertyData) {
              console.warn(`Property not found in Firestore: ${propertyId}`);
            }
            return propertyData;
          } catch (error) {
            console.warn(
              `Failed to fetch property ${propertyId} from Firestore:`,
              error
            );
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        allProperties.push(...batchResults);

        // Update progress
        processedCount += batch.length;
        onProgress?.(processedCount, propertyIds.length);
      }

      // Filter out null values (failed fetches or non-existent properties)
      const validProperties = allProperties.filter(
        (property) => property !== null
      );

      return validProperties;
    } catch (error) {
      console.error("Error fetching property data from Firestore:", error);
      return [];
    }
  };

  // Initialize empty state
  getInitialState = (): InfiniteScrollState => ({
    allResults: [],
    currentPage: 0,
    totalPages: 0,
    totalHits: 0,
    hasMore: false,
    facets: {},
    loading: false,
    loadingMore: false,
    loadingFirebase: false,
    firebaseProgress: null,
    error: null,
    query: "",
    filters: {},
  });

  // Initialize empty real-time state
  getInitialRealtimeState = (): RealtimeSearchState => ({
    ...this.getInitialState(),
    isRealtime: true,
    unsubscribe: null,
    propertyIds: [],
  });

  private buildFilterGroup = (
    values: string[] | undefined,
    fieldName: string
  ): string | null => {
    if (!values || values.length === 0) {
      return null;
    }

    const filters = values
      .map((value) => `${fieldName}:'${value}'`)
      .join(" OR ");

    return `(${filters})`;
  };

  private buildAvailableFromFilter = (
    values: string[] | undefined,
    fieldName: string
  ): string | null => {
    if (!values || values.length === 0) return null;

    const value = values[0].toLowerCase();

    let cutoffTimestamp: number | null = null;

    if (value.includes("within 1 month")) {
      cutoffTimestamp = Math.floor(
        new Date().setMonth(new Date().getMonth() + 1) / 1000
      );
    } else if (value.includes("within 2 months")) {
      cutoffTimestamp = Math.floor(
        new Date().setMonth(new Date().getMonth() + 2) / 1000
      );
    } else if (value.includes("within 3 months")) {
      cutoffTimestamp = Math.floor(
        new Date().setMonth(new Date().getMonth() + 3) / 1000
      );
    }

    if (!cutoffTimestamp) return null;

    // Only need "less than" condition
    return `${fieldName} <= ${cutoffTimestamp}`;
  };

  private buildRangeFilter = (
    values: string[] | undefined,
    fieldName: string
  ): string | null => {
    if (!values || values.length !== 2) return null;

    const [min, max] = values;

    const parts: string[] = [];
    if (min && !isNaN(Number(min))) {
      parts.push(`${fieldName} >= ${min}`);
    }
    if (max && !isNaN(Number(max))) {
      parts.push(`${fieldName} <= ${max}`);
    }

    if (parts.length === 0) return null;
    return parts.join(" AND ");
  };

  private buildFilterString = (filters: SearchFilters): string => {
    const filterConfigs = [
      { values: filters.listingType, fieldName: "listingType" },
      { values: filters.propertyType, fieldName: "propertyType" },
      { values: filters.assetType, fieldName: "assetType" },
      { values: filters.commercialSubType, fieldName: "commercialSubType" },
      { values: filters.apartmentType, fieldName: "apartmentType" },
      { values: filters.micromarket, fieldName: "micromarket" },
      { values: filters.facing, fieldName: "facing" },
      { values: filters.floor, fieldName: "floor" }, // likely change
      { values: filters.furnishing, fieldName: "furnishing" },
      {
        values: filters.preferredTenants,
        fieldName: "tenantPreferences.preferredTenants",
      },
      {
        values: filters.petsAllowed,
        fieldName: "tenantPreferences.petsAllowed",
      },
      {
        values: filters.nonVegAllowed,
        fieldName: "tenantPreferences.nonVegAllowed",
      },
      { values: filters.possession, fieldName: "possession" },
      { values: filters.availability, fieldName: "availability" },
      { values: filters.zone, fieldName: "zone" },
      { values: filters.cpId, fieldName: "cpId" },
      { values: filters.stage, fieldName: "stage" },
      { values: filters.builderCategory, fieldName: "builderCategory" },
      { values: filters.status, fieldName: "status" },
    ];

    const filterParts = filterConfigs
      .map((config) => this.buildFilterGroup(config.values, config.fieldName))
      .filter((filter) => filter !== null) as string[];

    // Add number range filters
    const rangeFilters = [
      this.buildRangeFilter(filters.sbua, "sbua"),
      this.buildRangeFilter(filters.carpetArea, "carpetArea"),
      this.buildRangeFilter(filters.totalAskPrice, "pricing.totalAskPrice"),
      this.buildRangeFilter(filters.rent, "rentalInfo.rent"),
    ].filter((f) => f !== null) as string[];

    const availableFromFilter = this.buildAvailableFromFilter(
      filters.availableFrom,
      "availableFrom"
    );

    return [...filterParts, ...rangeFilters, availableFromFilter]
      .filter(Boolean)
      .join(" AND ");
  };

  // Get client and index (same as before)
  private getClientAndIndex = (sortBy?: string) => {
    if (!sortBy || sortBy === "relevance") {
      return { searchClient, indexName: INDEX_NAME };
    }

    const sortIndexMap: Record<string, string> = {
      price_asc: `${INDEX_NAME}_price_asc`,
      price_desc: `${INDEX_NAME}_price_desc`,
      date_desc: `${INDEX_NAME}_date_desc`,
      date_asc: `${INDEX_NAME}_date_asc`,
      price_per_sqft_asc: `${INDEX_NAME}_price_per_sqft_asc`,
      price_per_sqft_desc: `${INDEX_NAME}_price_per_sqft_desc`,
      relevanceLow: `${INDEX_NAME}`,
    };

    return { searchClient, indexName: sortIndexMap[sortBy] || INDEX_NAME };
  };

  // Core search method
  private performSearch = async (
    params: SearchParams,
    onProgressUpdate?: (loaded: number, total: number) => void
  ): Promise<AlgoliaSearchResponse> => {
    const {
      query = "",
      filters = {},
      page = 0,
      hitsPerPage = 20,
      sortBy,
      aroundLatLng, // <-- NEW
      aroundRadius, // <-- NEW
    } = params;

    const { searchClient, indexName } = this.getClientAndIndex(sortBy);
    const filterString = this.buildFilterString(filters);

    // Search Algolia with minimal attributes - only fetch propertyId
    const response = await searchClient.search([
      {
        indexName,
        params: {
          query,
          page,
          hitsPerPage,
          filters: filterString,
          facets: ["type", "micromarket"],
          maxValuesPerFacet: 100,
          analytics: true,
          attributesToRetrieve: ["propertyId"], // Only fetch propertyId from Algolia
          ...(aroundLatLng ? { aroundLatLng } : {}), // <-- NEW
          ...(aroundRadius ? { aroundRadius } : {}), // <-- NEW
        },
      },
    ]);

    const result = response.results[0] as SearchResponse<any>;

    // Fetch full property data from Firestore using the propertyIds
    const fullPropertyData = await this.fetchPropertyData(
      result.hits || [],
      onProgressUpdate
    );

    return {
      hits: fullPropertyData, // Return full property data instead of Algolia hits
      nbHits: result.nbHits || 0,
      page: result.page || 0,
      nbPages: result.nbPages || 0,
      hitsPerPage: result.hitsPerPage || 20,
      processingTimeMS: result.processingTimeMS || 0,
      facets: result.facets || {},
    };
  };

  // Initial search - resets everything
  search = async (
    query: string = "",
    filters: SearchFilters = {},
    sortBy?: string,
    hitsPerPage: number = 20,
    options?: { aroundLatLng?: string; aroundRadius?: number },
    onStateUpdate?: (state: Partial<InfiniteScrollState>) => void
  ): Promise<InfiniteScrollState> => {
    // Cancel any ongoing requests
    if (this.currentRequest) {
      this.currentRequest.abort();
    }
    if (this.loadMoreRequest) {
      this.loadMoreRequest.abort();
    }

    this.currentRequest = new AbortController();

    try {
      // Update state to show Firebase loading
      onStateUpdate?.({
        loadingFirebase: true,
        firebaseProgress: null,
        error: null,
      });

      // Throttle progress updates to reduce re-renders
      let lastProgressUpdate = 0;
      const progressThrottle = 100; // Update at most every 100ms

      const response = await this.performSearch(
        {
          query,
          filters,
          page: 0,
          hitsPerPage,
          sortBy,
          ...options,
        },
        (loaded, total) => {
          // Throttle progress updates
          const now = Date.now();
          if (now - lastProgressUpdate > progressThrottle || loaded === total) {
            lastProgressUpdate = now;
            onStateUpdate?.({
              firebaseProgress: { loaded, total },
            });
          }
        }
      );

      // Update state to show completion
      onStateUpdate?.({
        loadingFirebase: false,
        firebaseProgress: null,
      });

      return {
        allResults: response.hits,
        currentPage: 1, // Next page to fetch
        totalPages: response.nbPages,
        totalHits: response.nbHits,
        hasMore: response.page < response.nbPages - 1,
        loading: false,
        loadingMore: false,
        loadingFirebase: false,
        firebaseProgress: null,
        error: null,
        query,
        filters,
        facets: response.facets || {},
        sortBy,
        aroundLatLng: options?.aroundLatLng, // <-- NEW
        aroundRadius: options?.aroundRadius,
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw error; // Let the caller handle aborted requests
      }

      onStateUpdate?.({
        loadingFirebase: false,
        firebaseProgress: null,
      });

      return {
        allResults: [],
        currentPage: 0,
        totalPages: 0,
        totalHits: 0,
        hasMore: false,
        loading: false,
        loadingMore: false,
        loadingFirebase: false,
        firebaseProgress: null,
        error: error instanceof Error ? error.message : "Search failed",
        query,
        filters,
        facets: {},
        sortBy,
      };
    }
  };

  // Real-time search with snapshot listeners
  searchWithRealtime = async (
    query: string = "",
    filters: SearchFilters = {},
    sortBy?: string,
    hitsPerPage: number = 20,
    options?: { aroundLatLng?: string; aroundRadius?: number },
    onUpdate?: (state: RealtimeSearchState) => void
  ): Promise<RealtimeSearchState> => {
    // Cancel any ongoing requests
    if (this.currentRequest) {
      this.currentRequest.abort();
    }
    if (this.loadMoreRequest) {
      this.loadMoreRequest.abort();
    }

    this.currentRequest = new AbortController();

    try {
      // First, get the Algolia search results (property IDs only)
      const response = await this.performSearchIds({
        query,
        filters,
        page: 0,
        hitsPerPage,
        sortBy,
        ...options,
      });

      // Extract property IDs from Algolia results
      const propertyIds = response.hits
        .map((hit: any) => hit.propertyId || hit.objectID || hit.id)
        .filter(Boolean);

      // Create initial state - start with Firebase loading true to avoid gap
      const initialState: RealtimeSearchState = {
        allResults: [],
        currentPage: 1,
        totalPages: response.nbPages,
        totalHits: response.nbHits,
        hasMore: response.page < response.nbPages - 1,
        loading: false,
        loadingMore: false,
        loadingFirebase: propertyIds.length > 0 ? true : false, // Start with Firebase loading if we have properties
        firebaseProgress:
          propertyIds.length > 0
            ? { loaded: 0, total: propertyIds.length }
            : null,
        error: null,
        query,
        filters,
        facets: response.facets || {},
        sortBy,
        aroundLatLng: options?.aroundLatLng,
        aroundRadius: options?.aroundRadius,
        isRealtime: true,
        unsubscribe: null,
        propertyIds,
      };

      // Set up real-time listeners for the property IDs
      if (propertyIds.length > 0) {
        const unsubscribe = subscribeToPropertiesByIds(
          propertyIds,
          (properties) => {
            // Create new state object to avoid mutation
            const updatedState: RealtimeSearchState = {
              ...initialState,
              allResults: properties.filter((p) => p !== null),
              loadingFirebase: false,
              firebaseProgress: null,
              unsubscribe,
            };

            onUpdate?.(updatedState);
          },
          undefined,
          (error: Error) => {
            console.error("Real-time property update error:", error);
            const errorState: RealtimeSearchState = {
              ...initialState,
              error: error.message || "Real-time update failed",
              loadingFirebase: false,
              firebaseProgress: null,
              unsubscribe,
            };
            onUpdate?.(errorState);
          },
          (loaded: number, total: number) => {
            // Progress updates during initial Firebase loading
            const progressState: RealtimeSearchState = {
              ...initialState,
              loadingFirebase: loaded < total,
              firebaseProgress: { loaded, total },
              unsubscribe,
            };
            onUpdate?.(progressState);
          }
        );

        initialState.unsubscribe = unsubscribe;
      } else {
        console.warn("No property IDs found for real-time listeners");
      }

      return initialState;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw error;
      }

      return {
        ...this.getInitialRealtimeState(),
        error:
          error instanceof Error ? error.message : "Real-time search failed",
        query,
        filters,
        sortBy,
      };
    }
  };

  // Helper method to perform search and return only property IDs (for real-time)
  private performSearchIds = async (
    params: SearchParams
  ): Promise<AlgoliaSearchResponse> => {
    const {
      query = "",
      filters = {},
      page = 0,
      hitsPerPage = 20,
      sortBy,
      aroundLatLng,
      aroundRadius,
    } = params;

    const { searchClient, indexName } = this.getClientAndIndex(sortBy);
    const filterString = this.buildFilterString(filters);

    const response = await searchClient.search([
      {
        indexName,
        params: {
          query,
          page,
          hitsPerPage,
          filters: filterString,
          facets: ["type", "micromarket"],
          maxValuesPerFacet: 100,
          analytics: true,
          attributesToRetrieve: ["propertyId"],
          ...(aroundLatLng ? { aroundLatLng } : {}),
          ...(aroundRadius ? { aroundRadius } : {}),
        },
      },
    ]);

    const result = response.results[0] as SearchResponse<any>;

    return {
      hits: result.hits || [],
      nbHits: result.nbHits || 0,
      page: result.page || 0,
      nbPages: result.nbPages || 0,
      hitsPerPage: result.hitsPerPage || 20,
      processingTimeMS: result.processingTimeMS || 0,
      facets: result.facets || {},
    };
  };

  // Clean up real-time listeners
  cleanupRealtime = (state: RealtimeSearchState): void => {
    if (state.unsubscribe) {
      try {
        state.unsubscribe();
        state.unsubscribe = null;
      } catch (error) {
        console.warn("Error unsubscribing from real-time listeners:", error);
      }
    }
  };

  // Load next page and append to existing results
  loadMore = async (
    currentState: InfiniteScrollState,
    hitsPerPage: number = 20
  ): Promise<InfiniteScrollState> => {
    // Don't load if already loading or no more results
    if (currentState.loadingMore || !currentState.hasMore) {
      return currentState;
    }

    // Cancel any ongoing load more request
    if (this.loadMoreRequest) {
      this.loadMoreRequest.abort();
    }

    this.loadMoreRequest = new AbortController();

    try {
      const response = await this.performSearch({
        query: currentState.query,
        filters: currentState.filters,
        page: currentState.currentPage,
        hitsPerPage,
        sortBy: currentState.sortBy,
        aroundLatLng: currentState.aroundLatLng, // <-- NEW
        aroundRadius: currentState.aroundRadius,
      });

      return {
        ...currentState,
        allResults: [...currentState.allResults, ...response.hits],
        currentPage: currentState.currentPage + 1,
        hasMore: response.page < response.nbPages - 1,
        loadingMore: false,
        error: null,
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw error;
      }

      return {
        ...currentState,
        loadingMore: false,
        error: error instanceof Error ? error.message : "Load more failed",
      };
    }
  };

  // Reset search state
  reset = (): InfiniteScrollState => {
    if (this.currentRequest) {
      this.currentRequest.abort();
    }
    if (this.loadMoreRequest) {
      this.loadMoreRequest.abort();
    }

    return this.getInitialState();
  };

  // Get facet values for filters
  getFacetValues = async (
    facetName: string
  ): Promise<Array<{ value: string; count: number }>> => {
    try {
      const response = await searchClient.search([
        {
          indexName: INDEX_NAME,
          params: {
            query: "",
            hitsPerPage: 0,
            facets: [facetName],
            maxValuesPerFacet: 100,
            attributesToRetrieve: ["propertyId"], // Only fetch propertyId even for facets
          },
        },
      ]);

      const result = response.results[0] as SearchResponse<any>;
      const facetValues = result.facets?.[facetName] || {};

      return Object.entries(facetValues)
        .map(([value, count]) => ({
          value,
          count: count as number,
        }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error("Get facet values error:", error);
      return [];
    }
  };

  // Cleanup method
  cleanup = (state?: RealtimeSearchState) => {
    if (this.currentRequest) {
      this.currentRequest.abort();
    }
    if (this.loadMoreRequest) {
      this.loadMoreRequest.abort();
    }

    // Clean up real-time listeners if provided
    if (state && state.isRealtime) {
      this.cleanupRealtime(state);
    }
  };
}

// Export singleton instance
export const algoliaInfiniteSearch = new AlgoliaInfiniteSearchService();

// Export types and class for easier testing
export { AlgoliaInfiniteSearchService };

import algoliasearch from "algoliasearch";
import type { SearchResponse } from "@algolia/client-search";

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
  error: string | null;
  query: string;
  filters: SearchFilters;
  sortBy?: string;
  facets: Record<string, Record<string, number>>;
  aroundLatLng?: string; // <-- NEW
  aroundRadius?: number;
}

class AlgoliaInfiniteSearchService {
  private currentRequest: AbortController | null = null;
  private loadMoreRequest: AbortController | null = null;

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
    error: null,
    query: "",
    filters: {},
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
      this.buildRangeFilter(filters.rent, "rentalInfo.rent "),
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
      relevanceLow: `${INDEX_NAME}`,
    };

    return { searchClient, indexName: sortIndexMap[sortBy] || INDEX_NAME };
  };

  // Core search method
  private performSearch = async (
    params: SearchParams
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
          ...(aroundLatLng ? { aroundLatLng } : {}), // <-- NEW
          ...(aroundRadius ? { aroundRadius } : {}), // <-- NEW
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

  // Initial search - resets everything
  search = async (
    query: string = "",
    filters: SearchFilters = {},
    sortBy?: string,
    hitsPerPage: number = 20,
    options?: { aroundLatLng?: string; aroundRadius?: number }
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
      const response = await this.performSearch({
        query,
        filters,
        page: 0,
        hitsPerPage,
        sortBy,
        ...options,
      });

      return {
        allResults: response.hits,
        currentPage: 1, // Next page to fetch
        totalPages: response.nbPages,
        totalHits: response.nbHits,
        hasMore: response.page < response.nbPages - 1,
        loading: false,
        loadingMore: false,
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

      return {
        allResults: [],
        currentPage: 0,
        totalPages: 0,
        totalHits: 0,
        hasMore: false,
        loading: false,
        loadingMore: false,
        error: error instanceof Error ? error.message : "Search failed",
        query,
        filters,
        facets: {},
        sortBy,
      };
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
  cleanup = () => {
    if (this.currentRequest) {
      this.currentRequest.abort();
    }
    if (this.loadMoreRequest) {
      this.loadMoreRequest.abort();
    }
  };
}

// Export singleton instance
export const algoliaInfiniteSearch = new AlgoliaInfiniteSearchService();

// Export types and class for easier testing
export { AlgoliaInfiniteSearchService };

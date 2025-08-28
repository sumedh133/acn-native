import algoliasearch from "algoliasearch";
import type { SearchResponse } from "@algolia/client-search";

const searchClient = algoliasearch(
  "1F93ZRBESW",
  "b9023694178852d83995620a6c9ba933"
);

const INDEX_NAME = "properties";

export interface SearchFilters {
  type?: string[];
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

  // Build filter string (same as before)
  private buildFilterString = (filters: SearchFilters): string => {
    const filterParts: string[] = [];

    if (filters.type && filters.type.length > 0) {
      const typeFilters = filters.type
        .map((type) => `type:'${type}'`)
        .join(" OR ");
      filterParts.push(`(${typeFilters})`);
    }

    if (filters.micromarket && filters.micromarket.length > 0) {
      const micromarketFilters = filters.micromarket
        .map((micromarket) => `micromarket:'${micromarket}'`)
        .join(" OR ");
      filterParts.push(`(${micromarketFilters})`);
    }

    return filterParts.join(" AND ");
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

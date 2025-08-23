import algoliasearch from "algoliasearch";
import type { SearchResponse } from "@algolia/client-search";

const searchClient = algoliasearch(
  "CGRV5YKD8Y",
  "6790dabe95e962dcb64be2a64106c5b2"
);

const INDEX_NAME = "acnTest";

export interface SearchFilters {
  type?: string[];
  
}

export interface SearchParams {
  query?: string;
  filters?: SearchFilters;
  page?: number;
  hitsPerPage?: number;
  sortBy?: string;
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

export interface FacetValue {
  value: string;
  count: number;
  highlighted?: string;
}

const getClientAndIndex = (sortBy?: string) => {
  if (!sortBy || sortBy === "relevance") {
    return { searchClient, indexName: INDEX_NAME };
  }

  const sortIndexMap: Record<string, string> = {
    price_asc: `${INDEX_NAME}_price_asc`,
    price_desc: `${INDEX_NAME}_price_desc`,
    date_desc: `${INDEX_NAME}_date_desc`,
    date_asc: `${INDEX_NAME}_date_asc`,
  };

  return { searchClient, indexName: sortIndexMap[sortBy] || INDEX_NAME };
};

function memoizeBuildFilterString(fn: (filters: SearchFilters) => string) {
  const cache = new Map<string, string>();
  return (filters: SearchFilters) => {
    const key = JSON.stringify(filters);
    if (cache.has(key)) {
      return cache.get(key) as string;
    }
    const result = fn(filters);
    cache.set(key, result);
    return result;
  };
}

const _buildFilterString = (filters: SearchFilters): string => {
  const filterParts: string[] = [];

  if (filters.type && filters.type.length > 0) {
    const typeFilters = filters.type
      .map((type) => `type:'${type}'`)
      .join(" OR ");
    filterParts.push(`(${typeFilters})`);
  }

  return filterParts.join(" AND ");
};

export const buildFilterString = memoizeBuildFilterString(_buildFilterString);

export const searchProperties = async (
  params: SearchParams = {}
): Promise<AlgoliaSearchResponse> => {
  try {
    const {
      query = "",
      filters = {},
      page = 0,
      hitsPerPage = 50,
      sortBy,
    } = params;
    const { searchClient, indexName } = getClientAndIndex(sortBy);
    const filterString = buildFilterString(filters);

    console.log("Algolia search params:", {
      indexName,
      query,
      page,
      hitsPerPage,
      filters: filterString,
    });

    // Fixed: Use proper search method with correct parameter names
    const response = await searchClient.search([
      {
        indexName,
        params: {
          query,
          page,
          hitsPerPage,
          filters: filterString,
          facets: ["type"],
          //   analytics: true,
        },
      },
    ]);

    const result = response.results[0] as SearchResponse<any>;

    return {
      hits: result.hits || [],
      nbHits: result.nbHits || 0,
      page: result.page || 0,
      nbPages: result.nbPages || 0,
      hitsPerPage: result.hitsPerPage || 50,
      processingTimeMS: result.processingTimeMS || 0,
      facets: result.facets || {},
    };
  } catch (error) {
    console.error("Algolia search error:", error);
    throw new Error(
      `Search failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Test function to verify everything works
export const testSearch = async () => {
  try {
    // Test 1: Basic search
    console.log("Testing basic search...");
    const basicResult = await searchProperties({
      query: "brigade",
      hitsPerPage: 10,
    });
    console.log("Basic search result:", {
      nbHits: basicResult.nbHits,
      hitsCount: basicResult.hits.length,
    });

    // Test 2: Search with filters
    console.log("Testing search with filters...");
    const filteredResult = await searchProperties({
      query: "",
      filters: { type: ["resale"] }, // Adjust based on your data
      hitsPerPage: 5,
    });
    console.log("Filtered search result:", {
      nbHits: filteredResult.nbHits,
      hitsCount: filteredResult.hits.length,
    });

    // Test 3: Empty search (get all)
    console.log("Testing empty search...");
    const allResult = await searchProperties({
      hitsPerPage: 3,
    });
    console.log("All results:", {
      nbHits: allResult.nbHits,
      hitsCount: allResult.hits.length,
    });

    return true;
  } catch (error) {
    console.error("Test failed:", error);
    return false;
  }
};

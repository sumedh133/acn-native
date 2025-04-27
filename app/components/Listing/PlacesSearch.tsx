import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Places } from "@/app/types";

// Define types for API responses
interface PlacePrediction {
  place_id: string;
  description: string;
}

interface PlaceDetails {
  name: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  url?: string;
}

interface PlacesSearchProps {
  selectedPlace: Places | null;
  setSelectedPlace: (place: Places | null) => void;
}

// Note: In production, use environment variables or a secure config approach
const API_KEY = "AIzaSyBsygl4y777lWd7M7mMQMwvnTyYFjPwoaM";

const PlacesSearch = ({
  selectedPlace,
  setSelectedPlace,
}: PlacesSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlacePrediction[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInitiatedSearch, setUserInitiatedSearch] = useState(false);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Search for locations with debounce
  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&key=${API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK") {
        setSearchResults(
          data.predictions.map((prediction: any) => ({
            place_id: prediction.place_id,
            description: prediction.description,
          }))
        );
      } else {
        console.error("Places API error:", data.status);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get place details by ID
  const getPlaceDetails = useCallback(
    async (placeId: string): Promise<PlaceDetails | null> => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry,formatted_address,url&key=${API_KEY}`
        );
        const data = await response.json();

        if (data.status === "OK" && data.result) {
          return {
            name: data.result.name,
            formatted_address: data.result.formatted_address,
            geometry: {
              location: {
                lat: data.result.geometry.location.lat,
                lng: data.result.geometry.location.lng,
              },
            },
            url: data.result.url,
          };
        } else {
          console.error("Place Details API error:", data.status);
          return null;
        }
      } catch (error) {
        console.error("Error fetching place details:", error);
        return null;
      }
    },
    []
  );

  // Update searchQuery when selectedPlace changes
  useEffect(() => {
    // Skip initial useEffect run when component mounts with a selectedPlace
    if (isInitialMount.current) {
      if (selectedPlace) {
        setSearchQuery(selectedPlace.name!);
      }
      isInitialMount.current = false;
      return;
    }

    // For subsequent updates to selectedPlace
    if (selectedPlace) {
      setSearchQuery(selectedPlace.name!);
      // Don't show results when place is programmatically selected
      setShowResults(false);
    } else {
      setSearchQuery("");
    }
  }, [selectedPlace]);

  // Trigger search with debounce when query changes
  useEffect(() => {
    // Skip the initial render when component mounts with a selectedPlace
    if (isInitialMount.current) return;

    // Only search when the user is typing, not when searchQuery is set programmatically
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (searchQuery && userInitiatedSearch) {
        searchLocations(searchQuery);
        setShowResults(true);
      } else if (!searchQuery) {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery, searchLocations, userInitiatedSearch]);

  // Handle user typing in the search box
  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text);
    setUserInitiatedSearch(true);
    // If user clears the input, reset everything
    if (!text.trim()) {
      setSelectedPlace(null);
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Handle selecting a place from search results
  const handleSelectPlace = useCallback(
    async (placeId: string, description: string) => {
      try {
        setIsLoading(true);
        const details = await getPlaceDetails(placeId);
        if (details && details.geometry) {
          const location: Places = {
            name: details.name || description,
            lat: details.geometry.location.lat,
            lng: details.geometry.location.lng,
            address: details.formatted_address || description,
            mapLocation: details.url || "",
          };
          // This will set searchQuery via useEffect, so reset userInitiatedSearch
          setUserInitiatedSearch(false);
          setSelectedPlace(location);
          setShowResults(false);
          Keyboard.dismiss();
        }
      } catch (error) {
        console.error("Error getting place details:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [getPlaceDetails, setSelectedPlace]
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setSelectedPlace(null);
    setSearchResults([]);
    setShowResults(false);
    setUserInitiatedSearch(false);
  }, [setSelectedPlace]);

  // Handle focus on the search input
  const handleSearchFocus = () => {
    // Only show results if user has typed something
    if (searchQuery.trim() && userInitiatedSearch) {
      setShowResults(true);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.headingContainer}>
        <Text style={styles.sectionHeading}>Project Name</Text>
        <Text style={styles.compulsoryStar}>*</Text>
      </View>
      <View style={styles.container}>
        {/* Search Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="search-outline" size={20} color="#726C6C" />
          <TextInput
            style={styles.textInput}
            placeholder="Search Project Name"
            placeholderTextColor="#7A7B7C"
            value={searchQuery}
            onChangeText={handleSearchInputChange}
            onFocus={handleSearchFocus}
          />

          {isLoading ? (
            <ActivityIndicator
              style={styles.rightIcon}
              size="small"
              color="#153E3B"
            />
          ) : searchQuery ? (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.rightIcon}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() =>
                    handleSelectPlace(item.place_id, item.description)
                  }>
                  <Text style={styles.resultText}>{item.description}</Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={true}
              nestedScrollEnabled={true}
              style={styles.resultsList}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    zIndex: 100,
  },
  section: {
    width: "100%",
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 10,
  },
  headingContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
  },
  sectionHeading: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
  },
  compulsoryStar: {
    fontFamily: "sans-serif",
    color: "#DC3545",
    fontSize: 14,
    fontWeight: "400",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E3E3E3",
    borderRadius: 5,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontFamily: "sans-serif",
    fontSize: 12,
    fontWeight: "400",
    color: "#333333",
  },
  rightIcon: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "bold",
  },
  resultsContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resultsList: {
    width: "100%",
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  resultText: {
    fontSize: 12,
    color: "#333",
  },
});

export default PlacesSearch;

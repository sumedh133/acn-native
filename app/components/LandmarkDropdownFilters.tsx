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
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { Landmark } from "../types";
import { locationRestriction } from "../constants/PropertyConstants";
// import { PLACES_API_KEY } from '@env';

// Define types for API responses
interface PlacePrediction {
  place_id: string;
  description: string;
}

interface PlaceDetails {
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface LandmarkDropdownFiltersProps {
  selectedLandmark: Landmark | null;
  setSelectedLandmark: (landmark: Landmark | null) => void;
}

// Note: In production, use environment variables or a secure config approach
// const API_KEY = PLACES_API_KEY;
const API_KEY = "AIzaSyBsygl4y777lWd7M7mMQMwvnTyYFjPwoaM";

const LandmarkDropdownFilters = ({
  selectedLandmark,
  setSelectedLandmark,
}: LandmarkDropdownFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlacePrediction[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sliderValue, setSliderValue] = useState(
    selectedLandmark?.radius || 5000
  );
  const [sliderTempValue, setSliderTempValue] = useState(
    selectedLandmark?.radius || 5000
  );
  const [userInitiatedSearch, setUserInitiatedSearch] = useState(false);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  // Track if component has mounted
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
        )}&locationrestriction=${locationRestriction}&key=${API_KEY}`
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
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry&key=${API_KEY}`
        );
        const data = await response.json();

        if (data.status === "OK" && data.result) {
          return {
            name: data.result.name,
            geometry: {
              location: {
                lat: data.result.geometry.location.lat,
                lng: data.result.geometry.location.lng,
              },
            },
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

  // Update searchQuery when selectedLandmark changes without triggering a search
  useEffect(() => {
    // Skip initial useEffect run when component mounts with a selectedLandmark
    if (isInitialMount.current) {
      if (selectedLandmark) {
        setSearchQuery(selectedLandmark.name);
        setSliderValue(selectedLandmark.radius);
        setSliderTempValue(selectedLandmark.radius);
      }
      isInitialMount.current = false;
      return;
    }

    // For subsequent updates to selectedLandmark
    if (selectedLandmark) {
      setSearchQuery(selectedLandmark.name);
      setSliderValue(selectedLandmark.radius);
      setSliderTempValue(selectedLandmark.radius);
      // Don't show results when landmark is programmatically selected
      setShowResults(false);
    } else {
      setSearchQuery("");
      setSliderValue(5000);
      setSliderTempValue(5000);
    }
  }, [selectedLandmark]);

  // Trigger search with debounce when query changes, but only if it's user-initiated
  useEffect(() => {
    // Skip the initial render when component mounts with a selectedLandmark
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
      setSelectedLandmark(null);
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
          const location: Landmark = {
            name: details.name || description,
            lat: details.geometry.location.lat,
            lng: details.geometry.location.lng,
            radius: sliderValue,
          };
          // This will set searchQuery via useEffect, so reset userInitiatedSearch
          setUserInitiatedSearch(false);
          setSelectedLandmark(location);
          setShowResults(false);
          Keyboard.dismiss();
        }
      } catch (error) {
        console.error("Error getting place details:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [getPlaceDetails, sliderValue, setSelectedLandmark]
  );

  // Handle slider change - track temp value during sliding
  const handleSliderChange = useCallback((value: number) => {
    setSliderTempValue(value);
  }, []);

  // Update the actual value when sliding is complete
  const handleSlidingComplete = useCallback(
    (value: number) => {
      setSliderValue(value);
      if (selectedLandmark) {
        setSelectedLandmark({
          ...selectedLandmark,
          radius: value,
        });
      }
    },
    [selectedLandmark, setSelectedLandmark]
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setSelectedLandmark(null);
    setSearchResults([]);
    setShowResults(false);
    setSliderValue(5000);
    setSliderTempValue(5000);
    setUserInitiatedSearch(false);
  }, [setSelectedLandmark]);

  // Format radius display properly
  const formatRadius = (meters: number) => {
    return (meters / 1000).toFixed(1);
  };

  // Handle focus on the search input
  const handleSearchFocus = () => {
    // Only show results if user has typed something
    if (searchQuery.trim() && userInitiatedSearch) {
      setShowResults(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.inputContainer}>
        {/* Location Icon */}
        {/* <View style={styles.iconPlaceholder} /> */}
        <Ionicons name="location-outline" size={20} color="#6B7280" />
        <TextInput
          style={styles.textInput}
          placeholder="Search landmarks"
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
            style={styles.rightIcon}
          >
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
                }
              >
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

      {/* Slider section */}
      {selectedLandmark && (
        <View className="mt-4 mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-semibold text-sm text-gray-700">
              Search Radius (in km)
            </Text>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#6B7280"
            />
          </View>

          <View style={styles.radiusLabelsContainer}>
            <Text className="text-sm text-gray-700 font-medium mb-2">1 km</Text>
            <Text className="text-sm text-gray-700 font-medium mb-2">
              {formatRadius(sliderTempValue)} km
            </Text>
            <Text className="text-sm text-gray-700 font-medium mb-2">
              10 km
            </Text>
          </View>
          {/* <Text className="text-sm text-gray-700 font-medium mb-2">
                  Selected: {sliderTempValue.toFixed(1)} km
          </Text> */}
          <Slider
            className="h-8 mb-3"
            minimumValue={1000}
            maximumValue={10000}
            step={100}
            value={sliderValue}
            onValueChange={handleSliderChange}
            onSlidingComplete={handleSlidingComplete}
            minimumTrackTintColor="#333333"
            maximumTrackTintColor="#DDDDDD"
            thumbTintColor="#FFFFFF"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E3E3E3",
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    height: 40,
    paddingHorizontal: 12,
  },
  iconPlaceholder: {
    width: 20,
    height: 20,
    marginRight: 8,
    backgroundColor: "#CCCCCC", // Replace with actual icon
  },
  textInput: {
    flex: 1,
    fontFamily: "System",
    fontSize: 12,
    color: "#333333",
    padding: 0,
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
    top: 45,
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
  sliderContainer: {
    marginTop: 16,
    width: "100%",
  },
  radiusHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  radiusHeader: {
    fontFamily: "System",
    fontSize: 13,
    fontWeight: "600",
    color: "#666666",
    marginRight: 10,
  },
  infoIconPlaceholder: {
    width: 16,
    height: 16,
    backgroundColor: "#CCCCCC", // Replace with actual icon
  },
  radiusLabelsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  radiusLabel: {
    fontFamily: "System",
    fontSize: 12,
    color: "#7A7B7C",
  },
  radiusLabelCurrent: {
    fontFamily: "System",
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  slider: {
    width: "100%",
    height: 40,
  },
});

export default LandmarkDropdownFilters;

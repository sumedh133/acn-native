import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Image
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { Landmark } from "../../../types";
import { locationRestriction } from "../../../constants/PropertyConstants";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import LocationSearchBarIcon from "@/assets/icons/svg/PropertiesPage/locationSearchBarIcon";
import InfoIcon from "@/assets/icons/propertiesMoreFilters/info-icon.svg";

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
  const userType =
    useSelector((state: RootState) => state.agent?.docData?.userType) || "free";

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  // Track if component has mounted
  const isInitialMount = useRef(true);

  // Search for locations with debounce
  const searchLocations = useCallback(
    async (query: string) => {
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
          const predictions = data.predictions.map((prediction: any) => ({
            place_id: prediction.place_id,
            description: prediction.description,
          }));
          setSearchResults(predictions);

          try {
            logEvent(analytics, "landmark_search", {
              event_category: "location",
              event_label: "search",
              search_term: query,
              results_count: predictions.length,
              user_type: userType,
            });
          } catch (error) {
            console.error("Error logging landmark search:", error);
          }
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
    },
    [userType]
  );

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

          try {
            logEvent(analytics, "select_landmark", {
              event_category: "location",
              event_label: "select",
              landmark_name: location.name,
              landmark_radius: location.radius,
              user_type: userType,
            });
          } catch (error) {
            console.error("Error logging landmark selection:", error);
          }

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
    [getPlaceDetails, sliderValue, setSelectedLandmark, userType]
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
        const updatedLandmark = {
          ...selectedLandmark,
          radius: value,
        };
        setSelectedLandmark(updatedLandmark);

        try {
          logEvent(analytics, "update_landmark_radius", {
            event_category: "location",
            event_label: "radius",
            landmark_name: selectedLandmark.name,
            previous_radius: selectedLandmark.radius,
            new_radius: value,
            user_type: userType,
          });
        } catch (error) {
          console.error("Error logging radius update:", error);
        }
      }
    },
    [selectedLandmark, setSelectedLandmark, userType]
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    try {
      logEvent(analytics, "clear_landmark_search", {
        event_category: "location",
        event_label: "clear",
        had_selection: !!selectedLandmark,
        user_type: userType,
      });
    } catch (error) {
      console.error("Error logging search clear:", error);
    }

    setSearchQuery("");
    setSelectedLandmark(null);
    setSearchResults([]);
    setShowResults(false);
    setSliderValue(5000);
    setSliderTempValue(5000);
    setUserInitiatedSearch(false);
  }, [setSelectedLandmark, selectedLandmark, userType]);

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
    <View className="w-full z-[2000]">
      {/* Search Input */}
      <View className="flex-row items-center border-[1.5px] border-gray-200 rounded-md bg-white h-11 px-3">
        <LocationSearchBarIcon width={20} height={20} strokeColor="#153E3B" />
        <TextInput
          className="flex-1 text-[12px] text-gray-800 p-0 ml-2"
          placeholder="Search by landmark..."
          placeholderTextColor="#7A7B7C"
          value={searchQuery}
          onChangeText={handleSearchInputChange}
          onFocus={handleSearchFocus}
          style={{ fontFamily: "Lato_400Regular" }}
        />

        {isLoading ? (
          <ActivityIndicator className="w-5 h-5" size="small" color="#153E3B" />
        ) : searchQuery ? (
          <TouchableOpacity
            onPress={handleClearSearch}
            className="w-5 h-5 justify-center items-center"
          >
            <Text className="text-sm text-gray-400 font-bold">✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <View className="absolute top-[45px] left-0 right-0 bg-white rounded-md border border-gray-200 max-h-[200px] z-[2000] shadow-sm">
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="p-3 border-b border-gray-100"
                onPress={() =>
                  handleSelectPlace(item.place_id, item.description)
                }
              >
                <Text className="text-xs text-gray-800">
                  {item.description}
                </Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={true}
            nestedScrollEnabled={true}
            className="w-full"
          />
        </View>
      )}

      {/* Slider section */}
      {selectedLandmark && (
  <View className="my-4">
    {/* Title with info icon */}
    <View className="flex-row space-x-2 items-center mb-2">
      <Text
        className="font-semibold text-sm text-gray-700"
        style={{ fontFamily: "Montserrat_600SemiBold" }}
      >
        Search Radius
      </Text>
      <InfoIcon width={18} height={18} />
    </View>

    {/* Labels above slider */}
    <View className="flex-row justify-between px-1 mb-1">
      <Text className="text-xs text-gray-500">1 Km</Text>
      <Text className="text-xs text-gray-500">5 Km</Text>
      <Text className="text-xs text-gray-500">10 Km</Text>
    </View>

    {/* Slider */}
    <Slider
      style={{ height: 40 }}
      minimumValue={1000}
      maximumValue={10000}
      step={100}
      value={sliderValue}
      onValueChange={handleSliderChange}
      onSlidingComplete={handleSlidingComplete}
      minimumTrackTintColor="#184C43"  // dark green like screenshot
      maximumTrackTintColor="#E5E5E5"  // light gray
      thumbTintColor="#FFFFFF"         // white thumb
    />
  </View>
)}

    </View>
  );
};

export default LandmarkDropdownFilters;

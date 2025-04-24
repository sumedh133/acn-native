import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Dimensions, Keyboard, ActivityIndicator } from 'react-native';
import { useInstantSearch, useSearchBox } from 'react-instantsearch';
import DropdownRefinementList from './DropdownRefinementList';
import CustomCurrentRefinements from './CustomCurrentRefinements';
import { Property } from '../types';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import CloseIcon from '@/assets/icons/svg/CloseIcon';
import SearchIcon from '@/assets/icons/svg/PropertiesPage/SearchIcon';
import FilterIcon from '@/assets/icons/svg/PropertiesPage/FilterIcon';

interface PropertyFiltersProps {
  handleToggleMoreFilters: () => void;
  selectedLandmark?: any;
  setSelectedLandmark?: (landmark: any) => void;
}


export default function PropertyFilters({
  handleToggleMoreFilters,
  selectedLandmark,
  setSelectedLandmark
}: PropertyFiltersProps) {
  const { query, refine } = useSearchBox();
  const { status } = useInstantSearch();
  const [searchText, setSearchText] = useState(query);
  const [loading, setLoading] = useState(false);

  // Handle text input change
  const handleSearchChange = (text: string) => {
    setSearchText(text); // Update the local state with the new search text
  };

  // Handle search button press (refine action)
  const handleSearchPress = () => {
    Keyboard.dismiss(); // Dismiss the keyboard when searching
    if (searchText.trim() != query) {
      setLoading(true);
      setTimeout(() => {
        refine(searchText.trim());  // Trigger the refine action with the updated search text
      }, 0)
    }
  };

  const handleClear = () => {
    Keyboard.dismiss(); // Dismiss the keyboard when clearing the search
    setSearchText("".trim());
    if ("" !== query) {
      setLoading(true);
      setTimeout(() => {
        refine("");
      }, 0)
    }
  }

  // Update loading state based on Algolia search status
  useEffect(() => {
    setLoading(status === 'loading');
  }, [status]);

  return (
    <View style={styles.container}>
      <View style={[
        styles.content,
        styles.mobileContent
      ]}>
        {/* Search Box */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by project, location..."
            value={searchText}
            onChangeText={handleSearchChange}
            placeholderTextColor="#9CA3AF"
            onSubmitEditing={handleSearchPress}
          />
        </View>

        {/* Search Button */}
        <View style={styles.filters}>
          <TouchableOpacity
            onPress={handleSearchPress}
          >
            {
              loading ?
                <ActivityIndicator />
                :
                <SearchIcon />
            }
          </TouchableOpacity>
        </View>

        {/* Clear Button */}
        {searchText.trim() &&
          <View style={styles.filters}>
            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearButton}
              disabled={loading}
            >
              <CloseIcon
                strokeColor='white' />
            </TouchableOpacity>
          </View>
        }

        {/* More Filters Button */}
        <View style={styles.filters}>
          <TouchableOpacity
            onPress={handleToggleMoreFilters}
          // style={styles.moreFiltersButton}
          >
            <FilterIcon />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.refinements}>
        {/* Applied Filters */}
        <CustomCurrentRefinements
          selectedLandmark={selectedLandmark}
          setSelectedLandmark={setSelectedLandmark}
        />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderBottomWidth: 0,
    borderBottomColor: '#E5E7EB',
    alignSelf: 'center',
    // backgroundColor: '#fff',
    paddingTop: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderRadius: 16,
  },
  contentWrapper: {
    flexDirection: 'column',
    // paddingHorizontal: 16,
    // paddingVertical: 8,
  },
  content: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  searchBox: {
    flex: 1,
  },
  searchInput: {
    height: 40, // fixed height
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#374151',
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
  },
  searchButton: {
    height: 40,
    flexDirection: 'column',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#153E3B',
  },
  clearButton: {
    height: 40,
    width: 40,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ff0000',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#EF4444',
  },
  moreFiltersButton: {
    height: 40,
    flexDirection: 'column',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  moreFiltersText: {
    fontFamily: 'Montserrat_500Medium',
    alignContent: 'center',
    justifyContent: 'center',
    top: 10,
    fontSize: 14,
    color: '#374151',
  },
  refinements: {
    // marginTop: 8,
    flexDirection: 'row',
    left: -15,
  },
  mobileContent: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
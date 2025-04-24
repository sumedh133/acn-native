import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSearchBox } from "react-instantsearch";
import CustomCurrentRefinements from "../CustomCurrentRefinements";
import CloseIcon from "@/assets/icons/svg/CloseIcon";
import SearchIcon from "@/assets/icons/svg/PropertiesPage/SearchIcon";
import FilterIcon from "@/assets/icons/svg/PropertiesPage/FilterIcon";

interface RequirementFiltersProps {
  handleToggleMoreFilters: () => void;
}

// const CustomSearchBox = () => {

//   return (
//     <View>
//     <View style={styles.searchBox}>
//       <TextInput
//         style={styles.searchInput}
//         placeholder="Search by project, location..."
//         value={searchText}
//         onChangeText={handleSearchChange}
//         placeholderTextColor="#9CA3AF"
//       />
//     </View>
//     {/* Search Button */}
//             <View style={styles.filters}>
//               <TouchableOpacity
//                 onPress={handleSearchPress}
//                 style={styles.searchButton}
//               >
//                 <Feather name="search" size={24} color="white" />
//               </TouchableOpacity>
//             </View>

//             {/* Clear Button */}
//             {searchText &&
//               <View style={styles.filters}>
//                 <TouchableOpacity
//                   onPress={handleClear}
//                   style={styles.clearButton}
//                 >
//                   <CloseIcon/>
//                 </TouchableOpacity>
//               </View>
//             }
//     </View>

//   );
// };

const RequirementFilters = ({
  handleToggleMoreFilters,
}: RequirementFiltersProps) => {
  const { query, refine } = useSearchBox();
  const [searchText, setSearchText] = useState(query);

  // Handle text input change
  const handleSearchChange = (text: string) => {
    setSearchText(text); // Update the local state with the new search text
  };

  // Handle search button press (refine action)
  const handleSearchPress = () => {
    if (searchText.trim() != query) {
      refine(searchText); // Trigger the refine action with the updated search text
    }
    Keyboard.dismiss(); // Dismiss the keyboard when searching
  };

  const handleClear = () => {
    setSearchText("");
    refine("");
  };
  return (
    <View style={styles.container} className="">
      <View style={styles.searchAndFiltersRow}>
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
          <TouchableOpacity onPress={handleSearchPress}>
            <SearchIcon />
          </TouchableOpacity>
        </View>

        {/* Clear Button */}
        {searchText && (
          <View style={styles.filters}>
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <CloseIcon strokeColor="white" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.filters}>
          <TouchableOpacity
            onPress={handleToggleMoreFilters}
            // style={styles.moreFiltersButton}
          >
            {/* <Feather name="filter" size={24} color="black" /> */}
            <FilterIcon />
          </TouchableOpacity>
        </View>
      </View>

      <CustomCurrentRefinements />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F5F6F7",
  },
  searchAndFiltersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBox: {
    flex: 1,
  },
  searchInput: {
    height: 40,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    color: "#374151",
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignContent: "center",
    alignSelf: "center",
  },
  searchButton: {
    height: 40,
    flexDirection: "column",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#153E3B",
  },
  clearButton: {
    height: 40,
    width: 40,
    flexDirection: "column",
    alignItems: "center",
    alignSelf: "center",
    alignContent: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ff0000",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#EF4444",
  },
  moreFiltersButton: {
    height: 40,
    flexDirection: "column",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  moreFiltersText: {
    fontFamily: "Montserrat_500Medium",
    alignContent: "center",
    justifyContent: "center",
    top: 10,
    fontSize: 14,
    color: "#374151",
  },
});

export default RequirementFilters;

import DropDownArrow from "@/assets/icons/svg/AddInventory/DropdownIcon";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  Pressable,
} from "react-native";

// Define a type for the dropdown options
interface UnitOption {
  label: string; // What displays in the UI
  value: string; // What's used in the data
}

interface TotalAskPricetProps {
  onPriceChange: (unit: string, price: number) => void; // Changed to number
  initialPrice?: number; // Changed to number
  title?: string;
  required: boolean;
  searchable?: boolean; // New prop for searchable dropdown
}

const TotalAskPrice: React.FC<TotalAskPricetProps> = ({
  onPriceChange,
  initialPrice = 0, // Default to 0 instead of empty string
  title,
  required,
  searchable = false, // Default to false
}) => {
  // Convert number to string for display
  const [price, setPrice] = useState(initialPrice ? initialPrice.toString() : "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Define the unit options with both label and value
  const unitOptions: UnitOption[] = [
    { label: "Total Ask Price", value: "totalAskPrice" },
    { label: "/Sq ft", value: "askPricePerSqft" },
  ];

  // Find the initial selected option based on the initialUnit value
  const initialSelectedOption = unitOptions[0];
  const [selectedOption, setSelectedOption] = useState<UnitOption>(
    initialSelectedOption
  );

  const [isFocused, setIsFocused] = useState(false);

  // Filter options based on search term
  const filteredOptions = searchTerm
    ? unitOptions.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : unitOptions;

  const handlePriceChange = (value: string) => {
    // Only allow numbers with commas and decimal points
    const validPrice = value.replace(/[^0-9.,]/g, "");
    setPrice(validPrice);

    if (onPriceChange) {
      // Convert string to number before passing to callback
      // Remove commas before converting to number
      const numericPrice = validPrice ? parseFloat(validPrice.replace(/,/g, "")) : 0;
      onPriceChange(selectedOption.value, numericPrice);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setModalVisible(!modalVisible);
  };

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
  };

  const handleSelect = (option: UnitOption) => {
    // Clear the old value with the previous unit
    onPriceChange(selectedOption.value, 0);

    // CHANGE HERE: Reset the price state to empty string
    setPrice("");
    
    setSelectedOption(option);
    setIsDropdownOpen(false);
    setModalVisible(false);

    // Since the price is now reset to empty, we're passing 0 to the callback
    onPriceChange(option.value, 0);
  };

  const selectUnit = (option: UnitOption) => {
    // Clear the old value with the previous unit
    onPriceChange(selectedOption.value, 0);

    // CHANGE HERE: Reset the price state to empty string
    setPrice("");
    
    setSelectedOption(option);
    setIsDropdownOpen(false);
    setModalVisible(false);

    // Since the price is now reset to empty, we're passing 0 to the callback
    onPriceChange(option.value, 0);
  };

  // Calculate the total in words (for display below the input)
  const getPriceInWords = (): string => {
    if (!price) 
      if (selectedOption.value === 'totalAskPrice' ) return "Eg. 2.20 Cr | 2 Crore 20 Lakh Rupees only";
      else return "Eg. 7.50 K | 7500 Rupees only";
    const numericPrice = parseFloat(price.replace(/,/g, ""));
    if (isNaN(numericPrice)) return "";

    if (numericPrice >= 10000000) {
      return `${(numericPrice / 10000000).toFixed(2)} Cr | ${numberToWords(
        numericPrice
      )}`;
    } else if (numericPrice >= 100000) {
      return `${(numericPrice / 100000).toFixed(2)} Lakh | ${numberToWords(
        numericPrice
      )}`;
    } else if (numericPrice >= 1000) {
      return `${(numericPrice / 1000).toFixed(2)} K | ${numberToWords(
        numericPrice
      )}`;
    }
    return numberToWords(numericPrice);
  };

  // Simple function to convert number to words (simplified for demonstration)
  const numberToWords = (num: number): string => {
    // This is a simplified implementation
    if (num >= 10000000) {
      return `${Math.floor(num / 10000000)} Crore ${Math.floor(
        (num % 10000000) / 100000
      )} Lakh Rupees only`;
    } else if (num >= 100000) {
      return `${Math.floor(num / 100000)} Lakh Rupees only`;
    }
    return `${num} Rupees only`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <Text style={styles.titleText}>
          {title}
          {required && <Text style={styles.compulsoryStar}> *</Text>}
        </Text>

        <View
          style={[
            styles.inputContainer,
            isFocused && styles.focusedInputContainer,
          ]}
        >
          {/* Rupee symbol */}
          <Text style={styles.rupeeSymbol}>₹</Text>

          {/* Input field */}
          <TextInput
            style={styles.textInput}
            value={price}
            onChangeText={handlePriceChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={selectedOption.value === 'totalAskPrice' ? "eg. 2,20,00,000" : "eg. 7,500"}
            placeholderTextColor="#A0A0A0"
            keyboardType="numeric"
          />

          {/* Dropdown button */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={toggleDropdown}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedOption.label}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Price in words */}
        <Text style={styles.priceInWords}>
          {getPriceInWords()}{" "}
          {selectedOption.value === "totalAskPrice" ? "" : "per sq ft"}
        </Text>

        {/* New dropdown UI */}
        {modalVisible && (
          <View style={styles.optionsContainer}>
            {searchable && (
              <TextInput
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={handleSearchChange}
                placeholder="Search..."
                placeholderTextColor="#6B7280"
              />
            )}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.optionItem,
                    hoveredItem === item.value && styles.hoveredOptionItem,
                    selectedOption.value === item.value &&
                      styles.selectedOptionItem,
                  ]}
                  onPress={() => handleSelect(item)}
                  onPressIn={() => setHoveredItem(item.value)}
                  onPressOut={() => setHoveredItem(null)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </Pressable>
              )}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={true}
              nestedScrollEnabled={true}
              style={styles.resultsList}
            />
          </View>
        )}
      </View>

      {/* Original Dropdown Modal (keeping for compatibility) */}
      <Modal
        visible={isDropdownOpen && !modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setIsDropdownOpen(false);
          setModalVisible(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setIsDropdownOpen(false);
            setModalVisible(false);
          }}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.dropdownList}>
              <FlatList
                data={unitOptions}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => selectUnit(item)}
                  >
                    <Text style={styles.dropdownItemText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
  },
  leftContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    marginBottom:6,
    color: "#000000",
    fontFamily:"Montserrat_600SemiBold",
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
    borderWidth: 1,
    borderColor: "#E1E3E6",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    height: 48,
    marginBottom: 4,
  },
  focusedInputContainer: {
    borderColor: "#2B3034",
    // backgroundColor: "rgba(0, 102, 255, 0.05)",
  },
  rupeeSymbol: {
    paddingLeft: 12,
    paddingRight: 4,
    fontSize: 16,
    color: "#757575",
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#000000",
    paddingLeft: 0,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    height: "100%",
    // borderLeftWidth: 1,
    borderLeftColor: "#E1E3E6",
    minWidth: 110, // Increased to accommodate longer text
  },
  dropdownButtonText: {
    fontSize: 14,
    color: "#000000",
    marginRight: 4,
  },
  dropdownIcon: {
    fontSize: 10,
    color: "#757575",
  },
  priceInWords: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
  },
  unitText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "400",
    marginBottom: 4,
  },
  totalPriceText: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownList: {
    width: "80%",
    maxHeight: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#000000",
  },
  // New styles for the added dropdown UI
  optionsContainer: {
    position: "absolute",
    top: 74,
    width: 140,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    padding: 4,
    marginTop: 1,
  },
  searchInput: {
    width: "100%",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E3E3E3",
    backgroundColor: "#FFFFFF",
    position: "relative",
    top: 0,
    fontFamily: "sans-serif",
    fontSize: 14,
  },
  resultsList: {
    width: "100%",
  },
  optionItem: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginVertical: 1,
    borderRadius: 6,
  },
  hoveredOptionItem: {
    backgroundColor: "#F2F2F2",
  },
  selectedOptionItem: {
    backgroundColor: "#DFF4F3",
  },
  optionText: {
    fontFamily: "sans-serif",
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 21,
    color: "#0A0B0A",
  },
});

export default TotalAskPrice;
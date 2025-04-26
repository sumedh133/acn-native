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
} from "react-native";

interface TotalAskPricetProps {
  onPriceChange: (price: string, unit: string) => void;
  initialPrice?: string;
  initialUnit?: string;
  title?: string;
  required: boolean;
}

const TotalAskPrice: React.FC<TotalAskPricetProps> = ({
  onPriceChange,
  initialPrice = "",
  initialUnit = "/Sqft",
  title,
  required,
}) => {
  const [price, setPrice] = useState(initialPrice);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(initialUnit);
  const [isFocused, setIsFocused] = useState(false);

  const units = ["/Sqft", "totalAskPrice"];

  const handlePriceChange = (value: string) => {
    // Only allow numbers with commas and decimal points
    const validPrice = value.replace(/[^0-9.,]/g, "");
    setPrice(validPrice);

    if (onPriceChange) {
      onPriceChange(selectedUnit,validPrice);
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
  };

  const selectUnit = (unit: string) => {
    onPriceChange(selectedUnit, "");
    setSelectedUnit(unit);
    setIsDropdownOpen(false);

    if (onPriceChange) {
      onPriceChange(unit, price);
    }
  };

  // Calculate the total in words (for display below the input)
  const getPriceInWords = (): string => {
    if (!price) return "";
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
            placeholder="eg. 2,000"
            placeholderTextColor="#A0A0A0"
            keyboardType="numeric"
          />

          {/* Dropdown button */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={toggleDropdown}
          >
            <Text style={styles.dropdownButtonText}>{selectedUnit}</Text>
            <Ionicons name="chevron-down" size={16} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Price in words */}
        <Text style={styles.priceInWords}>{price && getPriceInWords()}</Text>
      </View>

      {/* Right side display */}
      {/* <View style={styles.rightContainer}>
        <Text style={styles.unitText}>{selectedUnit}</Text>
        <Text style={styles.totalPriceText}>Total Price</Text>
      </View> */}

      {/* Dropdown Modal */}
      <Modal
        visible={isDropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.dropdownList}>
              <FlatList
                data={units}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => selectUnit(item)}
                  >
                    <Text style={styles.dropdownItemText}>{item}</Text>
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
    fontSize: 16,
    fontWeight: "600",
    // marginBottom: 8,
    color: "#000000",
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
    minWidth: 10,
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
});

export default TotalAskPrice;

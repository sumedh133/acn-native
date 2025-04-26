import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';

interface DropdownOption {
  label: string;
  value: string;
}

const CustomDropdown = ({ 
  options,
  selectedValue,
  onSelect,
  placeholder
}: {
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder: string;
}) => {
  const [visible, setVisible] = useState(false);
  
  const toggleDropdown = () => {
    setVisible(!visible);
  };

  const renderItem = ({ item }: { item: DropdownOption }) => (
    <TouchableOpacity 
      style={styles.dropdownItem} 
      onPress={() => {
        onSelect(item.value);
        setVisible(false);
      }}
    >
      <Text style={[
        styles.dropdownItemText,
        selectedValue === item.value && styles.selectedItemText
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const selectedOption = options.find(option => option.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <View>
      <TouchableOpacity 
        style={styles.dropdownButton} 
        onPress={toggleDropdown}
      >
        <Text style={selectedValue ? styles.dropdownButtonText : styles.placeholderText}>
          {displayText}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>
      
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.dropdownListContainer}>
            <FlatList
              data={options}
              renderItem={renderItem}
              keyExtractor={(item) => item.value}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Custom checkbox component
const CustomCheckbox = ({ 
  checked, 
  onToggle, 
  label 
}: { 
  checked: boolean; 
  onToggle: () => void; 
  label: string 
}) => {
  return (
    <TouchableOpacity 
      style={styles.checkboxRow} 
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const KhataComponent = ({ BuildingKhata = true }) => {
  const [buildingKhataValue, setBuildingKhataValue] = useState('');
  const [landKhataValue, setLandKhataValue] = useState('');
  
  // Checkbox states
  const [checkboxes, setCheckboxes] = useState({
    eKhata: false,
    biappaKhata: false,
    bdaKhata: false
  });

  // Function to toggle checkbox values
  const toggleCheckbox = (checkboxName: keyof typeof checkboxes) => {
    setCheckboxes(prev => ({
      ...prev,
      [checkboxName]: !prev[checkboxName]
    }));
  };

  // Sample dropdown options - replace with your actual data
  const khataOptions = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
    { label: 'Option 4', value: 'option4' },
    { label: 'Option 5', value: 'option5' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.dropdownsContainer}>
        {BuildingKhata ? (
          <View style={styles.columnLayout}>
            {/* Building Khata Section */}
            <View style={styles.section}>
              <View style={styles.headingContainer}>
                <Text style={styles.sectionHeading}>Building Khata</Text>
              </View>
              <View style={styles.dropdownContainer}>
                <CustomDropdown
                  options={khataOptions}
                  selectedValue={buildingKhataValue}
                  onSelect={(value: string) => setBuildingKhataValue(value)}
                  placeholder="Select"
                />
              </View>
            </View>

            {/* Land Khata Section */}
            <View style={styles.section}>
              <View style={styles.headingContainer}>
                <Text style={styles.sectionHeading}>Land Khata</Text>
              </View>
              <View style={styles.dropdownContainer}>
                <CustomDropdown
                  options={khataOptions}
                  selectedValue={landKhataValue}
                  onSelect={(value: string) => setLandKhataValue(value)}
                  placeholder="Select"
                />
              </View>
            </View>
          </View>
        ) : (
          // Only Land Khata - Full Width
          <View style={styles.fullWidthSection}>
            <View style={styles.headingContainer}>
              <Text style={styles.sectionHeading}>Land Khata</Text>
            </View>
            <View style={styles.dropdownContainer}>
              <CustomDropdown
                options={khataOptions}
                selectedValue={landKhataValue}
                onSelect={(value: string) => setLandKhataValue(value)}
                placeholder="Select"
              />
            </View>
          </View>
        )}
      </View>

      {/* Checkboxes Section */}
      <View style={styles.checkboxesContainer}>
        <CustomCheckbox
          checked={checkboxes.eKhata}
          onToggle={() => toggleCheckbox('eKhata')}
          label="E-Khata"
        />
        
        <CustomCheckbox
          checked={checkboxes.biappaKhata}
          onToggle={() => toggleCheckbox('biappaKhata')}
          label="BIAPPA approved khata"
        />
        
        <CustomCheckbox
          checked={checkboxes.bdaKhata}
          onToggle={() => toggleCheckbox('bdaKhata')}
          label="BDA approved khata"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  dropdownsContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 16,
  },
  columnLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  section: {
    width: '48%',
    marginBottom: 20,
  },
  fullWidthSection: {
    width: '100%',
  },
  headingContainer: {
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dropdownContainer: {
    marginTop: 5,
  },
  dropdownButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    color: '#333',
    fontSize: 16,
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownListContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 4,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedItemText: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  checkboxesContainer: {
    marginTop: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default KhataComponent;
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent, DimensionValue } from 'react-native';
import ArrowDownIcon from '../../assets/icons/arrow-down.svg';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { setPropertyStatus } from '@/store/slices/propertySlice';
import { useDispatch } from 'react-redux';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface Option {
  label: string;
  value: string;
}

interface DashboardDropdownProps {
  options: Option[];
  value: string | null;
  setValue: (value: string) => void;
  type?: 'requirement' | 'inventory';
  openDropdownUp: boolean,
  parent?: string,
  updatePropertySlice?: boolean
}

const DashboardDropdown: React.FC<DashboardDropdownProps> = ({
  options,
  value,
  setValue,
  type,
  openDropdownUp,
  parent,
  updatePropertySlice
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>("");
  const [dropdownTop, setDrodownTop] = useState<DimensionValue>(0);
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  useEffect(() => {
    const selected: string | null = options?.find(
      (option) => option?.value?.toLowerCase() === value?.toLowerCase()
    )?.label || value;
    setSelectedLabel(selected);
  }, [value, options]);

  const toggleDropdown = () => {
    if (value === "De-Listed") return; // Prevent opening if disabled
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    if (value !== option) {
      setValue(option);
      if (updatePropertySlice) {
        dispatch(setPropertyStatus(option));
      }
    }
    setIsOpen(false);
  };

  const handleDropdownLayout = (e: LayoutChangeEvent) => {
    if (openDropdownUp)
      setDrodownTop(-1 * e.nativeEvent.layout.height)
  }

  // Determine button style based on value
  const getButtonStyle = () => {
    if (value === "Pending" || value === "Available") {
      return styles.buttonAvailable;
    } else if (value === "Hold") {
      return styles.buttonHold;
    } else if (value === "De-Listed") {
      return styles.buttonDisabled;
    } else {
      return styles.buttonDeListed;
    }
  };

  return (
    <View style={{ ...styles.container }}>
      <TouchableOpacity
        style={[
          parent === "dashboardInventory" ? styles.dashboardInventoryButton : styles.button,
          getButtonStyle(),
          type === "requirement" ? styles.requirementButton : styles.inventoryButton
        ]}
        onPress={toggleDropdown}
        disabled={value === "De-Listed"}
      >
        {type === "requirement" && (
          <Ionicons name="chevron-down" size={16} color={value === 'Closed' ? "#FF0000" : "#153E3B"} />
        )}
        <Text style={styles.buttonText}>
          {selectedLabel}
        </Text>
        {type === "inventory" && (
          <Ionicons name="chevron-down" size={16} color={value === 'Closed' ? "#FF0000" : "#153E3B"} />
        )}
      </TouchableOpacity>
      {isOpen && (
        <StyledView className="absolute top-9 right-0 p-1 bg-white border border-gray-200 rounded-lg shadow-md z-2 min-w-[120px]"
          style={openDropdownUp ? { top: dropdownTop, opacity: dropdownTop ? 1 : 0 } : {}}
          onLayout={(e) => { handleDropdownLayout(e) }}>
          {options.map((option, index) => (
            <StyledTouchableOpacity
              key={index}
              className="rounded-md w-full px-3 py-2 mb-1"
              style={{ backgroundColor: option.value === value ? '#F2F2F2' : 'transparent' }}
              onPress={() => handleOptionClick(option.value)}
            >
              <StyledText className="font-medium text-sm text-black">
                {option.label}
              </StyledText>
            </StyledTouchableOpacity>
          ))}
        </StyledView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    overflow: 'visible',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
  },
  // New style for dashboardInventory parent
  dashboardInventoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,  // Using 8 instead of 6
    paddingHorizontal: 16,
    paddingVertical: 12, // Using 12 instead of 6
    gap: 8, // Using 8 instead of 6
  },
  requirementButton: {
    width: 100,
  },
  inventoryButton: {
    width: 114,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'sans-serif',
    fontWeight: '500',
    lineHeight: 21,
    textAlign: 'center',
    color: '#153E3B',
  },
  buttonAvailable: {
    backgroundColor: '#E0F7F4',
    borderColor: '#A3E6DE',
  },
  buttonHold: {
    backgroundColor: '#FBDD97',
    borderColor: '#E8B006',
  },
  buttonDisabled: {
    backgroundColor: '#D3D3D3',
    borderColor: '#A3A4A5',
    opacity: 0.5,
  },
  buttonDeListed: {
    backgroundColor: '#FCD5DC',
    borderColor: '#F9ABB9',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FAFAFA',
    borderRadius: 6,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  requirementDropdown: {
    width: 100,
  },
  inventoryDropdown: {
    width: 114,
  },
  option: {
    borderRadius: 6,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  optionText: {
    fontFamily: 'sans-serif',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 21,
    color: '#0A0B0A',
  },
});

export default DashboardDropdown;
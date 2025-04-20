import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, TouchableWithoutFeedback, BackHandler, LayoutChangeEvent, findNodeHandle } from 'react-native';
import { useRefinementList } from 'react-instantsearch';
import { Ionicons } from '@expo/vector-icons';

export interface RefinementItem {
  value: string;
  label: string;
  count: number;
  isRefined: boolean;
}

interface DropdownMoreFiltersProps {
  title: string;
  transformFunction?: (label: string) => string;
  items: RefinementItem[],
  refine: any,
  isAssetType?: boolean,
  isRight?: boolean,
}

const DropdownMoreFilters = ({
  title,
  items,
  refine,
  transformFunction,
  isAssetType = false,
  isRight
}: DropdownMoreFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownLayout, setDropdownLayout] = useState({ height: 0, width: 0 });
  const [maxItemWidth, setMaxItemWidth] = useState(0);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const buttonRef = useRef<View|null>(null);
  
  // Handle back button press on Android to close dropdown
  useEffect(() => {
    const backAction = () => {
      if (isOpen) {
        closeDropdown();
        return true; 
      }
      return false; 
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    if (!isOpen) {
      calculateButtonPosition();
      setTimeout(()=>{
        setModalVisible(true);
        setIsOpen(true);
      },0)
        
      // }
    } else {
      closeDropdown();
    }
  }, [isOpen]);

  const closeDropdown = useCallback(() => {
    setModalVisible(false);
    // Add a small delay before setting isOpen to false to allow modal animation
    setTimeout(() => {
      setIsOpen(false);
    }, 100);
  }, []);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setDropdownLayout({ height, width });
  }, []);

  const handleRefine = useCallback((value: string) => {
    refine(value);
  }, [refine]);
 
  const calculateButtonPosition= () => {
    if(buttonRef.current){
      buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setButtonPosition({ x: pageX, y: pageY + height });
      });
    }
  }

  // Calculate and track the width of the largest item
  const measureItemWidth = useCallback((item: RefinementItem) => {
   
    const labelWidth = (item.label.length * 8) + 50; // Base width + padding
    // const labelWidth = 20;
    const countWidth = (item.count.toString().length * 8) + 20; // Count width + padding
    const totalWidth = labelWidth + countWidth + 50; 
    
    if (totalWidth > maxItemWidth) {
      setMaxItemWidth(totalWidth);
    }
  }, [maxItemWidth]);

  // Calculate all item widths when items change
  useEffect(() => {
    items.forEach(item => measureItemWidth(item));
  }, [items, measureItemWidth]);

  const dropdownWidth = useMemo(() => {
    const baseWidth = Math.max(dropdownLayout.width, maxItemWidth);
    return isAssetType ? baseWidth * 0.7 : baseWidth * 0.65;
  }, [dropdownLayout.width, maxItemWidth, isAssetType,title]);

  const renderItems = useMemo(() => {
    return items.map((item, index) => {
      const isSelected = items.some(items => items.isRefined && items.label === item.label);

      return (
        <TouchableOpacity
          key={index}
          className="flex-row justify-between items-center py-2 pl-3 border-b border-gray-100"
          onPress={() => handleRefine(item.value)}
        >
          <View className="flex-row items-center flex-1">
            <View className={`w-4 h-4 ${isSelected ? 'bg-[#153E3B]' : 'border border-gray-300'} rounded mr-2 items-center justify-center`}>
              {isSelected && (
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              )}
            </View>
            <Text className="text-gray-800 mr-6">{item.label.split('-')[0]}{" "}{item.label.split('-')[1]}</Text>
          </View>
          <View className="mx-2">
            <Text className="text-xs text-gray-600 bg-[#e5e7eb] rounded-[4px] px-2">{item.count}</Text>
          </View>
        </TouchableOpacity>
      );
    });
  }, [items, handleRefine]);

  

  return (
    <View style={{ position: 'relative' }}>
      <TouchableOpacity
        ref={buttonRef}
        style={[
          styles.button,
          items?.length > 0 ? styles.defaultButton : styles.emptyButton,
          isOpen && styles.selectedButton,
        ]}
        onPress={items?.length > 0 ? handleToggle : () => {}}
        onLayout={handleLayout}
      >
        <Text className={isOpen ? "text-white" : "text-gray-700"}>
          {title}
        </Text>
        <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={16} color={isOpen ? "#FFFFFF" : "#666"} />
      </TouchableOpacity>
      
      
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeDropdown}
          animationType="none"
        >
          <TouchableWithoutFeedback onPress={closeDropdown}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          
          <View 
            style={{
              ...{
                position: 'absolute',
                top: buttonPosition.y,
                width: dropdownWidth,
                backgroundColor: 'white',
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                zIndex: 1000,
              },
              ...(isRight ? { right: 35} : { left: buttonPosition.x })
            }}
          >
            <ScrollView 
              style={{ maxHeight: 200 }}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {renderItems}
            </ScrollView>
          </View>
        </Modal>
     
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#666',
  },
  selectedButton: {
    backgroundColor: '#153E3B',
  },
  defaultButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0', // Gray border
  },
  emptyButton: {
    backgroundColor: '#e5e7eb', // Gray
    borderColor: 'e5e7eb',
    borderWidth: 1,
    color: '#f87171', // Red color for text
  },
  itemCount: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    color: '#666',
  },
});

export default React.memo(DropdownMoreFilters);
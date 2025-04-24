import React, { useRef, useEffect } from "react";
import { FlatList, View, Text, TouchableOpacity, ListRenderItem, ActivityIndicator, Platform } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { styled } from "nativewind";

const StyledFlatList = styled(FlatList<TabItem>); // Explicit typing for TabItem
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledView = styled(View);
const StyledText = styled(Text);

type TabItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  count: number;
  loading: boolean;
};

interface TabCarouselProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setBuffering: (buffer: boolean) => void;
  tabData: TabItem[];
  initialLoad: React.MutableRefObject<boolean>
}

const TabCarousel: React.FC<TabCarouselProps> = ({ activeTab, setActiveTab, setBuffering, tabData, initialLoad }) => {

  const isChangingTab = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  const handleTabChange = (tab: string) => {
    // Prevent rapid/multiple tab changes
    if (isChangingTab.current || tab === activeTab) return;
    
    isChangingTab.current = true;
    initialLoad.current = true;
    setBuffering(true);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // iOS needs special handling with slightly longer timeouts
    const delay = Platform.OS === 'ios' ? 100 : 50;
    
    // Set timeout to change tab
    timeoutRef.current = setTimeout(() => {
      setActiveTab(tab);
      
      // Add a second timeout to reset the changing state
      // This helps especially on iOS where state updates can be queued differently
      setTimeout(() => {
        isChangingTab.current = false;
      }, Platform.OS === 'ios' ? 150 : 50);
      
      timeoutRef.current = null;
    }, delay);
  };

  const renderTabItem: ListRenderItem<TabItem> = ({ item }) => {
    const isActive = activeTab === item.key;
    return (
      <StyledTouchableOpacity
        className={`p-5 rounded-2xl ${isActive ? "bg-[#153E3B]" : "bg-white border border-gray-300"
          }`}
        onPress={() => handleTabChange(item.key)}
        activeOpacity={0.9}
        style={{ minWidth: 200 }}
      >
        <StyledView className="flex flex-row items-center gap-[16px]">
          <StyledView
            className={`p-[9.3]  rounded-full ${isActive ? "bg-[#0E2C2A]" : "bg-[#EAF8F6]"
              }`}
          >
            {item?.icon}
          </StyledView>
          <StyledView className="flex flex-col items-start justify-center gap-[4px]">
            <StyledText
              className={`font-montserrat text-xs font-semibold ${isActive ? "text-white" : "text-gray-700"
                }`}
              style={{ marginLeft: 0, marginTop: 0 }}
            >
              {item.label}
            </StyledText>
            {item?.loading ?
              (
                <ActivityIndicator />
              ) :
              (
                <StyledText
                  className={`text-xl font-bold ${isActive ? "text-white" : "text-black"
                    }`}
                >
                  {item.count}
                </StyledText>
              )}
          </StyledView>
        </StyledView>
      </StyledTouchableOpacity>
    );
  };

  return (
    <StyledFlatList
      horizontal
      data={tabData}
      renderItem={renderTabItem}
      keyExtractor={(item) => item.key}
      contentContainerStyle={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingTop: 12,
        gap: 16
      }}
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, flexShrink: 0 }}
    />
  );
};

export default TabCarousel;
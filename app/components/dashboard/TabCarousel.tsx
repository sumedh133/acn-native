import React from "react";
import { FlatList, View, Text, TouchableOpacity, ListRenderItem, ActivityIndicator } from "react-native";
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
  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    initialLoad.current = true;
    setBuffering(true);
    setTimeout(() => setActiveTab(tab), 0);
  }

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
import React, { memo, useCallback } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
import { View } from "react-native";

interface PropertyTabs {
  text: string;
  slug: string;
}

const tabs: PropertyTabs[] = [
  {
    text: "Listed",
    slug: "listed",
  },
  {
    text: "Under Verification",
    slug: "pending",
  },
  {
    text: "Duplicate",
    slug: "duplicate",
  },
  {
    text: "Primary",
    slug: "primary",
  },
  {
    text: "Rejected",
    slug: "rejected",
  },
];

const TabItem = memo(
  ({
    item,
    isActive,
    count,
    onPress,
    loading,
  }: {
    item: PropertyTabs;
    isActive: boolean;
    count: number;
    onPress: () => void;
    loading: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.tab, isActive ? { backgroundColor: "#153E3B" } : {}]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, isActive ? { color: "#E3E3E3" } : {}]}>
        <Text>{item.text}</Text>
        {!loading && <Text>{` (${count || 0})`}</Text>}
      </Text>
    </TouchableOpacity>
  )
);

const PropertyTabCarousel = ({
  activeSlug,
  handleTabChange,
  counts,
  loading,
}: {
  activeSlug: string;
  handleTabChange: (slug: string) => void;
  counts: { [slug: string]: number };
  loading: boolean;
}) => {
  const keyExtractor = useCallback((item: PropertyTabs) => item.slug, []);

  const getItemPressHandler = useCallback(
    (slug: string) => () => {
      handleTabChange(slug);
    },
    [handleTabChange]
  );

  const renderItem = useCallback(
    ({ item }: { item: PropertyTabs }) => {
      const isActive = activeSlug === item?.slug;
      return (
        <TabItem
          isActive={isActive}
          item={item}
          count={counts?.[item?.slug]}
          onPress={getItemPressHandler(item?.slug)}
          loading={loading}
        />
      );
    },
    [activeSlug, counts, getItemPressHandler, loading]
  );

  return (
    <FlatList
      data={tabs}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      horizontal
      contentContainerStyle={styles.contentContainer}
      style={styles.container}
      showsHorizontalScrollIndicator={false}
      extraData={[activeSlug, counts, loading]}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  container: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 16,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  contentContainer: {
    backgroundColor: "#F5F6F7",
  },
  tab: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  tabText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
    color: "#2B3034B2",
  },
});
export default PropertyTabCarousel;

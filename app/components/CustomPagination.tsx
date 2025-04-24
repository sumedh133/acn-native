import React, { RefObject, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Keyboard, Dimensions, FlatList } from 'react-native';
import { useInstantSearch, usePagination } from 'react-instantsearch';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons'; // Assuming you're using Expo or have this library installed
import Animated from 'react-native-reanimated';

interface CustomPaginationProps {
  isSticky?: boolean;
  scrollRef?: RefObject<ScrollView | Animated.ScrollView> | null;
  analyticsEvent?: string;
  flatListRef?: RefObject<FlatList> | null;
}

export default function CustomPagination({
  isSticky = false,
  scrollRef = null,
  flatListRef = null,
  analyticsEvent = 'pagination_click'
}: CustomPaginationProps) {
  const [loading, setLoading] = useState(false);
  const { width } = Dimensions.get('window');
  const isMobile = width < 768; // This is just for consistency with the web version

  const {
    currentRefinement,
    nbPages,
    refine,
  } = usePagination();

  const { status } = useInstantSearch();

  useEffect(() => {
    if (status === 'loading' && loading === true) {
      if (scrollRef?.current)
        scrollRef.current.scrollTo({ y: 0, animated: true })
      if (flatListRef?.current)
        flatListRef.current.scrollToOffset({ animated: true, offset: 0 })
    }
    setLoading(status === 'loading');
  }, [status]);

  // Function to generate the pages to display in pagination
  const generatePages = () => {
    const pages = [];
    const pageWindow = isMobile ? 1 : 2; // Reduced from 3 to 2 for mobile screens
    const totalVisiblePages = 2 * pageWindow + 1;

    let startPage = Math.max(1, currentRefinement + 1 - pageWindow);
    let endPage = Math.min(nbPages, currentRefinement + 1 + pageWindow);

    // Adjust for pages near the start or end
    if (currentRefinement + 1 <= pageWindow) {
      endPage = Math.min(nbPages, totalVisiblePages);
    } else if (currentRefinement + 1 + pageWindow >= nbPages) {
      startPage = Math.max(1, nbPages - totalVisiblePages + 1);
    }

    // Add the first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("...");
    }

    // Add pages within the range
    for (let page = startPage; page <= endPage; page++) {
      pages.push(page);
    }

    // Add last page and ellipsis if needed
    if (endPage < nbPages) {
      if (endPage < nbPages - 1) pages.push("...");
      pages.push(nbPages);
    }

    return pages;
  };

  const pages = generatePages();

  const handlePageClick = (page: number) => {
    Keyboard.dismiss();
    setLoading(true);
    setTimeout(() => {
      refine(page - 1);
      // If you have analytics, you could implement it here
      // logEvent(analytics, analyticsEvent);
    }, 0);
  };

  return (
    <View style={[styles.container, isSticky && styles.stickyContainer]}>
      <View style={styles.paginationContainer}>
        {/* Previous Button */}
        <TouchableOpacity
          onPress={() => {
            if (currentRefinement > 0 && !loading) {
              handlePageClick(currentRefinement);
            }
          }}
          disabled={currentRefinement === 0 || loading}
          style={[
            styles.arrowButton,
            (currentRefinement === 0 || loading) && styles.disabledButton
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentRefinement === 0 || loading ? "#9CA3AF" : "#4B5563"}
          />
        </TouchableOpacity>

        {/* Page Numbers */}
        <View style={styles.pagesContainer}>
          {pages.map((page, index) =>
            page === "..." ? (
              <Text key={index} style={styles.ellipsis}>...</Text>
            ) : (
              <TouchableOpacity
                key={index}
                style={[
                  styles.pageButton,
                  currentRefinement === (page as number) - 1 && styles.activePage
                ]}
                onPress={() => handlePageClick(page as number)}
                disabled={loading || currentRefinement === (page as number) - 1}
              >
                <Text
                  style={[
                    styles.pageButtonText,
                    currentRefinement === (page as number) - 1 && styles.activePageText
                  ]}
                >
                  {page}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={() => {
            if (currentRefinement < nbPages - 1 && !loading) {
              handlePageClick(currentRefinement + 2);
            }
          }}
          disabled={currentRefinement === nbPages - 1 || loading}
          style={[
            styles.arrowButton,
            (currentRefinement === nbPages - 1 || loading) && styles.disabledButton
          ]}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={currentRefinement === nbPages - 1 || loading ? "#9CA3AF" : "#4B5563"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    width: '100%',
  },
  stickyContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowButton: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  pageButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activePage: {
    backgroundColor: '#737373',
    borderColor: '#737373',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
  },
  pageButtonText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    color: '#4B5563',
  },
  activePageText: {
    color: '#FFFFFF',
  },
  ellipsis: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    color: '#4B5563',
    paddingHorizontal: 8,
  },
});
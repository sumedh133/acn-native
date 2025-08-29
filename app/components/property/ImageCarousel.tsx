import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ImageViewing from "react-native-image-viewing";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import Video from "react-native-video";

interface ImageCarouselProps {
  images: string[];
  onImagePress?: () => void;
  propertyId?: string;
}

const { width } = Dimensions.get("window");

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  onImagePress,
  propertyId,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Format images for the image viewer
  const imageViewerImages = images.map((uri) => ({ uri }));

  // Ensure we re-render when images change
  useEffect(() => {
    if (activeIndex >= images.length) {
      setActiveIndex(0);
    }
  }, [images, activeIndex]);

  if (!images || images.length === 0) {
    return (
      <View style={styles.placeholderContainer}>
        <Ionicons name="image-outline" size={48} color="#CCCCCC" />
      </View>
    );
  }

  const handleImagePress = () => {
    try {
      logEvent(analytics, "property_image_fullscreen", {
        event_category: "property",
        event_label: "interaction",
        property_id: propertyId,
        image_index: activeIndex,
        total_images: images.length,
      });
    } catch (error) {
      console.error("Error logging image fullscreen:", error);
    }
    setIsImageViewVisible(true);
  };

  const renderItem = ({ item }: { item: string }) => {
    return (
      <View style={styles.imageItem}>
        <TouchableOpacity
          style={styles.imageTouchable}
          activeOpacity={0.9}
          onPress={handleImagePress}
        >
          
          {item.includes(".mp4") ? (
            <Video
              source={{ uri: item }}
              style={{ width: "100%", aspectRatio: 16 / 9 }}
              resizeMode="cover"
              paused={true} // Video is paused by default
              controls={true}
            />
          ) : (
            <Image
              source={{ uri: item }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const handlePageChange = (index: number) => {
    if (index >= 0 && index < images.length) {
      try {
        logEvent(analytics, "property_image_change", {
          event_category: "property",
          event_label: "interaction",
          property_id: propertyId,
          previous_index: activeIndex,
          new_index: index,
          total_images: images.length,
          navigation_method: "dot_click",
        });
      } catch (error) {
        console.error("Error logging image change:", error);
      }

      setActiveIndex(index);
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0,
      });
    }
  };

  // Enhanced scroll event handling
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.floor(contentOffsetX / width + 0.5);

    if (newIndex >= 0 && newIndex < images.length && newIndex !== activeIndex) {
      try {
        logEvent(analytics, "property_image_change", {
          event_category: "property",
          event_label: "interaction",
          property_id: propertyId,
          previous_index: activeIndex,
          new_index: newIndex,
          total_images: images.length,
          navigation_method: "swipe",
        });
      } catch (error) {
        console.error("Error logging image change:", error);
      }
      setActiveIndex(newIndex);
    }
  };

  // Navigation handlers
  const handlePrevious = () => {
    const newIndex = Math.max(0, activeIndex - 1);
    try {
      logEvent(analytics, "property_image_change", {
        event_category: "property",
        event_label: "interaction",
        property_id: propertyId,
        previous_index: activeIndex,
        new_index: newIndex,
        total_images: images.length,
        navigation_method: "arrow_previous",
      });
    } catch (error) {
      console.error("Error logging image change:", error);
    }
    handlePageChange(newIndex);
  };

  const handleNext = () => {
    const newIndex = Math.min(images.length - 1, activeIndex + 1);
    try {
      logEvent(analytics, "property_image_change", {
        event_category: "property",
        event_label: "interaction",
        property_id: propertyId,
        previous_index: activeIndex,
        new_index: newIndex,
        total_images: images.length,
        navigation_method: "arrow_next",
      });
    } catch (error) {
      console.error("Error logging image change:", error);
    }
    handlePageChange(newIndex);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate={Platform.OS === "ios" ? "normal" : 0.9}
        snapToInterval={width}
        snapToAlignment="center"
        disableIntervalMomentum={true}
        bounces={false}
        contentContainerStyle={styles.flatListContent}
        scrollEnabled={true}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        windowSize={3}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
      />

      {/* Center pagination dots */}
      <View style={styles.pagination}>
        {images.map((_, index) => (
          <TouchableOpacity
            key={index.toString()}
            onPress={() => handlePageChange(index)}
            style={styles.paginationDotContainer}
          >
            <View
              style={[
                styles.paginationDot,
                index === activeIndex && styles.activeDot,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Arrow navigation buttons */}
      {images.length > 1 && (
        <>
          <View style={styles.leftNav}>
            <TouchableOpacity
              style={[
                styles.bottomNavButton,
                activeIndex === 0 && styles.bottomNavButtonDisabled,
              ]}
              disabled={activeIndex === 0}
              onPress={handlePrevious}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={activeIndex === 0 ? "rgba(255,255,255,0.3)" : "#FFFFFF"}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.rightNav}>
            <TouchableOpacity
              style={[
                styles.bottomNavButton,
                activeIndex === images.length - 1 &&
                  styles.bottomNavButtonDisabled,
              ]}
              disabled={activeIndex === images.length - 1}
              onPress={handleNext}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={
                  activeIndex === images.length - 1
                    ? "rgba(255,255,255,0.3)"
                    : "#FFFFFF"
                }
              />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Full-screen image viewer */}
      <ImageViewing
        images={imageViewerImages}
        imageIndex={activeIndex}
        visible={isImageViewVisible}
        onRequestClose={() => setIsImageViewVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 240,
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  flatListContent: {
    // Ensure proper content layout
  },
  imageItem: {
    width,
    height: 240,
    overflow: "hidden",
  },
  imageTouchable: {
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    width: "100%",
    height: 240,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  pagination: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
  },
  paginationDotContainer: {
    padding: 2,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#B9C5C4",
  },
  activeDot: {
    backgroundColor: "#153E3B",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  // Bottom navigation buttons
  bottomNavContainer: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 10,
  },
  leftNav: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    left: 0,
    paddingLeft: 20,
    paddingBottom: 20,
    zIndex: 10,
  },
  rightNav: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    right: 0,
    paddingRight: 20,
    paddingBottom: 20,
    zIndex: 10,
  },
  bottomNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#153E3B",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomNavButtonDisabled: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
});

export default ImageCarousel;

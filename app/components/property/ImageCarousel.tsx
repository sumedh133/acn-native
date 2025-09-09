import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Text,
  Modal,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import Video, { VideoRef } from "react-native-video";
import deleteIcon from "../../../assets/icons/svg/PropertyListing/deleteIcon.svg";
import crossIcon from "../../../assets/icons/svg/PropertyListing/crossIcon.svg";
import { getIcon } from "@/utils/iconUtils";

// MediaItem interface
interface MediaItem {
  url: string;
  type: "image" | "video" | "document";
}

interface ImageCarouselProps {
  mediaItems: MediaItem[];
  onImagePress?: () => void;
  propertyId?: string;
  onDeleteFile?: (mediaItem: MediaItem, index: number) => void;
  canDeleteFile?: (index: number) => boolean;
  delete?: boolean;
}

const { width, height } = Dimensions.get("window");

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  mediaItems,
  onImagePress,
  propertyId,
  onDeleteFile,
  canDeleteFile,
  delete: allowDelete = false,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [playingVideoIndex, setPlayingVideoIndex] = useState<number | null>(
    null
  );
  const [lastTapTime, setLastTapTime] = useState<{ [key: number]: number }>({});
  const scrollRef = useRef<ScrollView>(null);
  const fullscreenScrollRef = useRef<ScrollView>(null);
  const thumbnailScrollRef = useRef<ScrollView>(null);

  // Filter out documents - only show images and videos
  const filteredMediaItems = mediaItems.filter(
    (item) => item.type !== "document"
  );

  // Auto-scroll to selected image in main carousel
  const scrollToImage = (index: number) => {
    if (scrollRef.current && filteredMediaItems.length > 0) {
      const clampedIndex = Math.max(
        0,
        Math.min(index, filteredMediaItems.length - 1)
      );
      scrollRef.current.scrollTo({
        x: clampedIndex * width,
        animated: true,
      });
    }
  };

  // Auto-scroll to selected image in fullscreen
  const scrollToFullscreenImage = (index: number) => {
    if (fullscreenScrollRef.current && filteredMediaItems.length > 0) {
      const clampedIndex = Math.max(
        0,
        Math.min(index, filteredMediaItems.length - 1)
      );
      fullscreenScrollRef.current.scrollTo({
        x: clampedIndex * width,
        animated: true,
      });
    }
  };

  // Auto-scroll thumbnail strip
  const scrollThumbnailToIndex = (index: number) => {
    if (thumbnailScrollRef.current && filteredMediaItems.length > 0) {
      const thumbnailWidth = 80;
      const spacing = 8;
      const clampedIndex = Math.max(
        0,
        Math.min(index, filteredMediaItems.length - 1)
      );
      const scrollPosition =
        clampedIndex * (thumbnailWidth + spacing) - width / 2 + 40;
      thumbnailScrollRef.current.scrollTo({
        x: Math.max(0, scrollPosition),
        animated: true,
      });
    }
  };

  // Handle scroll events to update selected index
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    const clampedIndex = Math.max(
      0,
      Math.min(currentIndex, filteredMediaItems.length - 1)
    );

    if (clampedIndex !== selectedIdx) {
      setSelectedIdx(clampedIndex);
      setPlayingVideoIndex(null); // Pause video when changing slides
    }
  };

  // Handle fullscreen scroll events
  const handleFullscreenScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    const clampedIndex = Math.max(
      0,
      Math.min(currentIndex, filteredMediaItems.length - 1)
    );

    if (clampedIndex !== selectedIdx) {
      setSelectedIdx(clampedIndex);
      setPlayingVideoIndex(null); // Pause video when changing slides
      scrollThumbnailToIndex(clampedIndex);
    }
  };

  if (!filteredMediaItems || filteredMediaItems.length === 0) {
    return (
      <View style={styles.placeholderContainer}>
        <Ionicons name="image-outline" size={48} color="#CCCCCC" />
        <Text style={styles.placeholderText}>No media available</Text>
      </View>
    );
  }

  const handleImagePress = () => {
    try {
      logEvent(analytics, `property_media_fullscreen`, {
        event_category: "property",
        event_label: "interaction",
        property_id: propertyId,
        media_index: selectedIdx,
        total_media: filteredMediaItems.length,
      });
    } catch (error) {
      console.error("Error logging media fullscreen:", error);
    }

    setPlayingVideoIndex(null);
    setShowFullscreenModal(true);

    // Scroll to current image in fullscreen after modal opens
    setTimeout(() => {
      scrollToFullscreenImage(selectedIdx);
      scrollThumbnailToIndex(selectedIdx);
    }, 300);
  };

  const handleThumbnailPress = (index: number, mediaItem: MediaItem) => {
    const clampedIndex = Math.max(
      0,
      Math.min(index, filteredMediaItems.length - 1)
    );
    const now = Date.now();
    const lastTap = lastTapTime[clampedIndex] || 0;

    if (now - lastTap < 300) {
      // Double tap detected - delete functionality
      if (canDeleteFile && canDeleteFile(clampedIndex) && onDeleteFile) {
        Alert.alert(
          "Delete Media",
          "Are you sure you want to delete this media?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                //setShowFullscreenModal(false);
                onDeleteFile(mediaItem, clampedIndex);
              },
            },
          ]
        );
      }
    } else {
      // Single tap - change active image
      setSelectedIdx(clampedIndex);
      setPlayingVideoIndex(null);
      scrollToFullscreenImage(clampedIndex);
    }

    setLastTapTime((prev) => ({ ...prev, [clampedIndex]: now }));
  };

  const handleVideoPress = (index: number) => {
    const clampedIndex = Math.max(
      0,
      Math.min(index, filteredMediaItems.length - 1)
    );
    if (playingVideoIndex === clampedIndex) {
      setPlayingVideoIndex(null);
    } else {
      setPlayingVideoIndex(clampedIndex);
    }
  };

  const moveLeft = () => {
    if (selectedIdx > 0) {
      const newIndex = selectedIdx - 1;
      setSelectedIdx(newIndex);
      setPlayingVideoIndex(null);
      if (showFullscreenModal) {
        scrollToFullscreenImage(newIndex);
        scrollThumbnailToIndex(newIndex);
      } else {
        scrollToImage(newIndex);
      }
    }
  };

  const moveRight = () => {
    if (selectedIdx < filteredMediaItems.length - 1) {
      const newIndex = selectedIdx + 1;
      setSelectedIdx(newIndex);
      setPlayingVideoIndex(null);
      if (showFullscreenModal) {
        scrollToFullscreenImage(newIndex);
        scrollThumbnailToIndex(newIndex);
      } else {
        scrollToImage(newIndex);
      }
    }
  };

  // Render main carousel content
  const renderMainContent = (mediaItem: MediaItem, index: number) => {
    const isVideoPlaying = playingVideoIndex === index && !showFullscreenModal;

    switch (mediaItem.type) {
      case "video":
        return (
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: mediaItem.url }}
              style={styles.video}
              resizeMode="cover"
              paused={!isVideoPlaying}
              controls={isVideoPlaying}
              poster={mediaItem.url}
              posterResizeMode="cover"
              onError={(error) => {
                console.error("Video load error:", error);
                setPlayingVideoIndex(null);
              }}
            />

            {!isVideoPlaying && (
              <TouchableOpacity
                style={styles.playButtonOverlay}
                activeOpacity={0.8}
                onPress={() => handleVideoPress(index)}
              >
                <View style={styles.playButton}>
                  <Ionicons name="play" size={24} color="white" />
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.videoIndicator}>
              <Ionicons name="videocam" size={14} color="white" />
              <Text style={styles.videoIndicatorText}>Video</Text>
            </View>
          </View>
        );

      default: // image
        return (
          <Image
            source={{ uri: mediaItem.url }}
            style={styles.image}
            resizeMode="cover"
          />
        );
    }
  };

  // Render fullscreen content
  const renderFullscreenContent = (mediaItem: MediaItem, index: number) => {
    const isVideoPlaying = playingVideoIndex === index && showFullscreenModal;

    switch (mediaItem.type) {
      case "video":
        return (
          <View style={styles.fullscreenVideoContainer}>
            <Video
              source={{ uri: mediaItem.url }}
              style={styles.fullscreenVideo}
              resizeMode="contain"
              paused={!isVideoPlaying}
              controls={isVideoPlaying}
              onError={(error) => {
                console.error("Fullscreen video error:", error);
                setPlayingVideoIndex(null);
              }}
            />

            {!isVideoPlaying && (
              <TouchableOpacity
                style={styles.fullscreenPlayButtonOverlay}
                activeOpacity={0.8}
                onPress={() => setPlayingVideoIndex(index)}
              >
                <View style={styles.fullscreenPlayButton}>
                  <Ionicons name="play" size={32} color="white" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        );

      default: // image
        return (
          <View style={styles.fullscreenImageContainer}>
            <Image
              source={{ uri: mediaItem.url }}
              style={styles.fullscreenImage}
              resizeMode="cover"
            />
          </View>
        );
    }
  };

  // Render thumbnail
  const renderThumbnail = (
    mediaItem: MediaItem,
    index: number,
    isActive: boolean
  ) => {
    return (
      <TouchableOpacity
        key={index}
        style={[styles.thumbnail]}
        onPress={() => {
          allowDelete && handleThumbnailPress(index, mediaItem);
        }}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: mediaItem.url }}
          style={styles.thumbnailImage}
          resizeMode="cover"
        />
        {mediaItem.type === "video" && (
          <View style={styles.thumbnailVideoIndicator}>
            <Ionicons name="videocam" size={10} color="white" />
          </View>
        )}
        {isActive && canDeleteFile && onDeleteFile && allowDelete && (
          <View style={styles.thumbnailDeleteIcon}>
            {getIcon("deleteIcon")}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Main Carousel */}
      <View style={styles.mainCarouselContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {filteredMediaItems.map((mediaItem, index) => (
            <TouchableOpacity
              key={index}
              style={styles.slide}
              activeOpacity={0.9}
              onPress={handleImagePress}
            >
              {renderMainContent(mediaItem, index)}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Navigation arrows */}
        {/* {selectedIdx > 0 && (
          <TouchableOpacity
            style={[styles.navButton, styles.leftNav]}
            onPress={moveLeft}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        )}

        {selectedIdx < filteredMediaItems.length - 1 && (
          <TouchableOpacity
            style={[styles.navButton, styles.rightNav]}
            onPress={moveRight}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        )} */}

        {/* Pagination dots */}
        <View style={styles.pagination}>
          {filteredMediaItems.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === selectedIdx && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Fullscreen Modal */}
      <Modal
        visible={showFullscreenModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowFullscreenModal(false);
          setPlayingVideoIndex(null);
          scrollToImage(selectedIdx);
        }}
      >
        <SafeAreaView style={styles.fullscreenContainer}>
          {/* Header */}
          <View style={styles.fullscreenHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowFullscreenModal(false);
                setPlayingVideoIndex(null);
                scrollToImage(selectedIdx);
              }}
              style={styles.closeButton}
            >
              {getIcon("crossIcon")}
            </TouchableOpacity>
            {/* <Text style={styles.fullscreenTitle}>
              {selectedIdx + 1} of {filteredMediaItems.length}
            </Text> */}
            <View style={styles.headerSpacer} />
          </View>

          {/* Main Fullscreen Content */}
          <View style={styles.fullscreenContent}>
            <ScrollView
              ref={fullscreenScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleFullscreenScroll}
              scrollEventThrottle={16}
            >
              {filteredMediaItems.map((mediaItem, index) => (
                <View
                  key={`fullscreen-${index}`}
                  style={styles.fullscreenSlide}
                >
                  {renderFullscreenContent(mediaItem, index)}
                </View>
              ))}
            </ScrollView>

            {/* Fullscreen Navigation arrows */}
            {/* {selectedIdx > 0 && (
              <TouchableOpacity
                style={[styles.fullscreenNavButton, styles.leftNav]}
                onPress={moveLeft}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-back" size={32} color="white" />
              </TouchableOpacity>
            )}

            {selectedIdx < filteredMediaItems.length - 1 && (
              <TouchableOpacity
                style={[styles.fullscreenNavButton, styles.rightNav]}
                onPress={moveRight}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-forward" size={32} color="white" />
              </TouchableOpacity>
            )} */}
          </View>

          {/* Thumbnail Strip */}
          <View style={styles.thumbnailContainer}>
            <ScrollView
              ref={thumbnailScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailScrollContainer}
            >
              {filteredMediaItems.map((mediaItem, index) =>
                renderThumbnail(mediaItem, index, index === selectedIdx)
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 240,
    width: "100%",
    position: "relative",
  },
  mainCarouselContainer: {
    height: 240,
    width: "100%",
    position: "relative",
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    height: 240,
    position: "relative",
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
  placeholderText: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 8,
  },
  videoContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  playButtonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 3,
  },
  videoIndicator: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  videoIndicatorText: {
    color: "white",
    fontSize: 10,
    fontWeight: "500",
    marginLeft: 3,
  },
  navButton: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  leftNav: {
    left: 16,
  },
  rightNav: {
    right: 16,
  },
  pagination: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 2,
    marginRight: 2,
  },
  activeDot: {
    backgroundColor: "#FFFFFF",
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Fullscreen styles
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  fullscreenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    left: 19,
    top: 32,
    padding: 6,
  },
  closeButton: {
    padding: 8,
    width: 40,
  },
  fullscreenTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  fullscreenContent: {
    flex: 1,
    position: "relative",
    paddingTop: 10,
    paddingBottom: 80,
  },
  fullscreenSlide: {
    width,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20, // Add side padding
    paddingVertical: 20,
  },
  fullscreenImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 336,
    height: 196,
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  fullscreenVideoContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: 336,
    height: 196,
  },
  fullscreenVideo: {
    width: "100%",
    height: "100%",
  },
  fullscreenPlayButtonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  fullscreenPlayButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 4,
  },
  fullscreenNavButton: {
    position: "absolute",
    top: "50%",
    marginTop: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  // Thumbnail styles
  thumbnailContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: "center",
  },

  thumbnailScrollContainer: {
    paddingHorizontal: 12, // Reduced from 16
    alignItems: "center",
  },
  thumbnail: {
    width: 60, // Reduced from 72
    height: 60, // Reduced from 54
    marginRight: 8, // Reduced from 8
    borderRadius: 4, // Reduced from 6
    overflow: "hidden",
    position: "relative",
  },
  activeThumbnail: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailVideoIndicator: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    width: 16,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  activeThumbnailOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 122, 255, 0.2)",
  },
  thumbnailDeleteIcon: {
    position: "absolute",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ImageCarousel;

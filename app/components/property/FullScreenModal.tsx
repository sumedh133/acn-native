import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Video from "react-native-video";
import { getIcon } from "@/utils/iconUtils";

// MediaItem interface
interface MediaItem {
  url: string;
  type: "image" | "video" | "document";
}

interface FullscreenModalProps {
  visible: boolean;
  mediaItems: MediaItem[];
  selectedIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  onDeleteFile?: (mediaItem: MediaItem, index: number) => void;
  canDeleteFile?: (index: number) => boolean;
}

const { width, height } = Dimensions.get("window");

const FullscreenModal: React.FC<FullscreenModalProps> = ({
  visible,
  mediaItems,
  selectedIndex,
  onClose,
  onIndexChange,
  onDeleteFile,
  canDeleteFile,
}) => {
  const [playingVideoIndex, setPlayingVideoIndex] = useState<number | null>(null);
  const [lastTapTime, setLastTapTime] = useState<{ [key: number]: number }>({});
  const fullscreenScrollRef = useRef<ScrollView>(null);
  const thumbnailScrollRef = useRef<ScrollView>(null);

  // Auto-scroll to selected image in fullscreen
  const scrollToFullscreenImage = (index: number) => {
    if (fullscreenScrollRef.current && mediaItems.length > 0) {
      const clampedIndex = Math.max(0, Math.min(index, mediaItems.length - 1));
      fullscreenScrollRef.current.scrollTo({
        x: clampedIndex * width,
        animated: true,
      });
    }
  };

  // Auto-scroll thumbnail strip
  const scrollThumbnailToIndex = (index: number) => {
    if (thumbnailScrollRef.current && mediaItems.length > 0) {
      const thumbnailWidth = 60;
      const spacing = 8;
      const clampedIndex = Math.max(0, Math.min(index, mediaItems.length - 1));
      const scrollPosition = clampedIndex * (thumbnailWidth + spacing) - width / 2 + 30;
      thumbnailScrollRef.current.scrollTo({
        x: Math.max(0, scrollPosition),
        animated: true,
      });
    }
  };

  // Handle fullscreen scroll events
  const handleFullscreenScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    const clampedIndex = Math.max(0, Math.min(currentIndex, mediaItems.length - 1));

    if (clampedIndex !== selectedIndex) {
      onIndexChange(clampedIndex);
      setPlayingVideoIndex(null); // Pause video when changing slides
      scrollThumbnailToIndex(clampedIndex);
    }
  };

  const handleThumbnailPress = (index: number, mediaItem: MediaItem) => {
    const clampedIndex = Math.max(0, Math.min(index, mediaItems.length - 1));
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
                onDeleteFile(mediaItem, clampedIndex);
              },
            },
          ]
        );
      }
    } else {
      // Single tap - change active image
      onIndexChange(clampedIndex);
      setPlayingVideoIndex(null);
      scrollToFullscreenImage(clampedIndex);
    }

    setLastTapTime((prev) => ({ ...prev, [clampedIndex]: now }));
  };

  const handleVideoPress = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, mediaItems.length - 1));
    if (playingVideoIndex === clampedIndex) {
      setPlayingVideoIndex(null);
    } else {
      setPlayingVideoIndex(clampedIndex);
    }
  };

  const moveLeft = () => {
    if (selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      onIndexChange(newIndex);
      setPlayingVideoIndex(null);
      scrollToFullscreenImage(newIndex);
      scrollThumbnailToIndex(newIndex);
    }
  };

  const moveRight = () => {
    if (selectedIndex < mediaItems.length - 1) {
      const newIndex = selectedIndex + 1;
      onIndexChange(newIndex);
      setPlayingVideoIndex(null);
      scrollToFullscreenImage(newIndex);
      scrollThumbnailToIndex(newIndex);
    }
  };

  const handleClose = () => {
    setPlayingVideoIndex(null);
    onClose();
  };

  // Effect to scroll to correct position when modal opens or index changes
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        scrollToFullscreenImage(selectedIndex);
        scrollThumbnailToIndex(selectedIndex);
      }, 300);
    }
  }, [visible, selectedIndex]);

  // Render fullscreen content
  const renderFullscreenContent = (mediaItem: MediaItem, index: number) => {
    const isVideoPlaying = playingVideoIndex === index;

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
                onPress={() => handleVideoPress(index)}
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
              resizeMode="contain"
            />
          </View>
        );
    }
  };

  // Render thumbnail
  const renderThumbnail = (mediaItem: MediaItem, index: number, isActive: boolean) => {
    return (
      <TouchableOpacity
        key={index}
        style={[styles.thumbnail]}
        onPress={() => handleThumbnailPress(index, mediaItem)}
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
        {isActive && (
          <View style={styles.thumbnailDeleteIcon}>
            {getIcon("deleteIcon")}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.fullscreenContainer}>
        {/* Header */}
        <View style={styles.fullscreenHeader}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
          >
            {getIcon("crossIcon")}
          </TouchableOpacity>
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
            {mediaItems.map((mediaItem, index) => (
              <View key={`fullscreen-${index}`} style={styles.fullscreenSlide}>
                {renderFullscreenContent(mediaItem, index)}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Thumbnail Strip */}
        <View style={styles.thumbnailContainer}>
          <ScrollView
            ref={thumbnailScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailScrollContainer}
          >
            {mediaItems.map((mediaItem, index) =>
              renderThumbnail(mediaItem, index, index === selectedIndex)
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    paddingHorizontal: 20,
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
    paddingHorizontal: 12,
    alignItems: "center",
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 8,
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
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
  thumbnailDeleteIcon: {
    position: "absolute",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FullscreenModal;
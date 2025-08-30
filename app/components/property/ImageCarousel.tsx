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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ImageViewing from "react-native-image-viewing";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";
import Video, { VideoRef } from "react-native-video";
import Swiper from 'react-native-swiper';
import { WebView } from 'react-native-webview';

// Add MediaItem interface
interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'document';
}

interface ImageCarouselProps {
  mediaItems: MediaItem[]; // Changed from images: string[]
  onImagePress?: () => void;
  propertyId?: string;
  onDeleteFile?: (mediaItem: MediaItem, index: number) => void; // Updated signature
  canDeleteFile?: (index: number) => boolean;
}

type MediaType = 'image' | 'video' | 'document';

const { width, height } = Dimensions.get("window");

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  mediaItems, // Changed from images
  onImagePress,
  propertyId,
  onDeleteFile,
  canDeleteFile,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [isVideoViewVisible, setIsVideoViewVisible] = useState(false);
  const [isDocumentViewVisible, setIsDocumentViewVisible] = useState(false);
  const [playingVideoIndex, setPlayingVideoIndex] = useState<number | null>(null);
  const [fullscreenMedia, setFullscreenMedia] = useState<MediaItem | null>(null);
  const swiperRef = useRef<Swiper>(null);
  const fullscreenVideoRef = useRef<VideoRef>(null);

  // Format images for the image viewer (only images)
  const imageViewerImages = mediaItems
    .map((item, index) => ({ uri: item.url, originalIndex: index }))
    .filter(item => {
      const mediaItem = mediaItems.find(m => m.url === item.uri);
      return mediaItem?.type === 'image';
    });

  // Helper function to get document icon
  const getDocumentIcon = (uri: string) => {
    const extension = uri.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return 'document-text';
      case 'doc':
      case 'docx':
        return 'document-text';
      case 'xls':
      case 'xlsx':
        return 'grid';
      case 'ppt':
      case 'pptx':
        return 'easel';
      case 'txt':
        return 'document-outline';
      default:
        return 'document';
    }
  };

  // Helper function to get file name from URL
  const getFileName = (url: string) => {
    return url.split('/').pop() || 'Document';
  };

  // Ensure we re-render when mediaItems change
  useEffect(() => {
    if (activeIndex >= mediaItems.length) {
      setActiveIndex(0);
    }
  }, [mediaItems, activeIndex]);

  // Pause video when sliding to different index
  useEffect(() => {
    if (playingVideoIndex !== null && playingVideoIndex !== activeIndex) {
      setPlayingVideoIndex(null);
    }
  }, [activeIndex]);

  if (!mediaItems || mediaItems.length === 0) {
    return (
      <View style={styles.placeholderContainer}>
        <Ionicons name="image-outline" size={48} color="#CCCCCC" />
      </View>
    );
  }

  const handleMediaPress = (index: number) => {
    const currentMedia = mediaItems[index];
    
    try {
      logEvent(analytics, `property_${currentMedia.type}_fullscreen`, {
        event_category: "property",
        event_label: "interaction",
        property_id: propertyId,
        media_index: index,
        total_media: mediaItems.length,
        media_type: currentMedia.type,
      });
    } catch (error) {
      console.error("Error logging media fullscreen:", error);
    }

    setFullscreenMedia(currentMedia);
    
    switch (currentMedia.type) {
      case 'image':
        setIsImageViewVisible(true);
        break;
      case 'video':
        setIsVideoViewVisible(true);
        break;
      case 'document':
        setIsDocumentViewVisible(true);
        break;
    }
  };

  const handleDeleteFile = (mediaItem: MediaItem, index: number) => {
    if (onDeleteFile) {
      onDeleteFile(mediaItem, index);
    }
  };

  const handleVideoPress = (index: number) => {
    if (playingVideoIndex === index) {
      // Pause video
      setPlayingVideoIndex(null);
    } else {
      // Play this video and pause others
      setPlayingVideoIndex(index);
    }
  };

  const handleIndexChanged = (index: number) => {
    if (index !== activeIndex) {
      try {
        logEvent(analytics, "property_media_change", {
          event_category: "property",
          event_label: "interaction",
          property_id: propertyId,
          previous_index: activeIndex,
          new_index: index,
          total_media: mediaItems.length,
          navigation_method: "swipe",
        });
      } catch (error) {
        console.error("Error logging media change:", error);
      }
      setActiveIndex(index);
    }
  };

  // Render each slide content based on media type
  const renderSlideContent = (mediaItem: MediaItem, index: number) => {
    const isVideoPlaying = playingVideoIndex === index;
    
    switch (mediaItem.type) {
      case 'video':
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
              onLoad={() => {
                // Video loaded successfully
                console.log("Video is loading", { uri: mediaItem.url });
              }}
              onError={(error) => {
                console.error('Video load error:', error);
                setPlayingVideoIndex(null);
              }}
            />
            
            {/* Play button overlay - only show when not playing */}
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

            {/* Video indicator and fullscreen button */}
            <View style={styles.mediaIndicators}>
              <View style={styles.videoIndicator}>
                <Ionicons name="videocam" size={16} color="white" />
                <Text style={styles.videoIndicatorText}>Video</Text>
              </View>
              <TouchableOpacity
                style={styles.fullscreenButton}
                onPress={() => handleMediaPress(index)}
                activeOpacity={0.8}
              >
                <Ionicons name="expand-outline" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'document':
        return (
          <TouchableOpacity
            style={styles.documentContainer}
            activeOpacity={0.8}
            onPress={() => handleMediaPress(index)}
          >
            <View style={styles.documentPreview}>
              <Ionicons 
                name={getDocumentIcon(mediaItem.url) as any} 
                size={48} 
                color="#6B7280" 
              />
              <Text style={styles.documentName} numberOfLines={2}>
                {getFileName(mediaItem.url)}
              </Text>
              <View style={styles.documentIndicator}>
                <Ionicons name="document-text" size={14} color="white" />
                <Text style={styles.documentIndicatorText}>Document</Text>
              </View>
            </View>
          </TouchableOpacity>
        );

      default: // image
        return (
          <TouchableOpacity
            style={styles.imageTouchable}
            activeOpacity={0.9}
            onPress={() => handleMediaPress(index)}
          >
            <Image
              source={{ uri: mediaItem.url }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Swiper
        ref={swiperRef}
        style={styles.wrapper}
        onIndexChanged={handleIndexChanged}
        index={activeIndex}
        loop={false}
        showsPagination={true}
        paginationStyle={styles.pagination}
        dotStyle={styles.paginationDot}
        activeDotStyle={styles.activeDot}
        showsButtons={mediaItems.length > 1}
        nextButton={
          <View style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </View>
        }
        prevButton={
          <View style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </View>
        }
        buttonWrapperStyle={styles.buttonWrapper}
        loadMinimal={true}
        loadMinimalSize={2}
        removeClippedSubviews={Platform.OS === 'android'}
      >
        {mediaItems.map((mediaItem, index) => (
          <View key={index} style={styles.slide}>
            {renderSlideContent(mediaItem, index)}
            
            {/* Delete button for individual item */}
            {canDeleteFile && canDeleteFile(index) && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteFile(mediaItem, index)}
                activeOpacity={0.8}
              >
                <View style={styles.deleteButtonInner}>
                  <Ionicons name="close" size={16} color="white" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </Swiper>

      {/* Full-screen image viewer */}
      <ImageViewing
        images={imageViewerImages}
        imageIndex={Math.max(0, imageViewerImages.findIndex(img => img.uri === fullscreenMedia?.url))}
        visible={isImageViewVisible}
        onRequestClose={() => setIsImageViewVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />

      {/* Full-screen video viewer */}
      <Modal
        visible={isVideoViewVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setIsVideoViewVisible(false)}
      >
        <SafeAreaView style={styles.fullscreenContainer}>
          <StatusBar hidden />
          <View style={styles.fullscreenHeader}>
            <TouchableOpacity
              onPress={() => setIsVideoViewVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.fullscreenTitle}>Video</Text>
          </View>
          
          <View style={styles.fullscreenVideoContainer}>
            <Video
              ref={fullscreenVideoRef}
              source={{ uri: fullscreenMedia?.url || '' }}
              style={styles.fullscreenVideo}
              resizeMode="contain"
              controls={true}
              paused={false}
              onError={(error) => {
                console.error('Fullscreen video error:', error);
                setIsVideoViewVisible(false);
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Full-screen document viewer */}
      <Modal
        visible={isDocumentViewVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setIsDocumentViewVisible(false)}
      >
        <SafeAreaView style={styles.fullscreenContainer}>
          <View style={styles.fullscreenHeader}>
            <TouchableOpacity
              onPress={() => setIsDocumentViewVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.fullscreenTitle} numberOfLines={1}>
              {getFileName(fullscreenMedia?.url || '')}
            </Text>
          </View>
          
          <View style={styles.fullscreenDocumentContainer}>
            <WebView
              source={{ uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fullscreenMedia?.url || '')}` }}
              style={styles.fullscreenDocument}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.documentLoading}>
                  <Ionicons name="document-text" size={48} color="#6B7280" />
                  <Text style={styles.documentLoadingText}>Loading document...</Text>
                </View>
              )}
              onError={() => {
                // Fallback to direct URL if Google Docs viewer fails
                console.log('Google Docs viewer failed, trying direct URL');
              }}
            />
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
  wrapper: {
    height: 240,
  },
  slide: {
    width,
    height: 240,
    position: "relative",
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
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 20,
  },
  deleteButtonInner: {
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  mediaIndicators: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  videoIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  videoIndicatorText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  fullscreenButton: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 6,
    borderRadius: 16,
  },
  documentContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  documentPreview: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  documentName: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  documentIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(107, 114, 128, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  documentIndicatorText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  pagination: {
    bottom: 12,
  },
  paginationDot: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  activeDot: {
    backgroundColor: "#FFFFFF",
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 3,
    marginRight: 3,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(21, 62, 59, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonWrapper: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 0,
    position: 'absolute',
    top: '50%',
    marginTop: -20,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  fullscreenHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  closeButton: {
    padding: 8,
  },
  fullscreenTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  fullscreenVideoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenVideo: {
    width: "100%",
    height: "100%",
  },
  fullscreenDocumentContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  fullscreenDocument: {
    flex: 1,
  },
  documentLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  documentLoadingText: {
    color: "#6B7280",
    fontSize: 16,
    marginTop: 12,
  },
});

export default ImageCarousel;
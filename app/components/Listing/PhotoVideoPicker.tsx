import React, { useState, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  Image,
  Modal,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import {
  launchImageLibrary,
  launchCamera,
  MediaType,
  ImagePickerResponse,
  Asset,
  CameraOptions,
  ImageLibraryOptions,
} from "react-native-image-picker";
import { Ionicons } from "@expo/vector-icons";
import Video, { VideoRef } from "react-native-video";
import Icon from "@/assets/icons/svg/PropertyListing/ListingFlow/PhotoVideoPicker.svg";
import { getIcon } from "@/utils/iconUtils";

// Emit object arrays (not strings) to the parent
type MediaObj = { uri: string; name?: string; type?: string; size?: number };

interface PhotoVideoPickerProps {
  onChange?: (data: { photos: MediaObj[]; videos: MediaObj[] }) => void;
  selectedMedia?: Asset[];
  setSelectedMedia?: (media: Asset[]) => void;
}

const PhotoVideoPicker: React.FC<PhotoVideoPickerProps> = ({
  onChange,
  selectedMedia = [],
  setSelectedMedia = () => {},
}) => {
  // const [selectedMedia, setSelectedMedia] = useState<Asset[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [playingVideoIndex, setPlayingVideoIndex] = useState<number | null>(
    null
  );
  const [lastTapTime, setLastTapTime] = useState<{ [key: number]: number }>({});

  const screenWidth = Dimensions.get("window").width;
  const maxVisiblePhotos = 6; // Show max 6 photos in 2x3 grid (5 photos + upload button)

  const fullscreenScrollRef = useRef<ScrollView>(null);
  const thumbnailScrollRef = useRef<ScrollView>(null);

  // Emit media upwards whenever local selection changes
  React.useEffect(() => {
    if (!onChange) return;
    const toObj = (m: Asset): MediaObj => ({
      uri: m.uri as string,
      name: m.fileName,
      type: m.type,
      size: m.fileSize,
    });
    const photos = selectedMedia
      .filter((m) =>
        m.type
          ? !m.type.startsWith("video")
          : !m.fileName?.toLowerCase().endsWith(".mp4")
      )
      .map(toObj);
    const videos = selectedMedia
      .filter((m) =>
        m.type
          ? m.type.startsWith("video")
          : m.fileName?.toLowerCase().endsWith(".mp4")
      )
      .map(toObj);
    onChange({ photos, videos });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMedia]);

  const openImageModal = (index: number): void => {
    setSelectedImageIndex(index);
    setPlayingVideoIndex(null);
    setModalVisible(true);

    // Scroll to selected image after modal opens
    setTimeout(() => {
      scrollToFullscreenImage(index);
      scrollThumbnailToIndex(index);
    }, 300);
  };

  const closeModal = (): void => {
    setModalVisible(false);
    setPlayingVideoIndex(null);
  };

  // Auto-scroll to selected image in fullscreen
  const scrollToFullscreenImage = (index: number) => {
    if (fullscreenScrollRef.current && selectedMedia.length > 0) {
      const clampedIndex = Math.max(
        0,
        Math.min(index, selectedMedia.length - 1)
      );
      fullscreenScrollRef.current.scrollTo({
        x: clampedIndex * screenWidth,
        animated: true,
      });
    }
  };

  // Auto-scroll thumbnail strip
  const scrollThumbnailToIndex = (index: number) => {
    if (thumbnailScrollRef.current && selectedMedia.length > 0) {
      const thumbnailWidth = 64;
      const spacing = 12;
      const clampedIndex = Math.max(
        0,
        Math.min(index, selectedMedia.length - 1)
      );
      const scrollPosition =
        clampedIndex * (thumbnailWidth + spacing) - screenWidth / 2 + 32;
      thumbnailScrollRef.current.scrollTo({
        x: Math.max(0, scrollPosition),
        animated: true,
      });
    }
  };

  // Handle fullscreen scroll events
  const handleFullscreenScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / screenWidth);
    const clampedIndex = Math.max(
      0,
      Math.min(currentIndex, selectedMedia.length - 1)
    );

    if (clampedIndex !== selectedImageIndex) {
      setSelectedImageIndex(clampedIndex);
      setPlayingVideoIndex(null); // Pause video when changing slides
      scrollThumbnailToIndex(clampedIndex);
    }
  };

  const handleThumbnailPress = (index: number, mediaItem: Asset) => {
    const clampedIndex = Math.max(0, Math.min(index, selectedMedia.length - 1));
    const now = Date.now();
    const lastTap = lastTapTime[clampedIndex] || 0;

    if (now - lastTap < 300) {
      // Double tap detected - delete functionality
      Alert.alert(
        "Delete Media",
        "Are you sure you want to delete this media?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              removeImage(clampedIndex);
              if (selectedMedia.length <= 1) {
                closeModal();
              } else if (clampedIndex >= selectedMedia.length - 1) {
                setSelectedImageIndex(selectedMedia.length - 2);
              }
            },
          },
        ]
      );
    } else {
      // Single tap - change active image
      setSelectedImageIndex(clampedIndex);
      setPlayingVideoIndex(null);
      scrollToFullscreenImage(clampedIndex);
    }

    setLastTapTime((prev) => ({ ...prev, [clampedIndex]: now }));
  };

  const handleVideoPress = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, selectedMedia.length - 1));
    if (playingVideoIndex === clampedIndex) {
      setPlayingVideoIndex(null);
    } else {
      setPlayingVideoIndex(clampedIndex);
    }
  };

  const removeImage = (index: number): void => {
    const updatedMedia = selectedMedia.filter((_, i) => i !== index);
    setSelectedMedia(updatedMedia);
  };

  // Render fullscreen content
  const renderFullscreenContent = (mediaItem: Asset, index: number) => {
    const isVideoPlaying = playingVideoIndex === index && modalVisible;
    const isVideo =
      mediaItem.type?.includes("video") ||
      mediaItem.fileName?.toLowerCase().includes(".mp4");

    if (isVideo && mediaItem.uri) {
      return (
        <View
          className="justify-center items-center relative bg-black"
          style={{ width: screenWidth - 40, height: screenWidth - 40 }}
        >
          <Video
            source={{ uri: mediaItem.uri }}
            style={{ width: "100%", height: "100%" }}
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
              className="absolute inset-0 justify-center items-center bg-black/30"
              activeOpacity={0.8}
              onPress={() => setPlayingVideoIndex(index)}
            >
              <View className="w-16 h-16 rounded-full bg-black/70 justify-center items-center pl-1">
                <Ionicons name="play" size={32} color="white" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    // Default to image
    return (
      <View
        className="justify-center items-center"
        style={{ width: screenWidth - 40, height: screenWidth - 40 }}
      >
        <Image
          source={{ uri: mediaItem.uri }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
        />
      </View>
    );
  };

  // Render enhanced thumbnail
  const renderEnhancedThumbnail = (
    mediaItem: Asset,
    index: number,
    isActive: boolean
  ) => {
    const isVideo =
      mediaItem.type?.includes("video") ||
      mediaItem.fileName?.toLowerCase().includes(".mp4");

    return (
      <TouchableOpacity
        key={index}
        className={`w-16 h-16 mr-3 rounded-lg overflow-hidden relative border-2 ${
          isActive ? "border-blue-500" : "border-transparent"
        }`}
        onPress={() => handleThumbnailPress(index, mediaItem)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: mediaItem.uri }}
          className="w-full h-full"
          resizeMode="cover"
        />
        {isVideo && (
          <View className="absolute top-0.5 right-0.5 bg-black/70 rounded-lg w-4 h-3 justify-center items-center">
            <Ionicons name="videocam" size={10} color="white" />
          </View>
        )}
        {isActive && (
          <View className="absolute top-0.5 left-0.5 rounded-lg justify-center items-center">
            {getIcon("deleteIcon")}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera to take photos.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      try {
        // For Android 13+ (API level 33+), use READ_MEDIA_IMAGES
        const permission =
          Platform.Version >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        const granted = await PermissionsAndroid.request(permission, {
          title: "Storage Permission",
          message: "This app needs access to your storage to select photos.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        });
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  const showImagePicker = (): void => {
    Alert.alert("Select Media", "Choose an option", [
      { text: "Camera", onPress: () => openCamera() },
      { text: "Photo Library", onPress: () => openGallery() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openCamera = async (): Promise<void> => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        "Permission Denied",
        "Camera permission is required to take photos."
      );
      return;
    }

    const options: CameraOptions = {
      mediaType: "mixed" as MediaType,
      maxWidth: 2000,
      maxHeight: 2000,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorMessage) {
        Alert.alert("Error", response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        const newMedia = response.assets[0];
        console.log("Camera - Selected media URI:", newMedia.uri);
        console.log("Camera - Selected media:", newMedia);

        if (newMedia.fileSize && newMedia.fileSize > 50 * 1024 * 1024) {
          Alert.alert("File Too Large", "Please select a file under 50MB");
          return;
        }
        setSelectedMedia([...selectedMedia, newMedia]);
      }
    });
  };

  const openGallery = async (): Promise<void> => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        "Permission Denied",
        "Storage permission is required to access photos."
      );
      return;
    }

    const options: ImageLibraryOptions = {
      mediaType: "mixed" as MediaType,
      maxWidth: 2000,
      maxHeight: 2000,
      selectionLimit: 10, // Allow multiple selection
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorMessage) {
        Alert.alert("Error", response.errorMessage);
        return;
      }

      if (response.assets) {
        console.log("Gallery - All selected media:", response.assets);

        const validMedia = response.assets.filter((asset: Asset) => {
          console.log("Gallery - Asset URI:", asset.uri);
          if (asset.fileSize && asset.fileSize > 50 * 1024 * 1024) {
            Alert.alert(
              "File Too Large",
              `${asset.fileName} is over 50MB and was skipped`
            );
            return false;
          }
          return true;
        });
        setSelectedMedia([...selectedMedia, ...validMedia]);
      }
    });
  };

  return (
    <View className="flex flex-col border rounded-lg border-[#E3E3E3] p-4 bg-white">
      {/* Header */}
      <View className="flex flex-row items-center justify-between mb-4">
        <View className="flex flex-row items-center gap-3">
          <View className="rounded-full border-[#E3E3E3] border p-2">
            <Icon width={20} height={20} />
          </View>
          <Text className="text-base font-medium text-gray-900">
            Photos & Videos
          </Text>
        </View>
        <Text className="text-sm text-gray-500">
          {selectedMedia.length} Photo{selectedMedia.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Photos Grid - 2x3 Layout */}
      <View className="flex flex-col gap-2">
        {/* First Row */}
        <View className="flex flex-row gap-2">
          {/* Upload Button */}
          <TouchableOpacity
            onPress={showImagePicker}
            className="border border-dashed border-[#E3E3E3] rounded-lg items-center justify-center flex-1 aspect-square"
          >
            <View className="w-8 h-8 border border-[#E3E3E3] rounded-lg items-center justify-center">
              <Text className="text-xl text-[#999999]">+</Text>
            </View>
          </TouchableOpacity>

          {/* First two photos */}
          {selectedMedia.slice(0, 2).map((media, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => openImageModal(index)}
              className="flex-1 aspect-square rounded-md overflow-hidden border border-[#006B5F]"
            >
              <Image
                source={{ uri: media.uri }}
                className="w-full h-full"
                resizeMode="cover"
                onError={(error) =>
                  console.log("Grid image loading error:", error)
                }
              />
            </TouchableOpacity>
          ))}

          {/* Empty slots for first row if needed */}
          {Array.from({ length: Math.max(0, 2 - selectedMedia.length) }).map(
            (_, index) => (
              <View
                key={`empty-top-${index}`}
                className="flex-1 aspect-square"
              />
            )
          )}
        </View>

        {/* Second Row */}
        {selectedMedia.length > 2 && (
          <View className="flex flex-row gap-2">
            {/* Next photos (indices 2, 3, 4) */}
            {selectedMedia.slice(2, 5).map((media, index) => {
              const actualIndex = index + 2;
              const isLast = actualIndex === 4 && selectedMedia.length > 5;

              return (
                <TouchableOpacity
                  key={actualIndex}
                  onPress={() => openImageModal(actualIndex)}
                  className="flex-1 aspect-square rounded-xl overflow-hidden border border-[#006B5F] relative"
                >
                  <Image
                    source={{ uri: media.uri }}
                    className="w-full h-full"
                    resizeMode="cover"
                    onError={(error) =>
                      console.log("Grid image loading error:", error)
                    }
                  />
                  {/* Show "+X more" overlay on last visible photo if there are more */}
                  {isLast && (
                    <View className="absolute inset-0 bg-black/50 rounded-md items-center justify-center w-full h-full">
                      <Text className="text-white font-bold text-[25px] font-lato-medium leading-[150%]">
                        +{selectedMedia.length - 5}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Empty slots for second row if needed */}
            {Array.from({
              length: Math.max(0, 3 - Math.max(0, selectedMedia.length - 2)),
            }).map((_, index) => (
              <View
                key={`empty-bottom-${index}`}
                className="flex-1 aspect-square"
              />
            ))}
          </View>
        )}
      </View>

      {/* Description Text - Only show if no photos selected */}
      {selectedMedia.length === 0 && (
        <View className="mt-4">
          <Text className="text-sm text-gray-700 text-center leading-5">
            Properties with photos & videos receive{" "}
            <Text className="text-red-500 font-semibold">5X</Text> more
            enquiries.
          </Text>
          <Text className="text-xs text-[#999999] text-center mt-1">
            JPEG, PNG, and MP4 formats, up to 50MB
          </Text>
        </View>
      )}

      {/* Enhanced Full Screen Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
        statusBarTranslucent={true}
      >
        <SafeAreaView className="flex-1 bg-black/90">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-10 pb-2">
            <TouchableOpacity onPress={closeModal} className="p-2 w-10">
              {getIcon("crossIcon")}
            </TouchableOpacity>
            <View className="w-10" />
          </View>

          {/* Main Fullscreen Content */}
          <View className="flex-1 relative pt-2 pb-20">
            <ScrollView
              ref={fullscreenScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleFullscreenScroll}
              scrollEventThrottle={16}
            >
              {selectedMedia.map((mediaItem, index) => (
                <View
                  key={`fullscreen-${index}`}
                  className="flex-1 justify-center items-center px-5 py-5"
                  style={{ width: screenWidth }}
                >
                  {renderFullscreenContent(mediaItem, index)}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Enhanced Thumbnail Strip */}
          <View className="absolute bottom-12 left-0 right-0 py-4 px-2 items-center">
            <ScrollView
              ref={thumbnailScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 12,
                alignItems: "center",
              }}
            >
              {/* Camera/Add Button */}
              <TouchableOpacity
                onPress={() => {
                  closeModal();
                  showImagePicker();
                }}
                className="w-16 h-16 mr-3 bg-gray-600/80 rounded-lg border-2 border-gray-600 justify-center items-center"
              >
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>

              {/* Enhanced Photo Thumbnails */}
              {selectedMedia.map((mediaItem, index) =>
                renderEnhancedThumbnail(
                  mediaItem,
                  index,
                  index === selectedImageIndex
                )
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default PhotoVideoPicker;

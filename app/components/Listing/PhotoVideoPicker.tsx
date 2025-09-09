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
import { trackEvent } from "@/app/services/logAnalyticsService";
import { deleteMediaFromProperty } from "@/app/services/property_services/propertyService";
import { usePathname } from "expo-router";

// Emit object arrays (not strings) to the parent
type MediaObj = { uri: string; name?: string; type?: string; size?: number };

interface PhotoVideoPickerProps {
  onChange?: (data: { photos: MediaObj[]; videos: MediaObj[] }) => void;
  selectedMedia?: Asset[];
  setSelectedMedia?: (media: Asset[]) => void;
  existingMedia?: { photos: string[]; videos: string[] };
  onExistingChange?: (data: { photos: string[]; videos: string[] }) => void;
  propertyId?: string; // For direct Firebase deletion
}

const PhotoVideoPicker: React.FC<PhotoVideoPickerProps> = ({
  onChange,
  selectedMedia = [],
  setSelectedMedia = () => {},
  existingMedia = { photos: [], videos: [] },
  onExistingChange,
  propertyId,
}) => {
  console.log(existingMedia);
  const inventoryStage = propertyId?.toLocaleLowerCase().startsWith("qc")
    ? "qc"
    : "verified";
  console.log(inventoryStage);
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

  // Existing remote media (URLs) state, synced from props
  const [existingState, setExistingState] = useState<{
    photos: string[];
    videos: string[];
  }>(existingMedia);

  React.useEffect(() => {
    setExistingState(existingMedia);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingMedia?.photos?.length, existingMedia?.videos?.length]);

  type UnifiedMedia = {
    uri: string;
    type: "image" | "video";
    origin: "existing" | "local";
    asset?: Asset;
  };

  const isVideoAsset = (m: Asset) =>
    m.type
      ? m.type.startsWith("video")
      : m.fileName?.toLowerCase().endsWith(".mp4");

  // Normalize URL to ensure renderable by RN Image/Video
  const normalizeUri = (input?: string | null): string => {
    let url = (input || "").trim();
    if (!url) return "";
    if (url.startsWith("//")) url = `https:${url}`;
    if (url.startsWith("http://")) url = url.replace("http://", "https://");
    // Handle Google Drive share links -> direct download
    const drive = url.match(
      /https?:\/\/drive\.google\.com\/file\/d\/([^/]+)\//
    );
    if (drive && drive[1]) {
      url = `https://drive.google.com/uc?export=download&id=${drive[1]}`;
    }
    // Encode spaces and unicode
    try {
      url = encodeURI(url);
    } catch {}
    return url;
  };

  const allMedia: UnifiedMedia[] = [
    ...existingState.photos.map((u) => ({
      uri: u,
      type: "image" as const,
      origin: "existing" as const,
    })),
    ...existingState.videos.map((u) => ({
      uri: u,
      type: "video" as const,
      origin: "existing" as const,
    })),
    ...selectedMedia.map((m) => ({
      uri: m.uri as string,
      type: isVideoAsset(m) ? ("video" as const) : ("image" as const),
      origin: "local" as const,
      asset: m,
    })),
  ];

  console.log("📱 PhotoVideoPicker allMedia debug:", {
    existingPhotos: existingState.photos.length,
    existingVideos: existingState.videos.length,
    selectedMediaCount: selectedMedia.length,
    totalAllMedia: allMedia.length,
    selectedMediaSample: selectedMedia
      .slice(0, 2)
      .map((m) => ({ uri: m.uri?.substring(0, 50), type: m.type })),
  });

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
    if (fullscreenScrollRef.current && allMedia.length > 0) {
      const clampedIndex = Math.max(0, Math.min(index, allMedia.length - 1));
      fullscreenScrollRef.current.scrollTo({
        x: clampedIndex * screenWidth,
        animated: true,
      });
    }
  };

  // Auto-scroll thumbnail strip
  const scrollThumbnailToIndex = (index: number) => {
    if (thumbnailScrollRef.current && allMedia.length > 0) {
      const thumbnailWidth = 64;
      const spacing = 12;
      const clampedIndex = Math.max(0, Math.min(index, allMedia.length - 1));
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
      Math.min(currentIndex, allMedia.length - 1)
    );

    if (clampedIndex !== selectedImageIndex) {
      setSelectedImageIndex(clampedIndex);
      setPlayingVideoIndex(null); // Pause video when changing slides
      scrollThumbnailToIndex(clampedIndex);
    }
  };

  const handleThumbnailPress = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, allMedia.length - 1));
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
              if (allMedia.length <= 1) {
                closeModal();
              } else if (clampedIndex >= allMedia.length - 1) {
                setSelectedImageIndex(Math.max(0, allMedia.length - 2));
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
    const clampedIndex = Math.max(0, Math.min(index, allMedia.length - 1));
    if (playingVideoIndex === clampedIndex) {
      setPlayingVideoIndex(null);
    } else {
      setPlayingVideoIndex(clampedIndex);
    }
  };

  const removeImage = async (index: number): Promise<void> => {
    try {
      trackEvent("remove_image").catch((error) =>
        console.error(`Error image remove scroll event: ${error}`)
      );
    } catch (error) {
      console.error(`Unexpected error: ${error}`);
    }
    const media = allMedia[index];
    console.log("🗑️ Removing media:", media, "at index:", index);
    console.log("🔍 Current existingState:", existingState);
    console.log("🔍 Current selectedMedia:", selectedMedia);
    if (!media) return;

    if (media.origin === "local") {
      const updated = selectedMedia.filter((m) => m.uri !== media.uri);
      console.log("🔄 Updated local selectedMedia:", updated);
      setSelectedMedia(updated);
    } else {
      // For existing media, delete directly from Firebase
      if (propertyId) {
        try {
          const mediaToDelete = {
            photos: media.type === "image" ? [media.uri] : [],
            videos: media.type === "video" ? [media.uri] : [],
            documents: [],
          };

          console.log("🔥 Deleting from Firebase:", mediaToDelete);
          await deleteMediaFromProperty(
            propertyId,
            mediaToDelete,
            inventoryStage
          );

          // Update local state after successful Firebase deletion
          const nextExisting = {
            photos:
              media.type === "image"
                ? existingState.photos.filter((u) => u !== media.uri)
                : existingState.photos,
            videos:
              media.type === "video"
                ? existingState.videos.filter((u) => u !== media.uri)
                : existingState.videos,
          };
          console.log(
            "🔄 Updated existing media after Firebase deletion:",
            nextExisting
          );
          setExistingState(nextExisting);
          onExistingChange?.(nextExisting);

          // CRITICAL: Also update rawMedia by calling onChange so deleted URL doesn't go to TUS
          if (onChange) {
            const toObj = (m: Asset): MediaObj => ({
              uri: m.uri as string,
              name: m.fileName,
              type: m.type,
              size: m.fileSize,
            });

            // Convert remaining existing URLs to MediaObj format
            const existingPhotosAsMediaObj = nextExisting.photos.map((url) => ({
              uri: url,
              name: `existing-photo-${Date.now()}`,
              type: "image/jpeg",
              size: 0,
            }));
            const existingVideosAsMediaObj = nextExisting.videos.map((url) => ({
              uri: url,
              name: `existing-video-${Date.now()}`,
              type: "video/mp4",
              size: 0,
            }));

            // Merge existing (after deletion) + selected local files
            const localPhotos = selectedMedia
              .filter(
                (m) =>
                  !(m.type
                    ? m.type.startsWith("video")
                    : m.fileName?.toLowerCase().endsWith(".mp4"))
              )
              .map(toObj);
            const localVideos = selectedMedia
              .filter((m) =>
                m.type
                  ? m.type.startsWith("video")
                  : m.fileName?.toLowerCase().endsWith(".mp4")
              )
              .map(toObj);

            const updatedData = {
              photos: [...existingPhotosAsMediaObj, ...localPhotos],
              videos: [...existingVideosAsMediaObj, ...localVideos],
            };
            console.log(
              "🔄 Calling onChange after Firebase deletion to update rawMedia:",
              updatedData
            );
            onChange(updatedData);
          }
        } catch (error) {
          console.error("❌ Failed to delete from Firebase:", error);
          // Still update local state even if Firebase fails
          const nextExisting = {
            photos:
              media.type === "image"
                ? existingState.photos.filter((u) => u !== media.uri)
                : existingState.photos,
            videos:
              media.type === "video"
                ? existingState.videos.filter((u) => u !== media.uri)
                : existingState.videos,
          };
          setExistingState(nextExisting);
          onExistingChange?.(nextExisting);

          // Also update rawMedia even on error so UI stays consistent
          if (onChange) {
            const toObj = (m: Asset): MediaObj => ({
              uri: m.uri as string,
              name: m.fileName,
              type: m.type,
              size: m.fileSize,
            });
            // Convert remaining existing URLs to MediaObj format
            const existingPhotosAsMediaObj = nextExisting.photos.map((url) => ({
              uri: url,
              name: `existing-photo-${Date.now()}`,
              type: "image/jpeg",
              size: 0,
            }));
            const existingVideosAsMediaObj = nextExisting.videos.map((url) => ({
              uri: url,
              name: `existing-video-${Date.now()}`,
              type: "video/mp4",
              size: 0,
            }));

            // Merge existing (after deletion) + selected local files
            const localPhotos = selectedMedia
              .filter(
                (m) =>
                  !(m.type
                    ? m.type.startsWith("video")
                    : m.fileName?.toLowerCase().endsWith(".mp4"))
              )
              .map(toObj);
            const localVideos = selectedMedia
              .filter((m) =>
                m.type
                  ? m.type.startsWith("video")
                  : m.fileName?.toLowerCase().endsWith(".mp4")
              )
              .map(toObj);

            const updatedData = {
              photos: [...existingPhotosAsMediaObj, ...localPhotos],
              videos: [...existingVideosAsMediaObj, ...localVideos],
            };
            console.log(
              "🔄 Calling onChange after error to update rawMedia:",
              updatedData
            );
            onChange(updatedData);
          }
        }
      } else {
        // Fallback to local-only deletion if no propertyId
        const nextExisting = {
          photos:
            media.type === "image"
              ? existingState.photos.filter((u) => u !== media.uri)
              : existingState.photos,
          videos:
            media.type === "video"
              ? existingState.videos.filter((u) => u !== media.uri)
              : existingState.videos,
        };
        console.log("🔄 Updated existing media (no propertyId):", nextExisting);
        setExistingState(nextExisting);
        onExistingChange?.(nextExisting);

        // Also update rawMedia for fallback case
        if (onChange) {
          const toObj = (m: Asset): MediaObj => ({
            uri: m.uri as string,
            name: m.fileName,
            type: m.type,
            size: m.fileSize,
          });
          // Convert remaining existing URLs to MediaObj format
          const existingPhotosAsMediaObj = nextExisting.photos.map((url) => ({
            uri: url,
            name: `existing-photo-${Date.now()}`,
            type: "image/jpeg",
            size: 0,
          }));
          const existingVideosAsMediaObj = nextExisting.videos.map((url) => ({
            uri: url,
            name: `existing-video-${Date.now()}`,
            type: "video/mp4",
            size: 0,
          }));

          // Merge existing (after deletion) + selected local files
          const localPhotos = selectedMedia
            .filter(
              (m) =>
                !(m.type
                  ? m.type.startsWith("video")
                  : m.fileName?.toLowerCase().endsWith(".mp4"))
            )
            .map(toObj);
          const localVideos = selectedMedia
            .filter((m) =>
              m.type
                ? m.type.startsWith("video")
                : m.fileName?.toLowerCase().endsWith(".mp4")
            )
            .map(toObj);

          const updatedData = {
            photos: [...existingPhotosAsMediaObj, ...localPhotos],
            videos: [...existingVideosAsMediaObj, ...localVideos],
          };
          console.log("🔄 Calling onChange for fallback case:", updatedData);
          onChange(updatedData);
        }
      }
    }
  };

  // Render fullscreen content
  const renderFullscreenContent = (mediaItem: UnifiedMedia, index: number) => {
    const isVideoPlaying = playingVideoIndex === index && modalVisible;
    const isVideo = mediaItem.type === "video";

    if (isVideo && mediaItem.uri) {
      return (
        <View
          className="justify-center items-center relative bg-black"
          style={{ width: screenWidth - 40, height: screenWidth - 40 }}
        >
          <Video
            source={{ uri: normalizeUri(mediaItem.uri) }}
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
          source={{ uri: normalizeUri(mediaItem.uri) }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
        />
      </View>
    );
  };

  // Render enhanced thumbnail
  const renderEnhancedThumbnail = (
    mediaItem: UnifiedMedia,
    index: number,
    isActive: boolean
  ) => {
    const isVideo = mediaItem.type === "video";

    return (
      <TouchableOpacity
        key={index}
        className={`w-16 h-16 mr-3 rounded-lg overflow-hidden relative border-2 ${
          isActive ? "border-blue-500" : "border-transparent"
        }`}
        onPress={() => handleThumbnailPress(index)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: normalizeUri(mediaItem.uri) }}
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
    try {
      trackEvent("open_image_picker").catch((error) => {
        console.error(`Error logging event: ${error}`);
      });
    } catch (error) {
      console.error(`Unexpected error: ${error}`);
    }

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
      selectionLimit: 50, // Allow multiple selection
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
          {allMedia.length} File{allMedia.length !== 1 ? "s" : ""}
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

          {/* First two media */}
          {allMedia.slice(0, 2).map((media, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => openImageModal(index)}
              className="flex-1 aspect-square rounded-md overflow-hidden border border-[#006B5F]"
            >
              <Image
                source={{ uri: normalizeUri(media.uri) }}
                className="w-full h-full"
                resizeMode="cover"
                onError={(error) =>
                  console.log("Grid image loading error:", error)
                }
              />
            </TouchableOpacity>
          ))}

          {/* Empty slots for first row if needed */}
          {Array.from({ length: Math.max(0, 2 - allMedia.length) }).map(
            (_, index) => (
              <View
                key={`empty-top-${index}`}
                className="flex-1 aspect-square"
              />
            )
          )}
        </View>

        {/* Second Row */}
        {allMedia.length > 2 && (
          <View className="flex flex-row gap-2">
            {/* Next photos (indices 2, 3, 4) */}
            {allMedia.slice(2, 5).map((media, index) => {
              const actualIndex = index + 2;
              const isLast = actualIndex === 4 && allMedia.length > 5;

              return (
                <TouchableOpacity
                  key={actualIndex}
                  onPress={() => openImageModal(actualIndex)}
                  className="flex-1 aspect-square rounded-xl overflow-hidden border border-[#006B5F] relative"
                >
                  <Image
                    source={{ uri: normalizeUri(media.uri) }}
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
                        +{allMedia.length - 5}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Empty slots for second row if needed */}
            {Array.from({
              length: Math.max(0, 3 - Math.max(0, allMedia.length - 2)),
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
      {allMedia.length === 0 && (
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
              {allMedia.map((mediaItem, index) => (
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
              {allMedia.map((mediaItem, index) =>
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

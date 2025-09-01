import React, { useState } from "react";
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
import Icon from "@/assets/icons/svg/PropertyListing/ListingFlow/PhotoVideoPicker.svg";

const PhotoVideoPicker: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<Asset[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const screenWidth = Dimensions.get("window").width;
  const maxVisiblePhotos = 5; // Show max 5 photos in grid (4 + upload button)

  const openImageModal = (index: number): void => {
    setSelectedImageIndex(index);
    setModalVisible(true);
  };

  const closeModal = (): void => {
    setModalVisible(false);
  };

  const removeImage = (index: number): void => {
    const updatedMedia = selectedMedia.filter((_, i) => i !== index);
    setSelectedMedia(updatedMedia);
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
        {selectedMedia.length > 0 && (
          <Text className="text-sm text-gray-500">
            {selectedMedia.length} Photo{selectedMedia.length > 1 ? "s" : ""}
          </Text>
        )}
      </View>

      {/* Photos Grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex flex-row"
      >
        {/* Upload Button */}
        <TouchableOpacity
          onPress={showImagePicker}
          className="border border-dashed border-[#E3E3E3] rounded-lg items-center justify-center w-20 h-20 mr-2"
        >
          <View className="w-8 h-8 border border-[#E3E3E3] rounded-lg items-center justify-center">
            <Text className="text-xl text-[#999999]">+</Text>
          </View>
        </TouchableOpacity>

        {/* Selected Photos */}
        {selectedMedia.slice(0, maxVisiblePhotos - 1).map((media, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => openImageModal(index)}
            className="mr-2"
          >
            <Image
              source={{ uri: media.uri }}
              style={{ width: 80, height: 80, borderRadius: 8 }}
              resizeMode="cover"
              onError={(error) =>
                console.log("Grid image loading error:", error)
              }
            />
          </TouchableOpacity>
        ))}

        {/* Show "+X more" if there are more photos */}
        {selectedMedia.length > maxVisiblePhotos - 1 && (
          <TouchableOpacity
            onPress={() => openImageModal(maxVisiblePhotos - 1)}
            className="relative"
          >
            <Image
              source={{ uri: selectedMedia[maxVisiblePhotos - 1].uri }}
              style={{ width: 80, height: 80, borderRadius: 8 }}
              resizeMode="cover"
              onError={(error) =>
                console.log("Overlay image loading error:", error)
              }
            />
            <View className="absolute inset-0 bg-black/50 rounded-lg items-center justify-center">
              <Text className="text-white font-semibold text-lg">
                +{selectedMedia.length - (maxVisiblePhotos - 1)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

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

      {/* Full Screen Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
        statusBarTranslucent={true}
      >
        <View className="flex-1 bg-black/90">
          {/* Header */}
          <View className="flex flex-row justify-between items-center p-4 pt-12 absolute top-0 left-0 right-0 z-10">
            <TouchableOpacity
              onPress={closeModal}
              className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
            >
              <Text className="text-white text-xl">✕</Text>
            </TouchableOpacity>

            <View className="bg-blue-600 px-3 py-1 rounded">
              <Text className="text-white text-sm font-medium">
                Frame {selectedImageIndex + 1}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                removeImage(selectedImageIndex);
                if (selectedMedia.length <= 1) {
                  closeModal();
                } else if (selectedImageIndex >= selectedMedia.length - 1) {
                  setSelectedImageIndex(selectedMedia.length - 2);
                }
              }}
              className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
            >
              <Text className="text-red-500 text-lg">🗑</Text>
            </TouchableOpacity>
          </View>

          {/* Main Image */}
          <View className="flex-1 justify-center items-center px-4">
            {selectedMedia[selectedImageIndex] && (
              <Image
                source={{ uri: selectedMedia[selectedImageIndex].uri }}
                style={{
                  width: screenWidth - 32,
                  height: screenWidth - 32,
                  borderRadius: 8,
                }}
                resizeMode="cover"
                onError={(error) => {
                  console.log("Image loading error:", error);
                  Alert.alert("Error", "Failed to load image");
                }}
                onLoad={() => console.log("Image loaded successfully")}
              />
            )}
            {!selectedMedia[selectedImageIndex] && (
              <View
                style={{
                  width: screenWidth - 32,
                  height: screenWidth - 32,
                  borderRadius: 8,
                }}
                className="bg-gray-800 items-center justify-center"
              >
                <Text className="text-white text-lg">Loading...</Text>
              </View>
            )}
          </View>

          {/* Bottom Thumbnail Strip */}
          <View className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex flex-row"
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {/* Camera/Add Button */}
              <TouchableOpacity
                onPress={() => {
                  closeModal();
                  showImagePicker();
                }}
                className="w-16 h-16 mr-3 bg-gray-800 rounded-lg items-center justify-center border-2 border-gray-600"
              >
                <Text className="text-white text-2xl">📷</Text>
              </TouchableOpacity>

              {/* Photo Thumbnails */}
              {selectedMedia.map((media, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  className={`mr-3 rounded-lg overflow-hidden ${
                    index === selectedImageIndex
                      ? "border-4 border-blue-500"
                      : "border-2 border-transparent"
                  }`}
                >
                  <Image
                    source={{ uri: media.uri }}
                    style={{ width: 64, height: 64 }}
                    resizeMode="cover"
                    onError={(error) =>
                      console.log("Thumbnail loading error:", error)
                    }
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Bottom Action Buttons */}
            <View className="flex flex-row justify-center mt-4">
              <TouchableOpacity
                onPress={closeModal}
                className="bg-gray-800 px-6 py-2 rounded-full"
              >
                <Text className="text-white font-medium">Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PhotoVideoPicker;

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from 'expo-document-picker';
import { UploadFileIcon } from "../../../../assets/icons/svg/PropertyListing/UploadFileIcon";
import ImageCarousel from "../../../components/property/ImageCarousel";
import {
  MultipleFilesUploadService,
  SelectedFile,
  UploadResult,
  MediaUploadData,
  FilePickerResult,
  MultipleUploadConfig
} from "../../../services/media_services/mediaService";
import { trackEvent } from "@/app/services/logAnalyticsService";

// Add MediaItem interface
interface MediaItem {
  url: string;
  type: "image" | "video" | "document";
}

const { width } = Dimensions.get("window");
const TUS_ENDPOINT = "https://tus-protocol-dot-iqol-crm.uc.r.appspot.com/files/"

interface PropertyImagesProps {
  images?: string[];
  onMediaUpdate?: (media: MediaUploadData) => void;
  currentMedia?: MediaUploadData;
  propId?: string;
  agentData?: any;
  previewType?: string
}

export const PropertyImages: React.FC<PropertyImagesProps> = ({
  images = [],
  onMediaUpdate,
  currentMedia = { photos: [], videos: [], documents: [] },
  propId = 'temp-prop-id',
  agentData,
  previewType
}) => {
  const [uploading, setUploading] = useState(false);

  // Create structured media array with type information (excluding documents)
  const createMediaItems = (): MediaItem[] => {
    const mediaItems: MediaItem[] = [];

    // Add legacy images (treat as photos)
    images.forEach((url) => {
      mediaItems.push({ url, type: "image" });
    });

    // Add current media with proper types (only photos and videos)
    currentMedia.photos.forEach(url => {
      mediaItems.push({ url, type: 'image' });
    });

    currentMedia.videos.forEach(url => {
      mediaItems.push({ url, type: 'video' });
    });

    return mediaItems;
  };

  const allMediaItems = createMediaItems();
  const hasAnyFiles = allMediaItems.length > 0;

  const openFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const files: FilePickerResult[] = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name || `file_${Date.now()}`,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size || 0,
        }));

        uploadFiles(files);
      }
    } catch (error) {
      console.error('File picker error:', error);
      Alert.alert('Error', 'Failed to pick files');
    }
  };

  const uploadFiles = async (files: FilePickerResult[]) => {
    if (files.length === 0) return;

    // Validate files first
    const validationErrors: string[] = [];
    const validFiles: FilePickerResult[] = [];

    files.forEach(file => {
      const validation = MultipleFilesUploadService.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        validationErrors.push(validation.error!);
      }
    });

    if (validationErrors.length > 0) {
      Alert.alert('Invalid Files', validationErrors.join('\n'));
      if (validFiles.length === 0) return;
    }

    setUploading(true);

    try {
      const uploadService = new MultipleFilesUploadService();
      const categorizedFiles = MultipleFilesUploadService.categorizeFilesByType(validFiles);

      // Prepare all files for upload with proper IDs
      const allFilesToUpload: Array<{
        file: FilePickerResult;
        type: keyof MediaUploadData;
      }> = [];

      Object.entries(categorizedFiles).forEach(([type, fileList]) => {
        fileList.forEach(file => {
          allFilesToUpload.push({
            file,
            type: type as keyof MediaUploadData
          });
        });
      });

      // Prepare files for TUS upload
      const selectedFiles: SelectedFile[] = allFilesToUpload.map(({ file, type }, index) => ({
        uri: file.uri,
        name: file.name,
        type: file.type,
        size: file.size,
        id: `${propId}-${type}-${file.name || Date.now()}-${index}`,
      }));

      // Configure upload
      const uploadConfig: MultipleUploadConfig = {
        endpoint: TUS_ENDPOINT,
        chunkSize: 1024 * 1024, // 2MB chunks
        maxConcurrent: 3,
        strategy: "parallel",
        resumable: true,
        retryAttempts: 2,
        metadata: {
          propId,
          userId: agentData?.cpId || "unknown",
        },
      };

      console.log('selected files', selectedFiles)

      // Start the upload
      const results = await uploadService.startBatchUpload(selectedFiles, uploadConfig);

      // Process results and categorize successful uploads
      const successfulUploads: MediaUploadData = {
        photos: [],
        videos: [],
        documents: [],
      };

      results.forEach((result: UploadResult, index: number) => {
        if (result.success && result.uploadUrl) {
          const { type } = allFilesToUpload[index];
          successfulUploads[type].push(result.uploadUrl);
        } else {trackEvent("media_error").catch((error) => {
                console.error(`Error logging event: ${error}`);
              });
          console.error(`Failed to upload ${selectedFiles[index].name}:`, result.error?.message || 'Unknown error');
        }
      });

      // Update media in form data
      if (onMediaUpdate) {
        const updatedMedia: MediaUploadData = {
          photos: [...currentMedia.photos, ...successfulUploads.photos],
          videos: [...currentMedia.videos, ...successfulUploads.videos],
          documents: [...currentMedia.documents, ...successfulUploads.documents],
        };
        onMediaUpdate(updatedMedia);
      }
      console.log('successfull', successfulUploads)

      // Show success message
      const totalSuccess = Object.values(successfulUploads).reduce((sum, arr) => sum + arr.length, 0);
      const totalFailed = validFiles.length - totalSuccess;

      if (totalSuccess > 0) {
        const message = totalSuccess === validFiles.length
          ? `All ${totalSuccess} files uploaded successfully!`
          : `${totalSuccess} files uploaded successfully`;
        Alert.alert('Upload Successful', message);
      }

      if (totalFailed > 0) {
        Alert.alert('Upload Issues', `${totalFailed} files failed to upload. Please try again.`);
      }

    } catch (error: any) {
      console.error('Upload failed:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = (fileUrl: string, fileType: keyof MediaUploadData) => {
    if (onMediaUpdate) {
      const updatedMedia = { ...currentMedia };
      updatedMedia[fileType] = updatedMedia[fileType].filter(url => url !== fileUrl);
      onMediaUpdate(updatedMedia);
    }
  };

  // Updated helper function to work with MediaItem structure (excluding documents)
  const getFileInfo = (mediaItem: MediaItem, index: number) => {
    let fileType: keyof MediaUploadData;
    let canDelete = true;

    const legacyImagesCount = images.length;

    if (index < legacyImagesCount) {
      // This is a legacy image, might not be deletable
      fileType = 'photos';
      canDelete = false;
    } else {
      // Current media item
      switch (mediaItem.type) {
        case "image":
          fileType = "photos";
          break;
        case "video":
          fileType = "videos";
          break;
        default:
          fileType = "photos";
      }
    }

    return { fileType, canDelete };
  };

  const handleDeleteFromCarousel = (mediaItem: MediaItem, index: number) => {
    const { fileType, canDelete } = getFileInfo(mediaItem, index);
    if (canDelete) {
      deleteFile(mediaItem.url, fileType);
    }
  };

  return (
    <View className="rounded-b-[16px] bg-white overflow-hidden">
      {hasAnyFiles ? (
        <View>
          {/* Enhanced Media Carousel for Images and Videos only */}
          {allMediaItems.length > 0 && (
            <View className="relative">
              <ImageCarousel
                mediaItems={allMediaItems}
                propertyId={propId}
                onDeleteFile={handleDeleteFromCarousel}
                canDeleteFile={(index) =>
                  getFileInfo(allMediaItems[index], index).canDelete
                }
              />
            </View>
          )}

        </View>
      ) : (
        <LinearGradient
          colors={["#E0F7F4", "#FFFFFF"]}
          locations={[0.0891, 0.7814]}
          className="w-full rounded-b-[16px] border-b border-[#EBEBEB]"
        >
          <View className="flex flex-col items-center justify-center space-y-4 px-3 py-4 mt-6">
            <Image
              source={require("../../../../assets/icons/no-image-icon.webp")}
              className="w-24 h-24"
            />
            <View className="flex flex-col items-center justify-center">
              <Text className="text-sm font-bold text-black">
                No Images Found
              </Text>
              {previewType === 'myBusiness' && (<Text className="text-sm font-medium text-[#757575] pb-3">
                Generally properties with images gets 5x enquires.
              </Text>)}
              {(previewType == 'add' || previewType == 'edit' || previewType === 'myBusiness') && (
                <TouchableOpacity
                  onPress={openFilePicker}
                  className="bg-[#2D5A52] px-6 py-[9px] rounded-lg flex-row items-center space-x-2"
                  activeOpacity={0.8}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <UploadFileIcon size={18} color="white" />
                  )}
                  <Text className="text-white font-semibold text-sm">
                    {uploading ? 'Uploading...' : 'Add Now'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      )}
    </View>
  );
};